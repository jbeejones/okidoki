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
// global variable to store the document id
let docID = 0;

async function readMarkdownDocs(dir = 'docs', resetId = true) {
    const results = [];
    
    // Reset document ID for clean processing
    if (resetId) {
        docID = 0;
    }
    
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
                const relativePath = '/'+path.relative('docs', fullPath).replace('.md', '.html');
                
                try {
                    const { props, md, html } = await parseMarkdown(content);    
                    //logger.log(`Created html: ${fullPath}, props: ${props}, md: ${md}, html: ${html}`);
                    results.push({
                        id: docID++,
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


// Create lunr search index
function createSearchIndex(documents) {
    const searchDocs = [];
    const searchData = {};
    
    // Build lunr index
    const idx = lunr(function () {
        this.ref('id');
        this.field('title');
        this.field('content');
        this.field('path');
        
        documents.forEach(function (doc) {
            // Extract searchable content
            const searchContent = {
                id: doc.id,
                title: doc.props.title || 'Untitled',
                content: doc.markdown || '', // Use markdown content for searching
                path: doc.path
            };
            
            this.add(searchContent);
            
            // Store display data for search results
            searchData[doc.id] = {
                id: doc.id,
                title: doc.props.title || 'Untitled',
                description: doc.props.description || '',
                path: doc.path,
                content: doc.markdown ? doc.markdown.substring(0, 200) + '...' : '' // Preview text
            };
        }, this);
    });

    return { index: idx, data: searchData };
}

// Top-level processing removed - handled by commands

async function initCommand(argv) {
    const { output } = argv;
    logger.info('Initializing documentation project...');
    
    try {
        // Create docs directory
        if (!fs.existsSync('docs')) {
            fs.mkdirSync('docs');
            logger.info('Created docs directory');
        }

        // Create example markdown file only if it doesn't exist
        const indexPath = 'docs/index.md';
        if (!fs.existsSync(indexPath)) {
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
            fs.writeFileSync(indexPath, exampleContent);
            logger.info('Created example documentation file');
        } else {
            logger.info('Documentation file already exists, skipping example creation');
        }

        // Create okidoki.yaml configuration only if it doesn't exist
        const configPath = 'okidoki.yaml';
        if (!fs.existsSync(configPath)) {
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
            fs.writeFileSync(configPath, okidokiConfig);
            logger.info('Created okidoki.yaml configuration file');
        } else {
            logger.info('okidoki.yaml already exists, skipping configuration creation');
        }

        // Create sidebars.yaml for navigation only if it doesn't exist
        const sidebarsPath = 'sidebars.yaml';
        if (!fs.existsSync(sidebarsPath)) {
            const sidebarsConfig = `# Sidebar Navigation Configuration

# Main navigation items
menu:
  - title: Getting Started
    document: /start.md
  - title: Test
    document: /test.md 

navbar:
  - title: Blog
    document: /blog.md
  - title: Help
    document: /help.md

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
            fs.writeFileSync(sidebarsPath, sidebarsConfig);
            logger.info('Created sidebars.yaml navigation file');
        } else {
            logger.info('sidebars.yaml already exists, skipping navigation file creation');
        }

        // Copy default assets (excluding HTML files)
        const packageAssetsDir = path.join(packageDir, 'assets');
        if (fs.existsSync(packageAssetsDir)) {
            copyDir(packageAssetsDir, output, {
                filter: (src) => !src.endsWith('.html')
            });
            logger.info('Copied default assets');
        }

        logger.info('Project initialized successfully!');
        logger.info('\nNext steps:');
        logger.info('1. Review and customize okidoki.yaml for your project');
        logger.info('2. Update sidebars.yaml with your documentation structure');
        logger.info('3. Add your markdown files to the docs directory');
        logger.info('4. Run "okidoki generate" to build your documentation');
        logger.info(`5. Tip: Run "npx serve ${output}" to view your documentation web app`);
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

        let docs = await readMarkdownDocs(source);

        if (docs.length === 0) {
            logger.info('No markdown files found. Creating example content...');
            await initCommand({ output });
            // Read docs again after initialization
            docs = await readMarkdownDocs(source);
        }

        // Create search index
        const searchIndex = createSearchIndex(docs);

        // Save search index and data as JSON files
        fs.writeFileSync(path.join(output, 'lunr-index.json'), JSON.stringify(searchIndex.index));
        fs.writeFileSync(path.join(output, 'search-data.json'), JSON.stringify(searchIndex.data));
        logger.log('Created search index files');

        // Write HTML files to output directory
        for (const doc of docs) {
            const htmlPath = path.join(output, doc.path.replace('.md', '.html'));
            fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
            
            // Use renderPage to generate the complete HTML document
            const renderContext = {
                id: doc.id,
                props: doc.props,
                html: doc.html,
                page: {path: doc.path}
            };
            const completeHtml = renderPage('docpage', renderContext);
            //logger.log(`Render context: ${JSON.stringify(renderContext, null, 2)}`);
            fs.writeFileSync(htmlPath, completeHtml);
            //logger.log(`Generated: ${htmlPath}`);
        }

        // Copy package assets files to output directory (excluding HTML files to avoid overwriting generated content)
        const packageAssetsDir = path.join(packageDir, 'assets');
        if (fs.existsSync(packageAssetsDir)) {
            copyDir(packageAssetsDir, output, {
                filter: (src) => !src.endsWith('.html')
            });
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

