# Solid App Launcher

A modern web application launcher for the Solid ecosystem, designed to help users discover and access Solid-compatible applications.

## Features

- **Dynamic App Discovery**: Reads application data from RDF sources (both remote and local)
- **Beautiful UI**: Modern, responsive design following Solid Project branding guidelines
- **Dark Mode Support**: Toggle between light and dark themes with persistent preferences
- **Search & Filter**: Find apps quickly by name, description, or category
- **Grid & List Views**: Switch between different viewing modes
- **Category Organization**: Apps are organized by categories like Pod Management, Media & Entertainment, etc.
- **Automatic Placeholders**: Generates attractive placeholders for apps without images
- **Custom App Images**: Automatically generated SVG images for all applications

## Technology Stack

- **Next.js 15**: React framework for production
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework with dark mode support
- **RDF/Turtle**: Semantic data format for app metadata
- **N3.js**: RDF parsing library
- **Framer Motion**: Animation library
- **Lucide Icons**: Modern icon set

## Data Sources

The launcher reads application data from two sources:

1. **Solid Catalog**: Official catalog maintained at `https://github.com/solid/catalog`
2. **Local Database**: Additional apps defined in `/public/local-apps.ttl`

## RDF Schema

Applications are defined using the following RDF predicates:

```turtle
@prefix solid: <http://www.w3.org/ns/solid/terms#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <http://schema.org/> .

<https://example.com/app>
    a solid:App ;
    rdfs:label "App Name" ;
    dct:description "App description" ;
    foaf:homepage <https://example.com/app> ;
    schema:category "Category Name" ;
    schema:image <https://example.com/app/icon.png> .
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Adding New Apps

To add new applications to the launcher:

1. Edit `/public/local-apps.ttl`
2. Add your app following the RDF schema above
3. The app will appear automatically on next page load

## Image Generation

The launcher automatically generates custom SVG images for applications that don't have their own icons. These images are:

- **Category-based colors**: Each category has a distinct color scheme
- **App initials**: Display the app's initials in a modern design
- **Responsive**: Scale properly across different screen sizes
- **Accessible**: High contrast and readable text

To generate new images for apps:

```bash
# Generate images for specific apps
node scripts/generate-app-images.js

# Generate additional images for more apps
node scripts/generate-more-images.js
```

## Dark Mode

The launcher includes a comprehensive dark mode implementation:

- **Theme Toggle**: Click the moon/sun icon in the header to switch themes
- **Persistent Preferences**: Your theme choice is saved in localStorage
- **System Preference**: Automatically detects your system's preferred color scheme
- **Smooth Transitions**: All color changes are animated for a polished experience

## Deployment

This app is designed to be deployed at `start.solidproject.org`. It can be deployed on any static hosting service that supports Next.js applications.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is part of the Solid Project and follows the same licensing terms.
