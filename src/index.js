#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import lunr from 'lunr';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMarkdown, renderPage } from './mdhelper.js';
/*
* Read the docs folder recursively.
* Convert the markdown to html.
* Build a lunr index. 
* Add each file to the index and to a key-value store where the key is the file path and the value is the file content.
*/

// Get package directory path
const __filename = fileURLToPath(import.meta.url);
const packageDir = path.dirname(path.dirname(__filename));

// Logger utility
const logger = {
    verbose: false,
    setVerbose: (value) => { logger.verbose = value; },
    log: (message) => { if (logger.verbose) console.log(message); },
    info: (message) => console.log(message),
    error: (message) => console.error('Error:', message)
};

// Function to copy directory recursively
function copyDir(src, dest, options = {}) {
    logger.log(`Copying directory from ${src} to ${dest}`);
    
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Skip if filter returns false
        if (options.filter && !options.filter(srcPath)) {
            logger.log(`Skipping filtered file: ${entry.name}`);
            continue;
        }

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, options);
        } else {
            fs.copyFileSync(srcPath, destPath);
            logger.log(`Copied file: ${entry.name}`);
        }
    }
}

async function readMarkdownDocs(dir = 'docs') {
    const results = [];
    
    // Create docs directory if it doesn't exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.log(`Created directory: ${dir}`);
    }
    
    async function processDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                await processDirectory(fullPath);
            } else if (item.endsWith('.md')) {
                logger.log(`Processing markdown file: ${fullPath}`);
                const content = fs.readFileSync(fullPath, 'utf8');
                const relativePath = path.relative('docs', fullPath);
                
                try {
                    const { props, md, html } = await parseMarkdown(content);    
                    //logger.log(`Created html: ${fullPath}, props: ${props}, md: ${md}, html: ${html}`);
                    results.push({
                        path: relativePath,
                        props,
                        markdown: md,
                        html: html
                    });
                } catch (error) {
                    logger.error(`Failed to process ${fullPath}: ${error.message}`);
                }
            }
        }
    }
    
    await processDirectory(dir);
    return results;
}

// Read and parse the JSON file
/*
const documents = JSON.parse(fs.readFileSync('build/database-listings.json', 'utf8'))
const showHitsData = {}

const idx = lunr(function () {
     
    this.ref('_id')
    this.field('title')
    this.field('content')
    this.field('ingress')
    this.field('category')
    this.field('siteUrl')    
    this.field('companyName')
    this.field('details', {
        extractor: doc => doc.details?.map(detail => `${detail.label} ${detail.value}`).join(' ')
    })

    

    documents.forEach(function (doc) {        
        this.add(doc)
        showHitsData[doc._id] = {
            title: doc.title,
            siteUrl: doc.siteUrl,
            altImageUrl: doc.altImageUrl,
            content: doc.content,
            category: doc.category,
            categorySlug: doc.categorySlug,
            slug: doc.slug,
            companyName: doc.companyName,
            ingress: doc.ingress,
            details: doc.details
        }
    }, this)
})

const serialized = JSON.stringify(idx)
fs.writeFileSync('src/web/js/lunr-index.json', serialized)
fs.writeFileSync('src/web/js/show-hits-data.json', JSON.stringify(showHitsData))
*/

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

const docs = await readMarkdownDocs()

// Write HTML files to dist directory
/*
for (const doc of docs) {
    const htmlPath = path.join('dist', doc.path.replace('.md', '.html'));
    // Ensure parent directories exist
    fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
    
    // Use renderPage to generate the complete HTML document
    const completeHtml = renderPage('docpage', {
        props: doc.props,
        page: {path: doc.path},
        html: doc.html
    });
    
    fs.writeFileSync(htmlPath, completeHtml);
    logger.log(`Generated: ${htmlPath}`);
}
*/

// Copy package dist files to user's dist directory
const packageDistDir = path.join(packageDir, 'dist');
if (fs.existsSync(packageDistDir)) {
    copyDir(packageDistDir, 'dist');
}
// copy all files and subfolders from docs to dist
// Copy all files and subfolders from docs to dist, except .md files
copyDir('docs', 'dist', {
    filter: (src) => !src.endsWith('.md')
});

console.log('Documentation generated successfully!');

async function initCommand(argv) {
    const { output } = argv;
    logger.info('Initializing documentation project...');
    
    try {
        // Create docs directory
        if (!fs.existsSync('docs')) {
            fs.mkdirSync('docs');
            logger.info('Created docs directory');
        }

        // Create example markdown file
        const exampleContent = `---
title: Welcome to Okidoki
description: Your documentation is now ready
---

# Welcome to Okidoki

This is an example documentation page. Edit this file to get started with your documentation.

## Features

- Markdown support
- Search functionality
- Beautiful UI
`;
        fs.writeFileSync('docs/index.md', exampleContent);
        logger.info('Created example documentation file');

        // Create okidoki.yaml configuration
        const okidokiConfig = `# Okidoki Configuration

# Site configuration
site:
  title: "My Documentation"
  description: "Documentation generated with Okidoki"
  baseUrl: "/"
  favicon: "/favicon.ico"

# Build configuration
build:
  outputDir: "dist"
  clean: true
  minify: true

# Search configuration
search:
  enabled: true
  maxResults: 10
  minSearchLength: 2

# Theme configuration
theme:
  primaryColor: "#4F46E5"
  darkMode: true
  fontFamily: "Inter, system-ui, sans-serif"

# Navigation configuration
navigation:
  sidebar: "sidebars.yaml"
  topNav: true
  footer: true
`;
        fs.writeFileSync('okidoki.yaml', okidokiConfig);
        logger.info('Created okidoki.yaml configuration file');

        // Create sidebars.yaml for navigation
        const sidebarsConfig = `# Sidebar Navigation Configuration

# Main navigation items
menu:
  - title: Getting Started
    document: /start.md
  - title: Test
    document: /test.md 

# Footer links
footer:
  - title: "Resources"
    items:
      - label: "GitHub"
        url: "https://github.com/yourusername/your-repo"
      - label: "Issues"
        url: "https://github.com/yourusername/your-repo/issues"
      - label: "Discussions"
        url: "https://github.com/yourusername/your-repo/discussions"
`;
        fs.writeFileSync('sidebars.yaml', sidebarsConfig);
        logger.info('Created sidebars.yaml navigation file');

        // Copy default assets
        const packageDistDir = path.join(packageDir, 'dist');
        if (fs.existsSync(packageDistDir)) {
            copyDir(packageDistDir, output || 'dist');
            logger.info('Copied default assets');
        }

        logger.info('Project initialized successfully!');
        logger.info('\nNext steps:');
        logger.info('1. Review and customize okidoki.yaml for your project');
        logger.info('2. Update sidebars.yaml with your documentation structure');
        logger.info('3. Add your markdown files to the docs directory');
        logger.info('4. Run "okidoki generate" to build your documentation');
    } catch (error) {
        logger.error(`Failed to initialize project: ${error.message}`);
        process.exit(1);
    }
}

async function generateCommand(argv) {
    const { source, output, verbose } = argv;
    logger.setVerbose(verbose);
    
    logger.info('Generating documentation from markdown files ...');
    
    try {
        // Check if configuration files exist
        if (!fs.existsSync('okidoki.yaml') || !fs.existsSync('sidebars.yaml')) {
            logger.info('Configuration files not found. Running init first...');
            await initCommand({ output });
        }

        // Create output directory if it doesn't exist
        if (!fs.existsSync(output)) {
            fs.mkdirSync(output, { recursive: true });
            logger.log(`Created output directory: ${output}`);
        }

        // Check if source directory exists and has markdown files
        if (!fs.existsSync(source)) {
            logger.info(`Source directory '${source}' not found. Creating with example content...`);
            await initCommand({ output });
        }

        const docs = await readMarkdownDocs(source);

        if (docs.length === 0) {
            logger.info('No markdown files found. Creating example content...');
            await initCommand({ output });
            // Read docs again after initialization
            docs = await readMarkdownDocs(source);
        }

        // Write HTML files to output directory
        for (const doc of docs) {
            const htmlPath = path.join(output, doc.path.replace('.md', '.html'));
            fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
            
            // Use renderPage to generate the complete HTML document
            const completeHtml = renderPage('docpage', {
                props: doc.props,
                html: doc.html,
                page: {path: doc.path}
            });
            //logger.log(`Complete HTML: ${completeHtml}`);
            fs.writeFileSync(htmlPath, completeHtml);
            logger.log(`Generated: ${htmlPath}`);
        }

        // Copy package dist files to output directory
        const packageDistDir = path.join(packageDir, 'dist');
        if (fs.existsSync(packageDistDir)) {
            copyDir(packageDistDir, output);
        }

        logger.info('Documentation generated successfully!');
    } catch (error) {
        logger.error(`Failed to generate documentation: ${error.message}`);
        process.exit(1);
    }
}

// CLI setup
yargs(hideBin(process.argv))
    .command('init', 'Initialize a new documentation project', {
        output: {
            alias: 'o',
            description: 'Output directory',
            type: 'string',
            default: 'dist'
        }
    }, initCommand)
    .command('generate', 'Generate documentation from markdown files', {
        source: {
            alias: 's',
            description: 'Source directory containing markdown files',
            type: 'string',
            default: 'docs'
        },
        output: {
            alias: 'o',
            description: 'Output directory for generated files',
            type: 'string',
            default: 'dist'
        },
        verbose: {
            alias: 'v',
            description: 'Enable verbose logging',
            type: 'boolean',
            default: false
        }
    }, generateCommand)
    .demandCommand(1, 'You need to specify a command')
    .help()
    .argv;

