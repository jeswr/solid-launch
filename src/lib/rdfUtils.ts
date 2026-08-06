import { Parser, Store, DataFactory } from 'n3';
import axios from 'axios';

const { namedNode } = DataFactory;

export interface SolidApp {
  id: string;
  name: string;
  description: string;
  homepage: string;
  category: string;
  image?: string;
  source?: string;
}

// RDF predicates
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
const DCT_DESCRIPTION = 'http://purl.org/dc/terms/description';
const FOAF_HOMEPAGE = 'http://xmlns.com/foaf/0.1/homepage';
const SCHEMA_CATEGORY = 'http://schema.org/category';
const SCHEMA_IMAGE = 'http://schema.org/image';
const SOLID_APP = 'http://www.w3.org/ns/solid/terms#App';

// Additional catalog-specific predicates
const DCT_TITLE = 'http://purl.org/dc/terms/title';
const DOAP_HOMEPAGE = 'http://usefulinc.com/ns/doap#homepage';
const FOAF_DEPICTION = 'http://xmlns.com/foaf/0.1/depiction';
const DOAP_DESCRIPTION = 'http://usefulinc.com/ns/doap#description';

// External catalog predicates
const EX_SOFTWARE = 'https://catalog.solidproject.org/terms#Software';
const EX_NAME = 'https://catalog.solidproject.org/terms#name';
const EX_DESCRIPTION = 'https://catalog.solidproject.org/terms#description';
const EX_LANDING_PAGE = 'https://catalog.solidproject.org/terms#landingPage';
const EX_LOGO = 'https://catalog.solidproject.org/terms#logo';
const EX_SUBTYPE = 'https://catalog.solidproject.org/terms#subType';

export async function fetchAndParseRDF(url: string, source: string): Promise<SolidApp[]> {
  try {
    let rdfData: string;
    
    if (url.startsWith('http')) {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'text/turtle, application/n-triples, application/ld+json'
        }
      });
      rdfData = response.data;
    } else {
      // For local files, fetch from public directory
      const response = await fetch(url);
      rdfData = await response.text();
    }

    // Set base IRI for parsing relative URLs
    const baseIRI = url.startsWith('http') ? url : `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}${url}`;
    const parser = new Parser({ baseIRI });
    const store = new Store();
    
    return new Promise((resolve, reject) => {
      parser.parse(rdfData, (error, quad) => {
        if (error) {
          reject(error);
          return;
        }
        
        if (quad) {
          store.addQuad(quad);
        } else {
          // Parsing complete
          const apps = extractAppsFromStore(store, source);
          resolve(apps);
        }
      });
    });
  } catch (error) {
    console.error(`Error fetching RDF from ${url}:`, error);
    return [];
  }
}

function extractAppsFromStore(store: Store, source: string): SolidApp[] {
  const apps: SolidApp[] = [];
  
  // Find all subjects that are of type solid:App or ex:Software
  const solidAppSubjects = store.getSubjects(namedNode(RDF_TYPE), namedNode(SOLID_APP), null);
  const exSoftwareSubjects = store.getSubjects(namedNode(RDF_TYPE), namedNode(EX_SOFTWARE), null);
  
  const appSubjects = [...solidAppSubjects, ...exSoftwareSubjects];
  
  appSubjects.forEach(subject => {
    const app: SolidApp = {
      id: subject.value,
      name: '',
      description: '',
      homepage: '',
      category: 'Other',
      source
    };
    
    // Get name (try multiple predicates)
    const label = store.getObjects(subject, namedNode(RDFS_LABEL), null)[0];
    const title = store.getObjects(subject, namedNode(DCT_TITLE), null)[0];
    const exName = store.getObjects(subject, namedNode(EX_NAME), null)[0];
    app.name = label?.value || title?.value || exName?.value || 'Unnamed App';
    
    // Get description (try multiple predicates)
    const dctDesc = store.getObjects(subject, namedNode(DCT_DESCRIPTION), null)[0];
    const doapDesc = store.getObjects(subject, namedNode(DOAP_DESCRIPTION), null)[0];
    const exDesc = store.getObjects(subject, namedNode(EX_DESCRIPTION), null)[0];
    app.description = dctDesc?.value || doapDesc?.value || exDesc?.value || 'No description available';
    
    // Get homepage (try multiple predicates)
    const foafHomepage = store.getObjects(subject, namedNode(FOAF_HOMEPAGE), null)[0];
    const doapHomepage = store.getObjects(subject, namedNode(DOAP_HOMEPAGE), null)[0];
    const exLandingPage = store.getObjects(subject, namedNode(EX_LANDING_PAGE), null)[0];
    app.homepage = foafHomepage?.value || doapHomepage?.value || exLandingPage?.value || subject.value;
    
    // Get category
    const category = store.getObjects(subject, namedNode(SCHEMA_CATEGORY), null)[0];
    const exSubtype = store.getObjects(subject, namedNode(EX_SUBTYPE), null)[0];
    if (category) {
      app.category = category.value;
    } else if (exSubtype) {
      // Map external catalog subtypes to our categories
      const subtypeValue = exSubtype.value;
      if (subtypeValue.includes('ProductivityApp')) app.category = 'Productivity';
      else if (subtypeValue.includes('LeisureApp')) app.category = 'Media & Entertainment';
      else if (subtypeValue.includes('DeveloperTool')) app.category = 'Development Tools';
      else if (subtypeValue.includes('PodManagement')) app.category = 'Pod Management';
      else app.category = 'Other';
    }
    
    // Get image (try multiple predicates)
    const schemaImage = store.getObjects(subject, namedNode(SCHEMA_IMAGE), null)[0];
    const foafDepiction = store.getObjects(subject, namedNode(FOAF_DEPICTION), null)[0];
    const exLogo = store.getObjects(subject, namedNode(EX_LOGO), null)[0];
    let imageUrl = schemaImage?.value || foafDepiction?.value || exLogo?.value;
    
    // Handle relative URLs that were resolved by the parser
    if (imageUrl) {
      // If it's a local URL that was resolved to a full URL, extract the path
      if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
        const url = new URL(imageUrl);
        imageUrl = url.pathname;
      }
      // If it starts with the base URL path, make it relative
      else if (imageUrl.startsWith('http://localhost:3000/') || imageUrl.startsWith('https://localhost:3000/')) {
        imageUrl = imageUrl.replace(/https?:\/\/localhost:3000/, '');
      }
      // Keep external URLs as is
      app.image = imageUrl;
    }
    
    apps.push(app);
  });
  
  return apps;
}

export async function loadAllApps(): Promise<SolidApp[]> {
  const sources = [
    { url: '/local-apps.ttl', source: 'Local Database' },
    { url: '/api/proxy/solid/catalog/refs/heads/main/catalog-data.ttl', source: 'Solid Catalog' }
  ];
  
  const allApps: SolidApp[] = [];
  
  for (const { url, source } of sources) {
    try {
      const apps = await fetchAndParseRDF(url, source);
      allApps.push(...apps);
    } catch (error) {
      console.error(`Failed to load apps from ${source}:`, error);
    }
  }
  
  // Remove duplicates based on homepage
  const uniqueApps = new Map<string, SolidApp>();
  allApps.forEach(app => {
    if (!uniqueApps.has(app.homepage) || app.source === 'Local Database') {
      uniqueApps.set(app.homepage, app);
    }
  });
  
  return Array.from(uniqueApps.values());
}