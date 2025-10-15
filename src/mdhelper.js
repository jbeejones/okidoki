import handlebars from 'handlebars';
import yaml from 'js-yaml';
import markdownit from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor';
import markdownItImsize from 'markdown-it-imsize';
import markdownItToc from 'markdown-it-table-of-contents';
import markdownItMathjax3 from 'markdown-it-mathjax3';
import markdownItMermaid from 'markdown-it-mermaid';
import { full as markdownItEmoji } from 'markdown-it-emoji';
import markdownItAttrs from 'markdown-it-attrs';

import slugify from '@sindresorhus/slugify';
//import { Marked } from 'marked';
//import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import fs from 'fs';
import path from 'path';
import layouts from 'handlebars-layouts';
import { fileURLToPath } from 'url';
import registerHelpers from './hbshelpers.js';
import registerTabs from './tabs.js';
import logger from './logger.js';


// Get package directory path
const __filename = fileURLToPath(import.meta.url);
const packageDir = path.dirname(path.dirname(__filename));

// Get package version
let packageVersion = '1.0.0'; // fallback
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
    packageVersion = packageJson.version || '1.0.0';
} catch (error) {
    logger.log('Could not load package version, using fallback');
}

// Cache for configuration
let configCache = null;

// Function to clear configuration cache
function clearConfigCache() {
    configCache = null;
}

// Configuration loading function
function loadConfig(configPath = 'okidoki.yaml', sidebarsPath = 'sidebars.yaml') {
    // Create a cache key based on file paths to handle different config files
    const cacheKey = `${configPath}:${sidebarsPath}`;
    
    // Return cached config if already loaded for these specific paths
    if (configCache && configCache.cacheKey === cacheKey) {
        return configCache;
    }
    // Default configuration
    const defaultConfig = {
            settings: {
            site: {
                title: "Documentation",
                description: "Documentation generated with Okidoki",
                baseUrl: "/",
                url: "", // Full site URL for absolute links in sitemap (e.g., "https://example.com")
                favicon: "/favicon.ico",
                logo: "/okidokilogo.svg",
                friendlyUrl: false, // If true, URLs will not end with .html extension
                theme: {
                    light: "light",
                    dark: "dark"
                },
                copyright: {
                    name: "Your Company"
                },
                assets: null // Custom assets directory path, defaults to "assets" folder if exists
            },
            build: {
                outputDir: "dist",
                clean: true,
                minify: true
            },
            search: {
                enabled: true,
                maxResults: 10,
                minSearchLength: 2,
                placeholder: "Search documentation..."
            },
            globals: {
                okidoki_version: packageVersion,
                version: packageVersion
            },
            plugins: {
                enabled: true,
                directory: "plugins",
                load: []
            }
        },
        sidebars: {
            menu: [],
            navbar: []
        }
    };

    // Deep merge function to recursively merge configuration objects
    function deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
                result[key] = deepMerge(target[key], source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    try {
        const fullConfigPath = path.join(process.cwd(), configPath);
        const userSettings = yaml.load(fs.readFileSync(fullConfigPath, 'utf8'));
        const settings = deepMerge(defaultConfig.settings, userSettings);

        const fullSidebarsPath = path.join(process.cwd(), sidebarsPath);
        const sidebarsYaml = fs.readFileSync(fullSidebarsPath, 'utf8');
        const sidebars = yaml.load(sidebarsYaml);

        configCache = { settings, sidebars, cacheKey };
        return configCache;
    } catch (error) {
        // Return default configuration if files don't exist
        configCache = { ...defaultConfig, cacheKey };
        return configCache;
    }
}

// Transform document paths from .md to .html
function transformDocumentPath(path) {
    if (!path) return path;
    
    // Get configuration to check friendlyUrl setting
    const { settings } = loadConfig();
    const friendlyUrl = settings?.site?.friendlyUrl || false;
    
    // Split the path into base path and anchor
    const [basePath, anchor] = path.split('#');
    
    // Transform the base path
    let transformedPath = basePath;
    
    if (friendlyUrl) {
        // Friendly URLs: remove .html extension if present, don't add it
        if (transformedPath.endsWith('.html')) {
            transformedPath = transformedPath.replace('.html', '');
        }
        // If path has .md extension, remove it (no .html replacement)
        else if (transformedPath.endsWith('.md')) {
            transformedPath = transformedPath.replace('.md', '');
        }
        // If path has no extension, leave as is
    } else {
        // Standard URLs: ensure .html extension
        // If path already has .html extension, return as is
        if (transformedPath.endsWith('.html')) transformedPath = transformedPath;
        // If path has .md extension, replace with .html
        else if (transformedPath.endsWith('.md')) transformedPath = transformedPath.replace('.md', '.html');
        // If path has no extension, add .html
        else transformedPath = `${transformedPath}.html`;
    }
    
    // Reattach the anchor if it exists
    return anchor ? `${transformedPath}#${anchor}` : transformedPath;
}

// Transform sidebar document paths
function transformSidebarItems(items, baseUrl = null) {
    if (!items) return items;
    return items.map(item => {
        if (typeof item === 'string') {
            return transformDocumentPath(item);
        }
        if (item.items) {
            return {
                ...item,
                items: transformSidebarItems(item.items, baseUrl)
            };
        }
        if (item.document) {
            let document = transformDocumentPath(item.document);
            
            // Add baseUrl to internal links (not external URLs)
            if (baseUrl && document && !document.startsWith('http') && document.startsWith('/')) {
                const cleanBase = baseUrl.replace(/\/$/, '');
                const cleanPath = document.replace(/^\//, '');
                document = cleanBase + '/' + cleanPath;
            }
            
            return {
                ...item,
                document: document
            };
        }
        if (item.url && !item.url.startsWith('http')) {
            let url = transformDocumentPath(item.url);
            
            // Add baseUrl to internal links
            if (baseUrl) {
                if (url.startsWith('/')) {
                    // Absolute path - add baseUrl
                    const cleanBase = baseUrl.replace(/\/$/, '');
                    const cleanPath = url.replace(/^\//, '');
                    url = cleanBase + '/' + cleanPath;
                } else {
                    // Relative path - add baseUrl
                    const cleanBase = baseUrl.replace(/\/$/, '');
                    url = cleanBase + '/' + url;
                }
            }
            
            return {
                ...item,
                url: url
            };
        }
        return item;
    });
}

// Read template files synchronously
const layoutTemplate = fs.readFileSync(path.join(packageDir, 'src/templates/layout.hbs'), 'utf8');
const docpageTemplate = fs.readFileSync(path.join(packageDir, 'src/templates/docpage.hbs'), 'utf8');

// Create Handlebars instance
const handlebarsInstance = handlebars.create();

// Register layouts helper
handlebarsInstance.registerHelper(layouts(handlebarsInstance));

// Register the layout partial
handlebarsInstance.registerPartial('layout', layoutTemplate);

// Register custom helpers (without plugins initially)
await registerHelpers(handlebarsInstance);

// Track if plugins have been loaded to avoid reloading
let pluginsLoaded = false;

// Define the page templates
const templates = {
    layout: handlebarsInstance.compile(layoutTemplate),
    docpage: handlebarsInstance.compile(docpageTemplate)
};

// Helper function to parse line numbers from syntax like {1,3-5,7}
function parseHighlightLines(lineSpec) {
    const lines = new Set();
    if (!lineSpec) return lines;
    
    const parts = lineSpec.split(',');
    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
            // Range like "3-5"
            const [start, end] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    lines.add(i);
                }
            }
        } else {
            // Single line number
            const num = parseInt(trimmed, 10);
            if (!isNaN(num)) {
                lines.add(num);
            }
        }
    }
    return lines;
}

// Helper function to parse code fence metadata (line numbers and title)
// Example: js{1,3-5} title="index.js"
function parseCodeFenceInfo(langString) {
    if (!langString) return { lang: '', highlightLines: new Set(), title: null };
    
    let lang = langString;
    let highlightLines = new Set();
    let title = null;
    
    // Extract title using regex: title="..." or title='...'
    const titleMatch = langString.match(/title=["']([^"']*)["']/);
    if (titleMatch) {
        title = titleMatch[1];
        lang = lang.replace(titleMatch[0], '').trim();
    }
    
    // Extract highlight lines: {1,3-5}
    const lineMatch = lang.match(/\{([^}]+)\}/);
    if (lineMatch) {
        highlightLines = parseHighlightLines(lineMatch[1]);
        lang = lang.replace(lineMatch[0], '').trim();
    }
    
    return { lang, highlightLines, title };
}

// Initialize Markdown-it with plugins and custom configuration
// - html: true - enables HTML tags in source
// - linkify: true - converts URL-like text to links
// - typographer: true - enables language-neutral replacement + quotes beautification
// - highlight: uses highlight.js for syntax highlighting of code blocks with line highlighting support

const md = markdownit({
    html: true,
    linkify: true,
    typographer: true
});

// Helper function to decode HTML entities
function decodeHTMLEntities(text) {
  return text.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&apos;/g, "'");
}

// Custom slugify function that processes Handlebars helpers
function createSlug(text, handlebarsInstance = null) {
  let processedText = text;
  
  // Process Handlebars helpers if present
  if (handlebarsInstance && text.includes('{{')) {
    try {
      const template = handlebarsInstance.compile(text);
      const renderedContent = template({});
      // Strip HTML tags and decode HTML entities from rendered content for clean slug
      processedText = renderedContent.replace(/<[^>]*>/g, '');
      processedText = decodeHTMLEntities(processedText);
    } catch (error) {
      // If Handlebars processing fails, use original text
      console.warn('Failed to process Handlebars in heading for slug:', text, error.message);
    }
  }
  
  return slugify(processedText);
}
// Add support for image size syntax in markdown
// Example: ![alt text](image.jpg =100x200)
// This allows specifying width and height directly in markdown

// Use markdown-it-attrs first to avoid conflicts with other plugins
md.use(markdownItAttrs)

md.use(markdownItAnchor, { 
  slugify: (s) => {
    // For markdown-it-anchor, create consistent slugs
    // At this point, Handlebars helpers should already be processed in the HTML
    // But if they're still present, strip them for consistency
    let cleanText = s;
    if (s.includes('{{')) {
      cleanText = s.replace(/\{\{[^}]+\}\}/g, '').trim();
    }
    return slugify(cleanText || s);
  }
})
md.use(markdownItImsize)
md.use(markdownItToc, {
  includeLevel: [1, 2, 3, 4, 5, 6],
  containerClass: 'table-of-contents',
  markerPattern: /^\[\[toc\]\]/im,
  slugify: (s) => {
    // Use the same slugify function as markdown-it-anchor for consistency
    let cleanText = s;
    if (s.includes('{{')) {
      cleanText = s.replace(/\{\{[^}]+\}\}/g, '').trim();
    }
    return slugify(cleanText || s);
  }
})
md.use(markdownItMathjax3)
md.use(markdownItMermaid.default)
md.use(markdownItEmoji)

// Register tabs functionality
registerTabs(md, handlebarsInstance);

// Override the fence renderer to handle full info string (including title and line numbers)
// This must be done AFTER all plugins are registered to ensure our override is final
const defaultFenceRenderer = md.renderer.rules.fence;
md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';
    const content = token.content;
    
    // First, parse the info string for lang and title
    let { lang, highlightLines, title } = parseCodeFenceInfo(info);
    
    // If markdown-it-attrs processed line numbers, they'll be in token.attrs
    // Format: [['1,3', '']] or [['2-4', '']]
    if (token.attrs && token.attrs.length > 0 && highlightLines.size === 0) {
        // The first attribute key is the line spec (e.g., '1,3' or '2-4')
        const lineSpec = token.attrs[0][0];
        // Check if it looks like line numbers (contains digits, commas, or hyphens)
        if (/^[\d,\-\s]+$/.test(lineSpec)) {
            highlightLines = parseHighlightLines(lineSpec);
            // Remove the attrs so they don't get added to the output HTML
            token.attrs = null;
        }
    }
    
    // Apply syntax highlighting
    let highlightedCode = '';
    if (lang && hljs.getLanguage(lang)) {
        try {
            highlightedCode = hljs.highlight(content, { language: lang }).value;
        } catch (__) {
            highlightedCode = md.utils.escapeHtml(content);
        }
    } else {
        highlightedCode = md.utils.escapeHtml(content);
    }
    
    // Apply line highlighting if specified
    if (highlightLines.size > 0) {
        const lines = highlightedCode.split('\n');
        highlightedCode = lines.map((line, index) => {
            const lineNumber = index + 1;
            if (highlightLines.has(lineNumber)) {
                return `<span class="highlighted-line">${line}</span>`;
            }
            return line;
        }).join('\n');
    }
    
    // Build the language class attribute
    const langClass = lang ? ` class="language-${md.utils.escapeHtml(lang)}"` : '';
    
    // Add metadata comment if title exists (will be processed in post-processing)
    let codeWithMeta = highlightedCode;
    if (title) {
        codeWithMeta = `<!--CODE_BLOCK_META:title=${JSON.stringify(title)}-->` + highlightedCode;
    }
    
    // Return the complete code block HTML
    return `<pre><code${langClass}>${codeWithMeta}</code></pre>\n`;
};

// Custom renderer for links to convert .md to .html
const defaultLinkOpen = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');
  
  if (hrefIndex >= 0) {
    const href = token.attrs[hrefIndex][1];
    let newHref = href;
    
    // Get configuration to check friendlyUrl setting
    const { settings } = loadConfig();
    const friendlyUrl = settings?.site?.friendlyUrl || false;
    
    // Convert .md links based on friendlyUrl setting
    if (href.endsWith('.md')) {
      if (friendlyUrl) {
        // Remove .md extension (no .html replacement)
        newHref = href.replace(/\.md$/, '');
      } else {
        // Replace .md with .html
        newHref = href.replace(/\.md$/, '.html');
      }
    }
    // Also handle .md links with hash fragments (e.g., file.md#section)
    else if (href.includes('.md#')) {
      if (friendlyUrl) {
        // Remove .md extension (no .html replacement)
        newHref = href.replace(/\.md#/, '#');
      } else {
        // Replace .md with .html
        newHref = href.replace(/\.md#/, '.html#');
      }
    }
    
    // For internal links (starting with /), prepend baseUrl if available from env
    if (env && env.baseUrl && newHref.startsWith('/') && !newHref.startsWith('http')) {
      newHref = env.baseUrl + newHref.replace(/^\//, '');
    }
    
    token.attrs[hrefIndex][1] = newHref;
  }
  
  return defaultLinkOpen(tokens, idx, options, env, self);
};

// Custom renderer for images to add baseUrl to internal image paths
const defaultImage = md.renderer.rules.image || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');
  
  if (srcIndex >= 0) {
    const src = token.attrs[srcIndex][1];
    let newSrc = src;
    
    // For internal images (starting with /), prepend baseUrl if available from env
    if (env && env.baseUrl && newSrc.startsWith('/') && !newSrc.startsWith('http')) {
      const cleanBase = env.baseUrl.replace(/\/$/, '');
      const cleanPath = newSrc.replace(/^\//, '');
      newSrc = cleanBase + '/' + cleanPath;
    }
    
    token.attrs[srcIndex][1] = newSrc;
  }
  
  return defaultImage(tokens, idx, options, env, self);
};

// Extract headings from final HTML (after all processing)
function extractHeadingsFromHTML(html) {
  const toc = [];
  let currentH1 = null;
  let currentH2 = null;

  // Parse HTML to find headings with their IDs
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/gi;
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const slug = match[2];
    const htmlContent = match[3];
    
    // Strip HTML tags and decode HTML entities for clean text
    let title = htmlContent.replace(/<[^>]*>/g, '').trim();
    title = decodeHTMLEntities(title);

    const node = {
      level,
      title,
      slug,
      children: []
    };

    if (level === 1) {
      toc.push(node);
      currentH1 = node;
      currentH2 = null;
    } else if (level === 2 && currentH1) {
      currentH1.children.push(node);
      currentH2 = node;
    } else if (level === 3 && currentH2) {
      currentH2.children.push(node);
    } else if (level >= 4 && currentH2) {
      // Add H4+ headings to the last H3 if available, or to the H2
      const targetParent = currentH2.children.length > 0 ? currentH2.children[currentH2.children.length - 1] : currentH2;
      if (!targetParent.children) {
        targetParent.children = [];
      }
      targetParent.children.push(node);
    } else if (level === 2 && !currentH1) {
      // Handle H2 without H1 parent
      toc.push(node);
      currentH2 = node;
    } else if (level === 3 && !currentH2 && !currentH1) {
      // Handle H3 without parents
      toc.push(node);
    }
  }

  return toc;
}

/**
 * Extract headings from markdown tokens to build table of contents
 * @param {string} markdown - The markdown content to parse
 * @param {Object} handlebarsTemplate - Optional Handlebars instance for processing helpers
 * @returns {Array} Hierarchical array of heading objects with title, slug, level, and children
 */
function extractHeadings(markdown, handlebarsTemplate = null) {
  const tokens = md.parse(markdown, {});
  const toc = [];

  // Process heading tokens to build table of contents

  let currentH1 = null;
  let currentH2 = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.slice(1), 10); // h1 => 1, h2 => 2, etc.
      const titleToken = tokens[i + 1];
      let content = titleToken ? titleToken.content : 'NO_CONTENT';
      let cleanTitle = content;
      
      // Process Handlebars helpers in heading content for title
      if (handlebarsTemplate && content.includes('{{')) {
        try {
          const template = handlebarsTemplate.compile(content);
          const renderedContent = template({});
          // Strip HTML tags and decode HTML entities from rendered content for clean title
          cleanTitle = renderedContent.replace(/<[^>]*>/g, '');
          cleanTitle = decodeHTMLEntities(cleanTitle);
        } catch (error) {
          // If Handlebars processing fails, use original content
          console.warn('Failed to process Handlebars in heading:', content, error.message);
        }
      }
      
      const slug = createSlug(content, handlebarsTemplate);

      const node = {
        level,
        title: cleanTitle,
        slug,
        children: []
      };

      if (level === 1) {
        toc.push(node);
        currentH1 = node;
        currentH2 = null;
      } else if (level === 2 && currentH1) {
        currentH1.children.push(node);
        currentH2 = node;
      } else if (level === 3 && currentH2) {
        currentH2.children.push(node);
      } else if (level >= 4 && currentH2) {
        // Add H4+ headings to the last H3 if available, or to the H2
        const targetParent = currentH2.children.length > 0 ? currentH2.children[currentH2.children.length - 1] : currentH2;
        if (!targetParent.children) {
          targetParent.children = [];
        }
        targetParent.children.push(node);
      }
    }
  }

  return toc;
}


// regex to extract frontmatter from markdown
const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

// parse markdown and return props and html
async function parseMarkdown(markdownContent, filename = null) {
    const { settings, sidebars } = loadConfig();
    
    // Load plugins once when we have settings (deferred loading)
    if (!pluginsLoaded && settings) {
        const { loadPlugins } = await import('./hbshelpers.js');
        await loadPlugins(handlebarsInstance, settings);
        pluginsLoaded = true;
    }
    const match = frontmatterRegex.exec(markdownContent);

    let props = { };
    let markdownBody = markdownContent;

    if (match) {
        const yamlRaw = match[1];
        props = yaml.load(yamlRaw) || {};
        markdownBody = markdownContent.slice(match[0].length);
    }
    props = { ...settings, ...settings.globals, ...props, okidoki_version: packageVersion, version: packageVersion };

    // Build mappedProps for Handlebars context (extract headings after HTML generation)
    const mappedProps = { };
    

    const rawProperties = ['api_base_url', 'base_url', 'url', 'api_url', 'endpoint', 'path', 'link', 'href'];
    
    for (const [key, value] of Object.entries(props)) {
        if (typeof value === 'string') {
            // Store raw value for variables (prevents auto-linking)
            mappedProps[key] = value;
            
            // Also store processed version for display text (if not in raw list)
            if (!rawProperties.includes(key)) {
                mappedProps[`${key}_processed`] = md.renderInline(value);
            }
        } else if (key === 'keywords') {
            // Special handling for keywords - support both string and array formats
            if (Array.isArray(value)) {
                mappedProps[key] = value.join(', '); // String version for meta tags
                mappedProps[`${key}_array`] = value; // Array version for Handlebars loops
            } else if (typeof value === 'string') {
                mappedProps[key] = value;
                mappedProps[`${key}_array`] = value.split(',').map(k => k.trim()); // Convert string to array
            } else {
                mappedProps[key] = '';
                mappedProps[`${key}_array`] = [];
            }
        } else {
            mappedProps[key] = value;
        }
    }
    logger.log(`mappedProps: ${JSON.stringify(mappedProps, null, 2)}`);
    
    //console.log('headings', JSON.stringify(extractHeadings(markdownBody), null, 2));
    
    // Parse the markdown content
    // Default to handlebars processing unless explicitly disabled
    const shouldUseHandlebars = props.handlebars !== false;
    
    let compiledBody;
    if (shouldUseHandlebars) {
        // Compile with Handlebars
        const handlebarsCompiled = handlebarsInstance.compile(markdownBody);
        // Add filename to context for error reporting
        const contextWithFilename = {
            ...mappedProps,
            __currentFile: filename || 'unknown file'
        };
        compiledBody = handlebarsCompiled(contextWithFilename);
    } else {
        compiledBody = markdownBody;
    }
    
    if (shouldUseHandlebars) {
        try {
            // If customHTML is true, skip markdown parsing and use compiled content directly
            let html;
            if (props.customHTML) {
                html = compiledBody; // Use Handlebars-compiled HTML directly
            } else {
                html = md.render(compiledBody, { baseUrl: settings.site.baseUrl || '/' }); // Normal markdown processing
            }
            
            // Post-process HTML img tags to add baseUrl (markdown images are handled by renderer)
            const baseUrl = settings.site.baseUrl || '/';
            if (baseUrl !== '/') {
                const cleanBase = baseUrl.replace(/\/$/, '');
                html = html.replace(/<img([^>]*)\ssrc="\/([^"]*)"([^>]*)>/g, (match, before, src, after) => {
                    if (src.startsWith('http')) return match; // Skip external URLs
                    if (src.startsWith(cleanBase.replace(/^\//, ''))) return match; // Skip already processed
                    return `<img${before} src="${cleanBase}/${src}"${after}>`;
                });
            }
            
            // Add copy-to-clipboard buttons and titles to code blocks
            html = html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, codeAttrs, codeContent) => {
                const copyId = `copy-${Math.random().toString(36).substr(2, 9)}`;
                
                // Extract title from metadata comment
                let title = null;
                let cleanContent = codeContent;
                const metaMatch = codeContent.match(/<!--CODE_BLOCK_META:title=(".*?"|'.*?')-->/);
                if (metaMatch) {
                    try {
                        title = JSON.parse(metaMatch[1]);
                        // Remove the metadata comment from the content
                        cleanContent = codeContent.replace(metaMatch[0], '');
                    } catch (e) {
                        // If parsing fails, ignore the title
                    }
                }
                
                // Build the title header if present
                const titleHtml = title ? `<div class="code-block-title">${md.utils.escapeHtml(title)}</div>` : '';
                
                return `<div class="code-block-container relative">
                    ${titleHtml}
                    <button class="copy-button absolute ${title ? 'top-10' : 'top-2'} right-2 btn btn-xs btn-ghost opacity-70 hover:opacity-100" 
                            onclick="copyCodeToClipboard('${copyId}')" 
                            title="Copy to clipboard">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                    <pre id="${copyId}"><code${codeAttrs}>${cleanContent}</code></pre>
                </div>`;
            });
            
            // Replace include placeholders with actual HTML content (after markdown processing)
            if (global.okidokiIncludes && global.okidokiIncludes.size > 0) {
                for (const [token, content] of global.okidokiIncludes.entries()) {
                    html = html.replace(new RegExp(`<p>${token}</p>`, 'g'), content);
                    html = html.replace(new RegExp(token, 'g'), content);
                }
                // Clear the includes for this processing cycle
                global.okidokiIncludes.clear();
            }
            
            // Extract headings from final HTML for navigation
            const headings = extractHeadingsFromHTML(html);
            mappedProps.headings = headings;
            
            return { props: mappedProps, md: markdownBody, html };
        } catch (error) {
            const fileContext = filename ? ` in file: ${filename}` : '';
            console.error(`Handlebars compilation error${fileContext}:`, error);
            // Fall back to non-handlebars processing
            let html;
            if (props.customHTML) {
                html = markdownBody; // Use raw content directly for custom HTML
            } else {
                html = md.render(markdownBody, { baseUrl: settings.site.baseUrl || '/' }); // Normal markdown processing
            }
            
            // Extract headings from final HTML for navigation
            const headings = extractHeadingsFromHTML(html);
            mappedProps.headings = headings;
            
            return { props: mappedProps, md: markdownBody, html };
        }
    } else {
        // If customHTML is true, skip markdown parsing and use content directly
        let html;
        if (props.customHTML) {
            html = compiledBody; // Use HTML content directly
        } else {
            html = md.render(compiledBody, { baseUrl: settings.site.baseUrl || '/' }); // Normal markdown processing
        }
        
        // Post-process HTML img tags to add baseUrl (markdown images are handled by renderer)
        const baseUrl = settings.site.baseUrl || '/';
        if (baseUrl !== '/') {
            const cleanBase = baseUrl.replace(/\/$/, '');
            html = html.replace(/<img([^>]*)\ssrc="\/([^"]*)"([^>]*)>/g, (match, before, src, after) => {
                if (src.startsWith('http')) return match; // Skip external URLs
                if (src.startsWith(cleanBase.replace(/^\//, ''))) return match; // Skip already processed
                return `<img${before} src="${cleanBase}/${src}"${after}>`;
            });
        }
        
        // Add copy-to-clipboard buttons and titles to code blocks
        html = html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, codeAttrs, codeContent) => {
            const copyId = `copy-${Math.random().toString(36).substr(2, 9)}`;
            
            // Extract title from metadata comment
            let title = null;
            let cleanContent = codeContent;
            const metaMatch = codeContent.match(/<!--CODE_BLOCK_META:title=(".*?"|'.*?')-->/);
            if (metaMatch) {
                try {
                    title = JSON.parse(metaMatch[1]);
                    // Remove the metadata comment from the content
                    cleanContent = codeContent.replace(metaMatch[0], '');
                } catch (e) {
                    // If parsing fails, ignore the title
                }
            }
            
            // Build the title header if present
            const titleHtml = title ? `<div class="code-block-title">${md.utils.escapeHtml(title)}</div>` : '';
            
            return `<div class="code-block-container relative">
                ${titleHtml}
                <button class="copy-button absolute ${title ? 'top-10' : 'top-2'} right-2 btn btn-xs btn-ghost opacity-70 hover:opacity-100" 
                        onclick="copyCodeToClipboard('${copyId}')" 
                        title="Copy to clipboard">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </button>
                <pre id="${copyId}"><code${codeAttrs}>${cleanContent}</code></pre>
            </div>`;
        });
        
        // Extract headings from final HTML for navigation
        const headings = extractHeadingsFromHTML(html);
        mappedProps.headings = headings;
        
        return { props: mappedProps, md: markdownBody, html };
    }
}

/**
 * Render a complete page using templates and configuration
 * @param {string} templateName - The template to use for rendering
 * @param {Object} data - Object containing props, html, page, and id
 * @returns {string} The rendered HTML page
 */
function renderPage(templateName, { props, html, page, id }) {
    const { settings, sidebars } = loadConfig();
    const baseUrl = settings.site.baseUrl || '/';
    
    // Reserved section names that shouldn't be treated as content sections
    const reservedSections = ['navbar', 'footer'];
    
    // Find sidebar configuration for current page by recursively searching menu items
    const findSidebarConfig = (items, currentPath) => {
        if (!items) return null;
        for (const item of items) {
            if (item.document) {
                const itemPath = transformDocumentPath(item.document);
                
                // Direct match
                if (itemPath === currentPath) {
                    return item;
                }
                
                // Handle directory-style paths: /blog should match /blog/index.html
                const normalizedItemPath = itemPath.replace(/\/$/, '').replace(/\.html$/, '');
                const normalizedCurrentPath = currentPath.replace(/\/$/, '').replace(/\.html$/, '');
                
                // Check if item path is a directory path that should resolve to index
                // e.g., /blog matches /blog/index or /blog.html matches /blog/index.html
                if (normalizedCurrentPath === `${normalizedItemPath}/index` ||
                    normalizedCurrentPath === normalizedItemPath) {
                    return item;
                }
            }
            if (item.items) {
                const found = findSidebarConfig(item.items, currentPath);
                if (found) return found;
            }
        }
        return null;
    };

    // Helper to check if a page belongs to a section based on path prefix
    const checkSectionByPath = (sectionItems, pagePath) => {
        if (!sectionItems || sectionItems.length === 0) return false;
        
        // Get all document paths in this section
        const getAllPaths = (items) => {
            const paths = [];
            for (const item of items) {
                if (item.document) {
                    const itemPath = transformDocumentPath(item.document);
                    const normalizedPath = itemPath.replace(/\/$/, '');
                    paths.push(normalizedPath);
                    
                    // Also add the directory path if this is an index file
                    if (normalizedPath.endsWith('/index.html')) {
                        paths.push(normalizedPath.replace('/index.html', ''));
                    } else if (normalizedPath.endsWith('/index')) {
                        paths.push(normalizedPath.replace('/index', ''));
                    }
                }
                if (item.items) {
                    paths.push(...getAllPaths(item.items));
                }
            }
            return paths;
        };
        
        const sectionPaths = getAllPaths(sectionItems);
        const normalizedPagePath = pagePath.replace(/\/$/, '');
        
        // Check if page path starts with any section path
        for (const sectionPath of sectionPaths) {
            if (normalizedPagePath === sectionPath || 
                normalizedPagePath.startsWith(sectionPath + '/')) {
                return true;
            }
        }
        return false;
    };
    
    // Detect which sidebar section this page belongs to
    let activeSidebarSection = 'menu'; // Default to menu
    let sidebarItem = null;
    
    // First, try to find exact match in any section
    for (const sectionKey of Object.keys(sidebars)) {
        if (reservedSections.includes(sectionKey)) {
            continue; // Skip navbar and footer
        }
        
        const foundItem = findSidebarConfig(sidebars[sectionKey], page.path);
        if (foundItem) {
            activeSidebarSection = sectionKey;
            sidebarItem = foundItem;
            logger.log(`Page ${page.path} belongs to section: ${activeSidebarSection} (exact match)`);
            break;
        }
    }
    
    // If not found by exact match, try path-based matching
    if (!sidebarItem) {
        for (const sectionKey of Object.keys(sidebars)) {
            if (reservedSections.includes(sectionKey)) {
                continue; // Skip navbar and footer
            }
            
            if (checkSectionByPath(sidebars[sectionKey], page.path)) {
                activeSidebarSection = sectionKey;
                logger.log(`Page ${page.path} belongs to section: ${activeSidebarSection} (path match)`);
                break;
            }
        }
    }
    
    // If still not found in any section, check navbar as fallback
    if (!sidebarItem) {
        sidebarItem = findSidebarConfig(sidebars.navbar, page.path);
    }
    
    // Transform the active sidebar section items
    const transformedSidebars = {
        menu: transformSidebarItems(sidebars[activeSidebarSection], baseUrl) || []
    };
    
    const transformedSidebarsNavbar = {
        navbar: transformSidebarItems(sidebars.navbar, baseUrl)
    };
    const transformedFooter = transformSidebarItems(sidebars.footer, baseUrl);
    //console.log(`transformedSidebars: ${JSON.stringify(transformedSidebars, null, 2)}`);
    //console.log(`context: props: ${JSON.stringify(props, null, 2)}, html:  ${JSON.stringify(html, null, 2)}`);

    // Process pagenav configuration
    const pagenavConfig = props.pagenav || (sidebarItem && sidebarItem.pagenav) || false;
    let pageNavigation = null;
    
    if (pagenavConfig && props.headings && props.headings.length > 0) {
        // Determine max levels to show (default to 2 for h2,h3)
        let maxLevels = 2;
        if (typeof pagenavConfig === 'object' && pagenavConfig.levels) {
            maxLevels = pagenavConfig.levels;
        }
        
        // Extract h2+ headings from the tree structure for page navigation (skip h1 roots)
        const extractPageNavigation = (headings, maxLevel = maxLevels + 1) => {
            const result = [];
            
            for (const heading of headings) {
                if (heading.level === 1) {
                    // For h1 headings, extract their children (h2+)
                    if (heading.children && heading.children.length > 0) {
                        for (const child of heading.children) {
                            if (child.level <= maxLevel) {
                                result.push({
                                    ...child,
                                    children: filterByLevel(child.children || [], child.level + 1, maxLevel)
                                });
                            }
                        }
                    }
                } else if (heading.level >= 2 && heading.level <= maxLevel) {
                    // For h2+ headings at root level
                    result.push({
                        ...heading,
                        children: filterByLevel(heading.children || [], heading.level + 1, maxLevel)
                    });
                }
            }
            
            return result;
        };
        
        // Filter headings by level range and recursively process their children
        const filterByLevel = (headings, minLevel, maxLevel) => {
            return headings.filter(h => h.level >= minLevel && h.level <= maxLevel)
                          .map(h => ({
                              ...h,
                              children: filterByLevel(h.children || [], h.level + 1, maxLevel)
                          }));
        };
        
        pageNavigation = extractPageNavigation(props.headings);
    }

    // Determine layout configuration from frontmatter and/or sidebar config
    const layoutConfig = {
        customHTML: props.customHTML || (sidebarItem && sidebarItem.customHTML) || false,
        hideMenu: props.hideMenu || props.hideSidebar || (sidebarItem && sidebarItem.hideMenu) || false,
        hideBreadcrumbs: props.hideBreadcrumbs || (sidebarItem && sidebarItem.hideBreadcrumbs) || false,
        hideFooter: props.hideFooter || (sidebarItem && sidebarItem.hideFooter) || false,
        fullWidth: props.fullWidth || props.hideMenu || props.hideSidebar || (sidebarItem && (sidebarItem.fullWidth || sidebarItem.hideMenu)) || false,
        pagenav: !!pagenavConfig
    };

    const pageData = {
        copyright: {
            year: new Date().getFullYear(),
            name: settings.site.title
        },
        breadcrumbs: page.path.split('/').filter(Boolean),
        settings: settings,
        sidebars: transformedSidebars,
        navbar: transformedSidebarsNavbar.navbar,
        footer: transformedFooter || [],
        title: props.title || settings.site.title,
        baseUrl: settings.site.baseUrl || '/',
        keywords: props.keywords || '', // Add keywords to top-level context
        language: props.language || settings.site.language || '', // Add language to top-level context (page language overrides site default)
        html,
        props,
        page,
        layout: layoutConfig,
        pageNavigation: pageNavigation
    };
    //logger.log(`pageData: ${JSON.stringify({...pageData}, null, 2)}`);
    // First render the content
    const content = templates.docpage({ ...pageData });
    return content;
}

export { parseMarkdown, renderPage, loadConfig, clearConfigCache, transformSidebarItems, transformDocumentPath }; 