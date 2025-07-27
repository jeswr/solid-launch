const fs = require('fs');
const path = require('path');

// Color schemes for different categories
const categoryColors = {
  'Pod Management': '#4F46E5', // Indigo
  'Media & Entertainment': '#DC2626', // Red
  'Content & Publishing': '#2563EB', // Blue
  'Productivity': '#059669', // Emerald
  'Development Tools': '#7C3AED', // Purple
  'Social & Communication': '#059669', // Emerald
  'Games': '#D97706', // Amber
  'Education': '#0891B2', // Cyan
  'Finance': '#059669', // Emerald
  'Health': '#DC2626', // Red
  'Other': '#6B7280' // Gray
};

// Apps that need custom images
const appsNeedingImages = [
  {
    name: 'Penny',
    category: 'Pod Management',
    description: 'A general Pod Browser by Vincent Tunru'
  },
  {
    name: 'Solid File Manager',
    category: 'Pod Management', 
    description: 'A Solid app that help you manages files in your Pod'
  },
  {
    name: 'Solid IDE',
    category: 'Pod Management',
    description: 'File manager and IDE'
  },
  {
    name: 'PodOS Browser',
    category: 'Pod Management',
    description: 'Browse and manage the things in your Pod. Based on PodOS'
  },
  {
    name: 'Media Kraken',
    category: 'Media & Entertainment',
    description: 'Track your media and never miss a beat'
  },
  {
    name: 'Solidflix',
    category: 'Media & Entertainment',
    description: 'A movie tracking and sharing application with personalised recommendations'
  },
  {
    name: 'dokieli',
    category: 'Content & Publishing',
    description: 'Clientside editor for decentralised article publishing, annotations, and social interactions'
  },
  {
    name: 'Booklice',
    category: 'Content & Publishing',
    description: 'Bookmarks app with community sharing'
  },
  {
    name: 'Umai',
    category: 'Productivity',
    description: 'Offline-first Recipes Manager'
  },
  {
    name: '0data Hello',
    category: 'Productivity',
    description: 'Implements simple CRUD operations with the REST API and solid-file-client'
  },
  {
    name: 'Solid Data Browser',
    category: 'Development Tools',
    description: 'Browse and edit data in your Solid Pod'
  },
  {
    name: 'SolidOS',
    category: 'Development Tools',
    description: 'Operating System for Solid'
  },
  {
    name: 'Liqid Chat',
    category: 'Social & Communication',
    description: 'Decentralized chat application'
  },
  {
    name: 'Solid Chat',
    category: 'Social & Communication',
    description: 'Chat application for Solid'
  }
];

// Generate SVG placeholder for each app
function generateAppSVG(app) {
  const initials = app.name.split(' ').map(word => word[0]).join('').toUpperCase();
  const color = categoryColors[app.category] || categoryColors['Other'];
  
  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#grad)" rx="20"/>
  <text x="100" y="120" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
  <text x="100" y="160" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white" opacity="0.8">${app.category}</text>
</svg>`;
}

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/app-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Generate images for each app
appsNeedingImages.forEach(app => {
  const filename = app.name.toLowerCase().replace(/\s+/g, '-') + '.svg';
  const filepath = path.join(imagesDir, filename);
  const svg = generateAppSVG(app);
  
  fs.writeFileSync(filepath, svg);
  console.log(`Generated image for ${app.name}: ${filename}`);
});

console.log('\nAll app images generated successfully!');
console.log('Update the local-apps.ttl file to reference these new images.');
console.log('\nTo add a new app image:');
console.log('1. Add the app to the appsNeedingImages array in this script');
console.log('2. Run: node scripts/generate-app-images.js');
console.log('3. Update local-apps.ttl to reference the new image');