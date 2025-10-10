#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import lunr from 'lunr';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMarkdown, renderPage, loadConfig, clearConfigCache, transformSidebarItems, transformDocumentPath } from './mdhelper.js';
import { convertOpenAPIToMarkdown } from './openapi-converter.js';
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



/**
 * Copy directory recursively with file filtering options
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 * @param {Object} options - Copy options with exclude patterns
 */
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

/**
 * Recursively read and process all markdown documents from a directory
 * @param {string} dir - Directory to scan for markdown files (default: 'docs')
 * @param {boolean} resetId - Whether to reset document ID counter (default: true)
 * @returns {Array} Array of processed document objects
 */
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
                    const { props, md, html } = await parseMarkdown(content, fullPath);    
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


/**
 * Generate a fallback title for documents that don't have one in frontmatter
 * @param {Object} doc - Document object with props and path information
 * @returns {string} Generated title from various fallback strategies
 */
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

/**
 * Create Lunr.js search index from processed documents
 * @param {Array} documents - Array of processed document objects
 * @returns {Object} Object containing search index and metadata
 */
function createSearchIndex(documents) {
    const { settings, sidebars } = loadConfig();
    const searchDocs = [];
    const searchData = {};
    
    // Helper to check if document should be excluded from search
    function shouldExcludeFromSearch(doc) {
        // Check frontmatter exclusion
        if (doc.props.exclude_from_search === true || doc.props.searchable === false) {
            return true;
        }
        
        // Check sidebar configuration exclusion
        const docPath = doc.path;
        const checkSidebarItems = (items) => {
            if (!items) return false;
            for (const item of items) {
                if (item.document && transformDocumentPath(item.document) === docPath) {
                    return item.exclude_from_search === true || item.searchable === false;
                }
                if (item.items && checkSidebarItems(item.items)) {
                    return true;
                }
            }
            return false;
        };
        
        return checkSidebarItems(sidebars.menu) || checkSidebarItems(sidebars.navbar);
    }
    
    // Build lunr index
    const idx = lunr(function () {
        this.ref('id');
        this.field('title');
        this.field('content');
        this.field('path');
        
        documents.forEach(function (doc) {
            // Skip documents that should be excluded from search
            if (shouldExcludeFromSearch(doc)) {
                console.log(`Excluding from search index: ${doc.path}`);
                return;
            }
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
    const friendlyUrl = settings.site.friendlyUrl || false;
    
    // Build the full site URL for absolute URLs in sitemap
    let siteUrl = '';
    if (settings.site.url) {
        // Use configured site URL
        siteUrl = settings.site.url.replace(/\/$/, '');
    } else if (baseUrl.startsWith('http')) {
        // If baseUrl is already absolute, use it
        // Remove index.html if present (e.g., https://okidoki.dev/index.html -> https://okidoki.dev)
        siteUrl = baseUrl.replace(/\/index\.html$/, '').replace(/\/$/, '');
    } else {
        // For relative baseUrls, we can't generate absolute URLs
        // Use the baseUrl as-is (this will need manual configuration)
        siteUrl = baseUrl.replace(/\/$/, '');
    }
    
    // XML header with extended namespaces for better SEO and future extensibility
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    sitemapXml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
    sitemapXml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    // Add each document to the sitemap
    for (const doc of docs) {
        // Clean up the path - remove leading slash
        let cleanPath = doc.path.startsWith('/') ? doc.path.slice(1) : doc.path;
        
        // Apply friendlyUrl transformation to the path
        if (friendlyUrl) {
            // Remove .html extension if present
            if (cleanPath.endsWith('.html')) {
                cleanPath = cleanPath.replace('.html', '');
            }
        }
        
        // Special handling for index page
        const isIndexPage = cleanPath === 'index' || cleanPath === 'index.html' || doc.path === '/index.html';
        
        // Build absolute URL
        let fullUrl;
        if (siteUrl.startsWith('http')) {
            // Full absolute URL - combine site URL with page path
            if (isIndexPage) {
                // For index page, use siteUrl with trailing slash
                fullUrl = `${siteUrl}/`;
            } else {
                // For other pages, use the full path
                fullUrl = `${siteUrl}/${cleanPath}`;
            }
        } else {
            // Relative URL (fallback for when site.url is not configured)
            if (isIndexPage) {
                // For index page, use siteUrl with trailing slash
                fullUrl = `${siteUrl}/`.replace(/\/+/g, '/');
            } else {
                fullUrl = `${siteUrl}/${cleanPath}`.replace(/\/+/g, '/');
            }
        }
        
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
    
    async function processDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                await processDirectory(fullPath);
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
                    await registerHelpers(hbsInstance, settings);
                    
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
    
    await processDirectory(assetsDir);
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
        // Remove extra whitespace between tags (but preserve single spaces for inline elements)
        .replace(/>\s{2,}</g, '><')  // Only remove multiple spaces/newlines, keep single spaces
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

/**
 * Initialize a new documentation project with default configuration and assets
 * @param {Object} argv - Command line arguments from yargs
 */
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

        // Copy beautiful homepage template only if it doesn't exist
        const indexPath = 'docs/index.md';
        if (!fs.existsSync(indexPath)) {
            const templateIndexPath = path.join(packageDir, 'docs', 'index.md');

            if (fs.existsSync(templateIndexPath)) {
                fs.copyFileSync(templateIndexPath, indexPath);
                logger.info('Created beautiful homepage from template');
            } else {
                // Fallback to simple content if template doesn't exist
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
            }
        } else {
            logger.info('Documentation file already exists, skipping homepage creation');
        }

        // Copy start.md template only if it doesn't exist
        const startPath = 'docs/start.md';
        if (!fs.existsSync(startPath)) {
            const templateStartPath = path.join(packageDir, 'docs', 'start.md');
            if (fs.existsSync(templateStartPath)) {
                fs.copyFileSync(templateStartPath, startPath);
                logger.info('Created start page from template');
            } else {
                // Fallback content for start page
                const startContent = `---
title: Getting Started with OkiDoki
description: Complete guide to get started with OkiDoki documentation generator
---

# Getting Started with OkiDoki

Welcome to **OkiDoki** - an open source, simple, fast documentation generator that turns your markdown files into beautiful documentation sites.

## 🚀 Get Running in 30 Seconds

### 1. Install OkiDoki Globally
\`\`\`bash
npm install -g okidoki
\`\`\`

### 2. Create Your Project Directory
\`\`\`bash
mkdir mydocs && cd mydocs
\`\`\`

### 3. Initialize Your Documentation
\`\`\`bash
okidoki init
\`\`\`

### 4. Generate Your Documentation
\`\`\`bash
okidoki generate
\`\`\`

### 5. Serve and View Your Site
\`\`\`bash
npx serve dist
\`\`\`

## 📚 Learn More

- **[Official Documentation](https://jbeejones.github.io/okidoki-website/index.html)** - Complete reference and examples
- **[Help & Support](/help)** - Troubleshooting and FAQ

Ready to build amazing documentation? 🚀 Start editing your markdown files!
`;
                fs.writeFileSync(startPath, startContent);
                logger.info('Created start page');
            }
        } else {
            logger.info('Start page already exists, skipping creation');
        }

        // Create mock files for sidebar links
        const mockFiles = [
            {
                path: 'docs/test.md',
                content: `---
title: Test Page
description: This is a test page
---

# Test Page

This is a test page to demonstrate the documentation structure.

## Testing Features

- Link navigation
- Content structure
- Page layout

Feel free to edit this content to match your needs.
`
            },
            {
                path: 'docs/blog.md', 
                content: `---
title: Blog
description: Latest updates and news
---

# Blog

Stay updated with the latest news and updates.

## Recent Posts

- Welcome to our new documentation
- Getting started guide
- Feature updates

*More posts coming soon!*
`
            },
            {
                path: 'docs/help.md',
                content: `---
title: Help & Support
description: Get help and support
---

# Help & Support

Need help? Here are some resources to get you started.

## Common Questions

### How do I get started?
Check out our [Getting Started](/start) guide.

### Where can I find more examples?
Browse our documentation for more examples and tutorials.

## Support

- Check the documentation
- Search existing issues
- Create a new issue if needed
`
            }
        ];

        mockFiles.forEach(file => {
            if (!fs.existsSync(file.path)) {
                fs.writeFileSync(file.path, file.content);
                logger.info(`Created ${file.path}`);
            } else {
                logger.info(`${file.path} already exists, skipping creation`);
            }
        });

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
    light: "light"
    dark: "dark"

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
  - title: Test Page
    document: /test.md 

# Top navigation bar items
navbar:
  - title: Home
    document: /index.html
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
  - title: ""
    items:
      - label: "Created with Okidoki"
        url: "https://okidoki.dev"
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

/**
 * Generate static documentation website from markdown files
 * @param {Object} argv - Command line arguments containing source, output, config options
 */
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

/**
 * Convert OpenAPI specification to markdown documentation
 * @param {Object} argv - Command line arguments containing input file, output options, etc.
 */
async function openapiCommand(argv) {
    const { input, output, title, description, docs, sidebars: sidebarsPath, config } = argv;
    
    try {
        logger.info('Converting OpenAPI specification to markdown...');
        
        // Determine output path
        const docsDir = docs || 'docs';
        let outputFile;
        
        if (output) {
            outputFile = output;
        } else {
            // Generate output filename from input filename
            const inputBasename = path.basename(input, path.extname(input));
            outputFile = path.join(docsDir, `${inputBasename}.md`);
        }
        
        // Conversion options
        const options = {};
        if (title) options.title = title;
        if (description) options.description = description;
        
        // Perform the conversion
        const result = await convertOpenAPIToMarkdown(input, outputFile, options);
        
        // Optionally update sidebars.yaml to include the new API documentation
        const sidebarsFilePath = sidebarsPath || 'sidebars.yaml';
        if (result.success && fs.existsSync(sidebarsFilePath)) {
            const sidebarsContent = fs.readFileSync(sidebarsFilePath, 'utf8');
            const yaml = await import('js-yaml');
            const sidebarsConfig = yaml.default.load(sidebarsContent);
            
            // Check if API Reference entry already exists
            const apiTitle = title || 'API Reference';
            const apiPath = '/' + path.relative(docsDir, outputFile).replace(/\\/g, '/');
            
            if (!sidebarsConfig.menu) {
                sidebarsConfig.menu = [];
            }
            
            const existingEntry = sidebarsConfig.menu.find(item => 
                item.document === apiPath || item.title === apiTitle
            );
            
            if (!existingEntry) {
                sidebarsConfig.menu.push({
                    title: apiTitle,
                    document: apiPath
                });
                
                fs.writeFileSync(sidebarsFilePath, yaml.default.dump(sidebarsConfig));
                logger.info(`Added ${apiTitle} to navigation in ${sidebarsFilePath}`);
            } else {
                logger.info(`${apiTitle} already exists in navigation`);
            }
        }
        
        logger.info('OpenAPI conversion completed successfully!');
        logger.info(`Generated: ${outputFile}`);
        logger.info('Run "okidoki generate" to build your documentation with the new API reference');
        
    } catch (error) {
        logger.error(`Failed to convert OpenAPI specification: ${error.message}`);
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
    .command('openapi', 'Convert OpenAPI specification to markdown', {
        input: {
            alias: 'i',
            description: 'Path to OpenAPI specification file (JSON or YAML)',
            type: 'string',
            demandOption: true
        },
        output: {
            alias: 'o',
            description: 'Output markdown file path',
            type: 'string'
        },
        title: {
            alias: 't',
            description: 'Title for the generated documentation',
            type: 'string'
        },
        description: {
            alias: 'd',
            description: 'Description for the generated documentation',
            type: 'string'
        },
        docs: {
            description: 'Target docs directory',
            type: 'string',
            default: 'docs'
        },
        sidebars: {
            alias: 'b',
            description: 'Path to sidebars configuration file',
            type: 'string',
            default: 'sidebars.yaml'
        },
        config: {
            alias: 'c',
            description: 'Path to okidoki configuration file',
            type: 'string',
            default: 'okidoki.yaml'
        }
    }, openapiCommand)
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

