import handlebars from 'handlebars';
import yaml from 'js-yaml';
import markdownit from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor';
import markdownItContainer from 'markdown-it-container';
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
                favicon: "/favicon.ico",
                logo: "/okidokilogo.svg",
                theme: {
                    light: "light",
                    dark: "night"
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
            }
        },
        sidebars: {
            menu: [],
            navbar: []
        }
    };

    // Deep merge function
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
    
    // Split the path into base path and anchor
    const [basePath, anchor] = path.split('#');
    
    // Transform the base path
    let transformedPath = basePath;
    // If path already has .html extension, return as is
    if (transformedPath.endsWith('.html')) transformedPath = transformedPath;
    // If path has .md extension, replace with .html
    else if (transformedPath.endsWith('.md')) transformedPath = transformedPath.replace('.md', '.html');
    // If path has no extension, add .html
    else transformedPath = `${transformedPath}.html`;
    
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

// Register custom helpers
registerHelpers(handlebarsInstance);

// Define the page templates
const templates = {
    layout: handlebarsInstance.compile(layoutTemplate),
    docpage: handlebarsInstance.compile(docpageTemplate)
};


const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) { }
        }

        return ''; // use external default escaping
    }
});

md.use(markdownItAnchor, { slugify: s => slugify(s) })

// Add admonition support using markdown-it-container
// Map admonition types to DaisyUI alert classes
const admonitionTypes = {
    'info': 'info',
    'tip': 'success', 
    'success': 'success',
    'warning': 'warning',
    'danger': 'error',
    'neutral': ''
};

// Create a container for each admonition type
Object.entries(admonitionTypes).forEach(([admonitionType, alertType]) => {
    md.use(markdownItContainer, admonitionType, {
        render: function (tokens, idx) {
            const token = tokens[idx];

            if (token.nesting === 1) {
                // Opening tag
                let iconSvg = '';
                switch (alertType) {
                    case 'success': // Official DaisyUI success icon
                        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
                        break;
                    case 'info': // Official DaisyUI info icon
                        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                        break;
                    case 'warning': // Official DaisyUI warning icon
                        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>';
                        break;
                    case 'error': // Official DaisyUI error icon
                        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
                        break;
                    case '': // Neutral/default alert (no color modifier)
                        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                        break;
                }

                const alertClass = alertType ? `alert alert-${alertType}` : 'alert';
                return `<div role="alert" class="${alertClass} mb-2">${iconSvg}<span>`;
            } else {
                // Closing tag
                return '</span></div>\n\n';
            }
        }
    });
});

// Add badge support using markdown-it-container
// Map badge types to DaisyUI badge classes
const badgeTypes = {
    'badge': 'badge',
    'badge-neutral': 'badge badge-neutral',
    'badge-primary': 'badge badge-primary',
    'badge-secondary': 'badge badge-secondary', 
    'badge-accent': 'badge badge-accent',
    'badge-info': 'badge badge-info',
    'badge-success': 'badge badge-success',
    'badge-warning': 'badge badge-warning',
    'badge-error': 'badge badge-error',
    'badge-outline': 'badge badge-outline',
    'badge-ghost': 'badge badge-ghost',
    'badge-soft': 'badge badge-soft',
    'badge-xs': 'badge badge-xs',
    'badge-sm': 'badge badge-sm',
    'badge-md': 'badge badge-md',
    'badge-lg': 'badge badge-lg',
    'badge-xl': 'badge badge-xl'
};

// Create a container for each badge type
Object.entries(badgeTypes).forEach(([badgeType, badgeClasses]) => {
    md.use(markdownItContainer, badgeType, {
        render: function (tokens, idx) {
            const token = tokens[idx];

            if (token.nesting === 1) {
                // Opening tag - render as inline span with badge classes
                return `<span class="${badgeClasses}">`;
            } else {
                // Closing tag
                return '</span>';
            }
        },
        marker: ':'
    });
});

// Add inline badge support
function badge_inline(state, silent) {
    const start = state.pos;
    const max = state.posMax;
    
    // Check for opening :::
    if (start + 3 >= max) return false;
    if (state.src.slice(start, start + 3) !== ':::') return false;
    
    // Find the badge type
    const typeStart = start + 3;
    let typeEnd = typeStart;
    while (typeEnd < max && state.src[typeEnd] !== ' ' && state.src[typeEnd] !== ':' && state.src[typeEnd] !== '\n') {
        typeEnd++;
    }
    
    if (typeEnd === typeStart) return false; // No badge type found
    
    const badgeType = state.src.slice(typeStart, typeEnd);
    
    // Check if this is a valid badge type
    if (!badgeTypes[badgeType]) return false;
    
    // Skip whitespace after badge type
    let contentStart = typeEnd;
    while (contentStart < max && state.src[contentStart] === ' ') {
        contentStart++;
    }
    
    // Find closing ::: (must be on the same line for inline badges)
    let pos = contentStart;
    let foundEnd = false;
    let contentEnd = contentStart;
    
    while (pos + 2 < max && state.src[pos] !== '\n') {
        if (state.src.slice(pos, pos + 3) === ':::') {
            contentEnd = pos;
            foundEnd = true;
            break;
        }
        pos++;
    }
    
    if (!foundEnd) return false;
    
    const content = state.src.slice(contentStart, contentEnd).trim();
    if (!content) return false;
    
    if (!silent) {
        const token = state.push('badge_inline', 'span', 0);
        token.content = content;
        token.meta = { badgeType, badgeClasses: badgeTypes[badgeType] };
    }
    
    state.pos = contentEnd + 3;
    return true;
}

// Add the inline rule
md.inline.ruler.before('emphasis', 'badge_inline', badge_inline);

// Add renderer for inline badge tokens
md.renderer.rules.badge_inline = function(tokens, idx) {
    const token = tokens[idx];
    const { badgeClasses } = token.meta;
    const content = md.utils.escapeHtml(token.content);
    return `<span class="${badgeClasses}">${content}</span>`;
};

// Post-process badges to remove paragraph wrapping from block-level badges
const originalRenderBadge = md.render;
md.render = function(src, env) {
    let result = originalRenderBadge.call(this, src, env);
    
    // Clean up badge HTML - remove paragraph tags inside badge spans
    // Escape special regex characters and join badge class names
    const escapedBadgeClasses = Object.values(badgeTypes)
        .map(className => className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    
    const badgeRegex = new RegExp(`(<span class="(${escapedBadgeClasses})">)<p>(.*?)<\\/p>\\s*(<\\/span>)`, 'g');
    result = result.replace(badgeRegex, '$1$3$4');
    
    return result;
};

// Add tabs support by pre-processing markdown to convert :::tabs syntax to {{#tabs}} syntax
const originalRender = md.render;
md.render = function(src, env) {
    // Pre-process: Convert :::tabs/:::tab syntax to Handlebars syntax
    let processedSrc = src;
    
    // Helper function to process tab content while preserving code block integrity
    function processTabContent(content) {
        // Check if content is a single code block
        const codeBlockMatch = content.trim().match(/^```(\w+)?\n([\s\S]*?)\n```$/);
        
        if (codeBlockMatch) {
            // This is a single code block - process it directly to preserve empty lines
            const language = codeBlockMatch[1] || '';
            const code = codeBlockMatch[2];
            
            // Use highlight.js directly if language is specified
            if (language && hljs.getLanguage(language)) {
                try {
                    const highlighted = hljs.highlight(code, { language }).value;
                    return `<pre><code class="language-${language}">${highlighted}</code></pre>`;
                } catch (e) {
                    // Fall back to escaped plain code block
                    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return `<pre><code class="language-${language}">${escaped}</code></pre>`;
                }
            } else {
                // Escape HTML for plain code blocks
                const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return `<pre><code>${escaped}</code></pre>`;
            }
        } else {
            // Mixed content or regular markdown - use normal processing
            return originalRender.call(md, content);
        }
    }

    // Convert tabs syntax - match complete :::tabs...:::  blocks individually
    // Use non-greedy matching to find each tabs block separately
    processedSrc = processedSrc.replace(/:::tabs\n([\s\S]*?)\n:::\s*(?=\n\n|\n#|\n[^:]|$)/g, function(match, tabsContent) {
        // Parse individual tabs by finding :::tab patterns (strict: no spaces)
        const tabs = [];
        const parts = tabsContent.split(/(?=:::tab [^\n]+)/);
        
        parts.forEach(part => {
            const trimmedPart = part.trim();
            if (trimmedPart.startsWith(':::tab ')) {
                const lines = trimmedPart.split('\n');
                const titleLine = lines[0];
                const title = titleLine.replace(':::tab ', '').trim();
                
                // Find content up to the closing :::
                const contentLines = lines.slice(1);
                let endIdx = contentLines.indexOf(':::');
                if (endIdx === -1) endIdx = contentLines.length;
                
                // Be more careful about preserving the exact content structure
                const content = contentLines.slice(0, endIdx).join('\n');
                
                // Only trim leading/trailing empty lines, preserving internal structure
                const trimmedContent = content.replace(/^\n+/, '').replace(/\n+$/, '');
                
                if (trimmedContent) {
                    tabs.push({ title, content: trimmedContent });
                }
            }
        });
        
        if (tabs.length === 0) {
            return match;
        }
        
        // Generate DaisyUI tabs HTML directly with proper formatting
        const tabsId = `tabs_${Math.random().toString(36).substring(2, 11)}`;
        let result = `<div class="tabs tabs-bordered">\n`;
        
        tabs.forEach((tab, index) => {
            const isChecked = index === 0 ? 'checked="checked"' : '';
            result += `<input type="radio" name="${tabsId}" class="tab" aria-label="${tab.title}" ${isChecked}/>\n`;
            result += `<div class="tab-content border-base-300 bg-base-100 p-2">\n`;
            
            // Use a placeholder-based approach to prevent re-processing of code blocks
            const placeholder = `__TAB_CONTENT_${Math.random().toString(36).substring(2)}__`;
            const processedContent = processTabContent(tab.content);
            
            // Store the processed content and use a placeholder
            if (!md.__tabContentCache) md.__tabContentCache = {};
            md.__tabContentCache[placeholder] = processedContent;
            
            result += placeholder;
            
            result += `\n</div>\n`;
        });
        
        result += `</div>\n`;
        
        return result;
    });
    
    // Call the original render with processed markdown
    let finalHtml = originalRender.call(this, processedSrc, env);
    
    // Replace tab content placeholders with processed content
    if (this.__tabContentCache) {
        for (const [placeholder, content] of Object.entries(this.__tabContentCache)) {
            finalHtml = finalHtml.replace(new RegExp(placeholder, 'g'), content);
        }
        // Clear the cache
        delete this.__tabContentCache;
    }
    
    return finalHtml;
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
    
    // Convert .md links to .html (for internal documentation links)
    if (href.endsWith('.md')) {
      newHref = href.replace(/\.md$/, '.html');
    }
    // Also handle .md links with hash fragments (e.g., file.md#section)
    else if (href.includes('.md#')) {
      newHref = href.replace(/\.md#/, '.html#');
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

// Register tabs helper
registerTabs(md, handlebarsInstance);


function extractHeadings(markdown) {
  const tokens = md.parse(markdown, {});
  const toc = [];

  let currentH1 = null;
  let currentH2 = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.slice(1), 10); // h1 => 1, h2 => 2, etc.
      const titleToken = tokens[i + 1];
      const content = titleToken.content;
      const slug = slugify(content);

      const node = {
        level,
        title: content,
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
    const match = frontmatterRegex.exec(markdownContent);

    let props = { };
    let markdownBody = markdownContent;

    if (match) {
        const yamlRaw = match[1];
        props = yaml.load(yamlRaw) || {};
        markdownBody = markdownContent.slice(match[0].length);
    }
    props = { ...settings, ...props };

    // Parse the markdown content
    const compiledBody = props.handlebars ? handlebarsInstance.compile(markdownBody) : markdownBody;
    const mappedProps = { };
    
    // Properties that should NOT be auto-linked (preserve as raw strings)
    const rawProperties = ['api_base_url', 'base_url', 'url', 'api_url', 'endpoint', 'path', 'link', 'href'];
    
    for (const [key, value] of Object.entries(props)) {
        if (typeof value === 'string') {
            // Store raw value for variables (prevents auto-linking)
            mappedProps[key] = value;
            
            // Also store processed version for display text (if not in raw list)
            if (!rawProperties.includes(key)) {
                mappedProps[`${key}_processed`] = md.renderInline(value);
            }
        } else {
            mappedProps[key] = value;
        }
    }
    logger.log(`mappedProps: ${JSON.stringify(mappedProps, null, 2)}`);
    //console.log('headings', JSON.stringify(extractHeadings(markdownBody), null, 2));
    
    if (props.handlebars) {
        try {
            const handlebarsResult = compiledBody(mappedProps);
            let html = md.render(handlebarsResult, { baseUrl: settings.site.baseUrl || '/' });
            
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
            
            // Add copy-to-clipboard buttons to code blocks
            html = html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, codeAttrs, codeContent) => {
                const copyId = `copy-${Math.random().toString(36).substr(2, 9)}`;
                return `<div class="code-block-container relative">
                    <button class="copy-button absolute top-2 right-2 btn btn-xs btn-ghost opacity-70 hover:opacity-100" 
                            onclick="copyCodeToClipboard('${copyId}')" 
                            title="Copy to clipboard">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                    <pre id="${copyId}"><code${codeAttrs}>${codeContent}</code></pre>
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
            
            return { props: mappedProps, md: markdownBody, html };
        } catch (error) {
            const fileContext = filename ? ` in file: ${filename}` : '';
            console.error(`Handlebars compilation error${fileContext}:`, error);
            // Fall back to non-handlebars processing
            const html = md.render(markdownBody, { baseUrl: settings.site.baseUrl || '/' });
            return { props: mappedProps, md: markdownBody, html };
        }
    } else {
        let html = md.render(compiledBody, { baseUrl: settings.site.baseUrl || '/' });
        
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
        
        // Add copy-to-clipboard buttons to code blocks
        html = html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, codeAttrs, codeContent) => {
            const copyId = `copy-${Math.random().toString(36).substr(2, 9)}`;
            return `<div class="code-block-container relative">
                <button class="copy-button absolute top-2 right-2 btn btn-xs btn-ghost opacity-70 hover:opacity-100" 
                        onclick="copyCodeToClipboard('${copyId}')" 
                        title="Copy to clipboard">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </button>
                <pre id="${copyId}"><code${codeAttrs}>${codeContent}</code></pre>
            </div>`;
        });
        
        return { props: mappedProps, md: markdownBody, html };
    }
}

function renderPage(templateName, { props, html, page, id }) {
    const { settings, sidebars } = loadConfig();
    const baseUrl = settings.site.baseUrl || '/';
    const transformedSidebars = {
        menu: transformSidebarItems(sidebars.menu, baseUrl)
    };
    const transformedSidebarsNavbar = {
        navbar: transformSidebarItems(sidebars.navbar, baseUrl)
    };
    const transformedFooter = transformSidebarItems(sidebars.footer, baseUrl);
    //console.log(`transformedSidebars: ${JSON.stringify(transformedSidebars, null, 2)}`);
    //console.log(`context: props: ${JSON.stringify(props, null, 2)}, html:  ${JSON.stringify(html, null, 2)}`);
    // Find sidebar configuration for current page
    const findSidebarConfig = (items, currentPath) => {
        if (!items) return null;
        for (const item of items) {
            if (item.document && transformDocumentPath(item.document) === currentPath) {
                return item;
            }
            if (item.items) {
                const found = findSidebarConfig(item.items, currentPath);
                if (found) return found;
            }
        }
        return null;
    };

    // Check both menu and navbar for matching configuration
    const sidebarItem = findSidebarConfig(sidebars.menu, page.path) || 
                       findSidebarConfig(sidebars.navbar, page.path);

    // Determine layout configuration from frontmatter and/or sidebar config
    const layoutConfig = {
        hideMenu: props.hideMenu || props.hideSidebar || (sidebarItem && sidebarItem.hideMenu) || false,
        hideBreadcrumbs: props.hideBreadcrumbs || (sidebarItem && sidebarItem.hideBreadcrumbs) || false,
        hideFooter: props.hideFooter || (sidebarItem && sidebarItem.hideFooter) || false,
        fullWidth: props.fullWidth || props.hideMenu || props.hideSidebar || (sidebarItem && (sidebarItem.fullWidth || sidebarItem.hideMenu)) || false
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
        title: settings.site.title,
        baseUrl: settings.site.baseUrl || '/',
        html,
        props,
        page,
        layout: layoutConfig
    };
    //logger.log(`pageData: ${JSON.stringify({...pageData}, null, 2)}`);
    // First render the content
    const content = templates.docpage({ ...pageData });
    return content;
}

export { parseMarkdown, renderPage, loadConfig, clearConfigCache, transformSidebarItems, transformDocumentPath }; 