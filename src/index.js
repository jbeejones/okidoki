#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import lunr from 'lunr';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMarkdown, renderPage, loadConfig, clearConfigCache, transformSidebarItems, transformDocumentPath } from './mdhelper.js';
import crypto from 'crypto';
import logger from './logger.js';
/*
* Read the docs folder recursively.
* Convert the markdown to html.
* Build a lunr index. 
* Add each file to the index and to a key-value store where the key is the file path and the value is the file content.
*/

// Get package directory path
const __filename = fileURLToPath(import.meta.url);
const packageDir = path.dirname(path.dirname(__filename));



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
                    console.error(`Failed to process ${fullPath}: ${error.message}`);
                    process.exit(1);
                }
            }
        }
    }
    
    await processDirectory(dir);
    return results;
}


// Helper function to generate a fallback title for documents
function generateFallbackTitle(doc) {
    // 1. Try frontmatter title first
    if (doc.props.title) {
        return doc.props.title;
    }
    
    // 2. Try to extract first heading from markdown content
    if (doc.markdown) {
        const headingMatch = doc.markdown.match(/^#+\s+(.+)$/m);
        if (headingMatch) {
            return headingMatch[1].trim();
        }
    }
    
    // 3. Derive title from filename
    if (doc.path) {
        const filename = doc.path.split('/').pop(); // Get filename
        const nameWithoutExt = filename.replace(/\.(html|md)$/, ''); // Remove extension
        
        // Handle special cases
        if (nameWithoutExt === 'index') {
            return 'Home';
        }
        
        // Convert filename to readable title
        const title = nameWithoutExt
            .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
            .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
        
        return title;
    }
    
    // 4. Final fallback
    return 'Untitled';
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
            const fallbackTitle = generateFallbackTitle(doc);
            
            // Extract searchable content
            const searchContent = {
                id: doc.id,
                title: fallbackTitle,
                content: doc.markdown || '', // Use markdown content for searching
                path: doc.path
            };
            
            this.add(searchContent);
            
            // Store display data for search results
            searchData[doc.id] = {
                id: doc.id,
                title: fallbackTitle,
                description: doc.props.description || '',
                path: doc.path,
                content: doc.markdown ? doc.markdown.substring(0, 200) + '...' : '' // Preview text
            };
        }, this);
    });

    return { index: idx, data: searchData };
}

// Top-level processing removed - handled by commands

// Function to copy all image files from source directory to output directory
function copyAllImages(sourceDir, outputDir) {
    let copiedCount = 0;
    
    function processDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                processDirectory(fullPath);
            } else {
                // Check if it's an image file
                const ext = path.extname(item).toLowerCase();
                const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.tiff'];
                
                if (imageExtensions.includes(ext)) {
                    // Calculate relative path from source directory
                    const relativePath = path.relative(sourceDir, fullPath);
                    const destPath = path.join(outputDir, relativePath);
                    
                    // Create destination directory if it doesn't exist
                    const destDir = path.dirname(destPath);
                    if (!fs.existsSync(destDir)) {
                        fs.mkdirSync(destDir, { recursive: true });
                    }
                    
                    // Copy the image file
                    fs.copyFileSync(fullPath, destPath);
                    copiedCount++;
                    logger.log(`Copied image: ${relativePath}`);
                }
            }
        }
    }
    
    if (fs.existsSync(sourceDir)) {
        processDirectory(sourceDir);
    }
    
    return copiedCount;
}

// Function to generate content hash for cache invalidation
function generateContentHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').substring(0, 16);
}

// Function to generate sitemap.xml for all processed documents
function generateSitemap(docs, settings, sourceDir = 'docs') {
    const baseUrl = settings.site.baseUrl || '/';
    
    // Ensure baseUrl ends with / but doesn't have double slashes
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // XML header
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add each document to the sitemap
    for (const doc of docs) {
        // Clean up the path - remove leading slash and add normalized base URL
        const cleanPath = doc.path.startsWith('/') ? doc.path.slice(1) : doc.path;
        const fullUrl = `${normalizedBaseUrl}/${cleanPath}`.replace(/\/+/g, '/');
        
        // Get last modified date from the source markdown file
        let lastmod;
        try {
            const markdownPath = path.join(sourceDir, doc.path.replace('.html', '.md').replace(/^\//, ''));
            if (fs.existsSync(markdownPath)) {
                const stats = fs.statSync(markdownPath);
                lastmod = stats.mtime.toISOString().split('T')[0]; // YYYY-MM-DD format
            } else {
                lastmod = new Date().toISOString().split('T')[0]; // Fallback to current date
            }
        } catch (error) {
            lastmod = new Date().toISOString().split('T')[0]; // Fallback to current date
        }
        
        sitemapXml += '  <url>\n';
        sitemapXml += `    <loc>${fullUrl}</loc>\n`;
        sitemapXml += `    <lastmod>${lastmod}</lastmod>\n`;
        sitemapXml += '    <changefreq>weekly</changefreq>\n';
        sitemapXml += '    <priority>0.8</priority>\n';
        sitemapXml += '  </url>\n';
    }
    
    sitemapXml += '</urlset>';
    
    return sitemapXml;
}

// Function to process custom HTML files with Handlebars context
async function processCustomHtmlFiles(assetsDir, outputDir, settings, sidebars) {
    const { parseMarkdown, renderPage, loadConfig } = await import('./mdhelper.js');
    const handlebars = await import('handlebars');
    const { default: registerHelpers } = await import('./hbshelpers.js');
    
    function processDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                processDirectory(fullPath);
            } else if (item.endsWith('.html')) {
                const relativePath = path.relative(assetsDir, fullPath);
                const outputPath = path.join(outputDir, relativePath);
                
                // Create output directory if it doesn't exist
                const outputDirPath = path.dirname(outputPath);
                if (!fs.existsSync(outputDirPath)) {
                    fs.mkdirSync(outputDirPath, { recursive: true });
                }
                
                // Read the HTML file
                const htmlContent = fs.readFileSync(fullPath, 'utf8');
                
                // Check if it contains Handlebars syntax
                if (htmlContent.includes('{{')) {
                    logger.log(`Processing custom HTML with Handlebars: ${relativePath}`);
                    
                    // Create context similar to regular page rendering
                    const baseUrl = settings.site.baseUrl || '/';
                    const context = {
                        copyright: {
                            year: new Date().getFullYear(),
                            name: settings.site.title
                        },
                        settings: settings,
                        site: settings.site,
                        navbar: transformSidebarItems(sidebars.navbar, baseUrl) || [],
                        footer: transformSidebarItems(sidebars.footer, baseUrl) || [],
                        baseUrl: baseUrl,
                        title: settings.site.title,
                        description: settings.site.description
                    };
                    
                    // Create a temporary Handlebars instance for processing
                    const hbsInstance = handlebars.default.create();
                    registerHelpers(hbsInstance);
                    
                    try {
                        const template = hbsInstance.compile(htmlContent);
                        const processedHtml = template(context);
                        
                        // Handle include placeholders (similar to markdown processing)
                        let finalHtml = processedHtml;
                        if (global.okidokiIncludes && global.okidokiIncludes.size > 0) {
                            for (const [token, content] of global.okidokiIncludes.entries()) {
                                finalHtml = finalHtml.replace(new RegExp(`<p>${token}</p>`, 'g'), content);
                                finalHtml = finalHtml.replace(new RegExp(token, 'g'), content);
                            }
                            global.okidokiIncludes.clear();
                        }
                        
                        fs.writeFileSync(outputPath, finalHtml);
                        logger.log(`Generated custom HTML: ${relativePath}`);
                    } catch (error) {
                        logger.error(`Error processing custom HTML ${relativePath}: ${error.message}`);
                        // Fall back to copying the file as-is
                        fs.copyFileSync(fullPath, outputPath);
                    }
                } else {
                    // No Handlebars syntax, just copy the file
                    fs.copyFileSync(fullPath, outputPath);
                    logger.log(`Copied custom HTML: ${relativePath}`);
                }
            }
        }
    }
    
    processDirectory(assetsDir);
}

// Smart HTML minification function that preserves code blocks
function minifyHtml(html) {
    // First, extract and preserve all <pre> and <code> blocks
    const preservedBlocks = [];
    let blockIndex = 0;
    
    // Extract <pre> blocks (including content)
    html = html.replace(/<pre[\s\S]*?<\/pre>/gi, (match) => {
        const placeholder = `__PRESERVED_BLOCK_${blockIndex}__`;
        preservedBlocks[blockIndex] = match;
        blockIndex++;
        return placeholder;
    });
    
    // Extract standalone <code> blocks that aren't inside <pre>
    html = html.replace(/<code[^>]*>[\s\S]*?<\/code>/gi, (match) => {
        const placeholder = `__PRESERVED_BLOCK_${blockIndex}__`;
        preservedBlocks[blockIndex] = match;
        blockIndex++;
        return placeholder;
    });
    
    // Now apply minification to everything else
    html = html
        // Remove HTML comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove extra whitespace between tags (but not inside them)
        .replace(/>\s+</g, '><')
        // Remove leading/trailing whitespace from lines
        .replace(/^\s+|\s+$/gm, '')
        // Collapse multiple whitespace characters to single space
        .replace(/\s{2,}/g, ' ')
        .trim();
    
    // Restore preserved blocks
    preservedBlocks.forEach((block, index) => {
        html = html.replace(`__PRESERVED_BLOCK_${index}__`, block);
    });
    
    return html;
}

async function initCommand(argv) {
    const { dev, config: configPath = 'okidoki.yaml', sidebars: sidebarsPath = 'sidebars.yaml' } = argv;
    logger.info('Initializing documentation project...');
    
    // For init, we can't load config yet since we're creating it
    // So use CLI arg or default to 'dist'
    const output = argv.output || 'dist';
    
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

        // Create okidoki configuration only if it doesn't exist
        if (!fs.existsSync(configPath)) {
            const okidokiConfig = `# Okidoki Configuration

# Site configuration
site:
  title: "My Documentation"
  description: "Documentation generated with Okidoki"
  baseUrl: "/"
  favicon: "/favicon.ico"
  logo: "/okidokilogo.svg"
  theme:
    light: "fantasy"
    dark: "forest"

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
  placeholder: "Search documentation..."

# Global variables
globals:
  version: "1.0.0"

# Navigation configuration
navigation:
  sidebar: "sidebars.yaml"
  topNav: true
  footer: true
`;
            fs.writeFileSync(configPath, okidokiConfig);
            logger.info(`Created ${configPath} configuration file`);
        } else {
            logger.info(`${configPath} already exists, skipping configuration creation`);
        }

        // Create sidebars configuration for navigation only if it doesn't exist
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
            logger.info(`Created ${sidebarsPath} navigation file`);
        } else {
            logger.info(`${sidebarsPath} already exists, skipping navigation file creation`);
        }

        // Create development package.json if --dev flag is used
        if (dev) {
            const packageJsonPath = 'package.json';
            if (!fs.existsSync(packageJsonPath)) {
                const packageJson = {
                    "name": "my-documentation",
                    "version": "1.0.0",
                    "description": "Documentation project using OkiDoki",
                    "scripts": {
                        "dev": "nodemon -w ./docs -e md,png,jpg,jpeg,gif,svg,webp --exec \"okidoki generate\"",
                        "dev:serve": "okidoki generate && concurrently \"nodemon -w ./docs -e md,png,jpg,jpeg,gif,svg,webp --exec 'okidoki generate'\" \"npx serve dist\"",
                        "build": "okidoki generate",
                        "serve": "npx serve dist"
                    },
                    "devDependencies": {
                        "nodemon": "^3.1.4",
                        "concurrently": "^9.1.0"
                    }
                };
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
                logger.info('Created package.json with development scripts');
                logger.info('Run "npm install" to install development dependencies');
            } else {
                logger.info('package.json already exists, skipping development setup');
            }
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
        
        if (dev) {
            logger.info('\nDevelopment workflow:');
            logger.info('1. Run "npm install" to install development dependencies');
            logger.info('2. Use "npm run dev:serve" for development with auto-reload');
            logger.info('3. Use "npm run dev" to watch and regenerate only');
        } else {
            logger.info('\nFor development with auto-reload:');
            logger.info('- Install nodemon globally: "npm install -g nodemon"');
            logger.info('- Then run: "nodemon -w ./docs -e md,png,jpg,jpeg,gif,svg,webp --exec \\"okidoki generate && npx serve dist\\""');
            logger.info('- Or use: "okidoki init --dev" to create npm scripts');
        }
        
        logger.info(`\nTip: Run "npx serve ${output}" to view your documentation web app`);
    } catch (error) {
        logger.error(`Failed to initialize project: ${error.message}`);
        process.exit(1);
    }
}

async function generateCommand(argv) {
    const { source, verbose, config, sidebars: sidebarsPath } = argv;
    logger.setVerbose(verbose);
    
    // Clear config cache to ensure fresh loading with custom paths
    clearConfigCache();
    
    logger.info('Generating documentation from markdown files ...');
    
    try {
        // Check if custom configuration files exist
        if (!fs.existsSync(config) || !fs.existsSync(sidebarsPath)) {
            logger.info(`Configuration files not found (${config}, ${sidebarsPath}). Running init first...`);
            await initCommand({ output: argv.output, config, sidebars: sidebarsPath });
        }

        // Load configuration once at the top
        const { settings, sidebars } = loadConfig(config, sidebarsPath);
        
        // Determine output directory: CLI arg -> config -> default  
        const output = argv.output || settings.build.outputDir || 'dist';
        
        // Clean output directory if build.clean is enabled
        if (settings.build.clean && fs.existsSync(output)) {
            const items = fs.readdirSync(output);
            for (const item of items) {
                const itemPath = path.join(output, item);
                const stat = fs.statSync(itemPath);
                if (stat.isDirectory()) {
                    fs.rmSync(itemPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(itemPath);
                }
            }
            logger.log(`Cleaned output directory: ${output}`);
        }

        // Create output directory if it doesn't exist
        if (!fs.existsSync(output)) {
            fs.mkdirSync(output, { recursive: true });
            logger.log(`Created output directory: ${output}`);
        }

        // Check if source directory exists and has markdown files
        if (!fs.existsSync(source)) {
            logger.info(`Source directory '${source}' not found. Creating with example content...`);
            await initCommand({ output, config, sidebars: sidebarsPath });
        }

        let docs = await readMarkdownDocs(source);

        if (docs.length === 0) {
            logger.info('No markdown files found. Creating example content...');
            await initCommand({ output, config, sidebars: sidebarsPath });
            // Read docs again after initialization
            docs = await readMarkdownDocs(source);
        }

        // Create search index only if search is enabled
        if (settings.search.enabled) {
            const searchIndex = createSearchIndex(docs);

            // Generate content hashes for cache invalidation
            const indexHash = generateContentHash(searchIndex.index);
            const dataHash = generateContentHash(searchIndex.data);
            const buildTimestamp = Date.now();
            
            // Create search metadata for cache invalidation
            const searchMeta = {
                version: '1.0',
                buildTimestamp,
                indexHash,
                dataHash,
                totalDocs: docs.length
            };

            // Save search index, data, and metadata as JSON files
            fs.writeFileSync(path.join(output, 'lunr-index.json'), JSON.stringify(searchIndex.index));
            fs.writeFileSync(path.join(output, 'search-data.json'), JSON.stringify(searchIndex.data));
            fs.writeFileSync(path.join(output, 'search-meta.json'), JSON.stringify(searchMeta, null, 2));
            logger.log('Created search index files with metadata for cache invalidation');
        } else {
            logger.log('Search disabled - skipping search index generation');
        }

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
            logger.log(`Render page: ${doc.path}`);
            let completeHtml = renderPage('docpage', renderContext);
            
            // Apply minification if enabled
            if (settings.build.minify) {
                completeHtml = minifyHtml(completeHtml);
            }
            
            //logger.log(`Render context: ${JSON.stringify(renderContext, null, 2)}`);
            fs.writeFileSync(htmlPath, completeHtml);
            //logger.log(`Generated: ${htmlPath}`);
        }

        // Copy package assets files to output directory (excluding HTML files to avoid overwriting generated content)
        const packageAssetsDir = path.join(packageDir, 'assets');
        if (fs.existsSync(packageAssetsDir)) {
            // Process HTML files first (like 404.html, 500.html) with Handlebars context
            await processCustomHtmlFiles(packageAssetsDir, output, settings, sidebars);
            
            // Then copy other assets
            copyDir(packageAssetsDir, output, {
                filter: (src) => {
                    if (!src.endsWith('.html')) return true;
                    // Skip HTML files - they were processed above
                    return false;
                }
            });
            logger.info('Copied default assets');
        }
        
        // Copy user custom assets to override defaults
        let userAssetsDir = null;
        
        // Check for configured custom assets directory
        if (settings.site.assets) {
            userAssetsDir = path.resolve(settings.site.assets);
        } else {
            // Check for default "assets" folder in project root
            const defaultAssetsDir = path.join(process.cwd(), 'assets');
            if (fs.existsSync(defaultAssetsDir)) {
                userAssetsDir = defaultAssetsDir;
            }
        }
        
        // Process and copy user assets if directory exists
        if (userAssetsDir && fs.existsSync(userAssetsDir)) {
            // Process custom HTML files with Handlebars context
            await processCustomHtmlFiles(userAssetsDir, output, settings, sidebars);
            
            // Copy other assets (non-HTML files)
            copyDir(userAssetsDir, output, {
                filter: (src) => !src.endsWith('.html')
            });
            logger.info(`Processed custom HTML and copied assets from: ${path.relative(process.cwd(), userAssetsDir)}`);
        }
        
        // Copy all image files from source directory to output directory
        const copiedImageCount = copyAllImages(source, output);
        if (copiedImageCount > 0) {
            logger.log(`Successfully copied ${copiedImageCount} image files`);
        } else {
            logger.log('No image files found in source directory');
        }

        // Generate sitemap.xml
        const sitemapXml = generateSitemap(docs, settings, source);
        fs.writeFileSync(path.join(output, 'sitemap.xml'), sitemapXml);
        logger.log('Created sitemap.xml');

        logger.info(`Documentation generated successfully! (${docs.length} documents)`);
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
            type: 'string'
        },
        config: {
            alias: 'c',
            description: 'Path to create okidoki configuration file',
            type: 'string',
            default: 'okidoki.yaml'
        },
        sidebars: {
            alias: 'b',
            description: 'Path to create sidebars configuration file',
            type: 'string',
            default: 'sidebars.yaml'
        },
        dev: {
            alias: 'd',
            description: 'Create a package.json with development scripts (nodemon, concurrently)',
            type: 'boolean',
            default: false
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
            type: 'string'
        },
        config: {
            alias: 'c',
            description: 'Path to okidoki configuration file',
            type: 'string',
            default: 'okidoki.yaml'
        },
        sidebars: {
            alias: 'b',
            description: 'Path to sidebars configuration file',
            type: 'string',
            default: 'sidebars.yaml'
        },
        verbose: {
            alias: 'v',
            description: 'Enable verbose logging',
            type: 'boolean',
            default: false
        }
    }, generateCommand)
    .demandCommand(1, 'You need to specify a command')
    .strict()
    .fail((msg, err, yargs) => {
        if (err) {
            logger.error(err.message);
        } else {
            logger.error(msg);
        }
        console.error('\nUsage:');
        yargs.showHelp();
        process.exit(1);
    })
    .help()
    .argv;

