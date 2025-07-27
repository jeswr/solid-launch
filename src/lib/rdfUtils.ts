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

    const parser = new Parser();
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
  
  // Find all subjects that are of type solid:App
  const appSubjects = store.getSubjects(namedNode(RDF_TYPE), namedNode(SOLID_APP), null);
  
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
    app.name = label?.value || title?.value || 'Unnamed App';
    
    // Get description (try multiple predicates)
    const dctDesc = store.getObjects(subject, namedNode(DCT_DESCRIPTION), null)[0];
    const doapDesc = store.getObjects(subject, namedNode(DOAP_DESCRIPTION), null)[0];
    app.description = dctDesc?.value || doapDesc?.value || 'No description available';
    
    // Get homepage (try multiple predicates)
    const foafHomepage = store.getObjects(subject, namedNode(FOAF_HOMEPAGE), null)[0];
    const doapHomepage = store.getObjects(subject, namedNode(DOAP_HOMEPAGE), null)[0];
    app.homepage = foafHomepage?.value || doapHomepage?.value || subject.value;
    
    // Get category
    const category = store.getObjects(subject, namedNode(SCHEMA_CATEGORY), null)[0];
    if (category) {
      app.category = category.value;
    }
    
    // Get image (try multiple predicates)
    const schemaImage = store.getObjects(subject, namedNode(SCHEMA_IMAGE), null)[0];
    const foafDepiction = store.getObjects(subject, namedNode(FOAF_DEPICTION), null)[0];
    app.image = schemaImage?.value || foafDepiction?.value;
    
    apps.push(app);
  });
  
  return apps;
}

export async function loadAllApps(): Promise<SolidApp[]> {
  const sources = [
    { url: '/api/proxy/solid/catalog/refs/heads/main/catalog-data.ttl', source: 'Solid Catalog' },
    { url: '/local-apps.ttl', source: 'Local Database' }
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