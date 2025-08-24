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

// Configuration loading function
function loadConfig() {
    // Return cached config if already loaded
    if (configCache) {
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
                theme: {
                    light: "bumblebee",
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
                minSearchLength: 2
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
        const configPath = path.join(process.cwd(), 'okidoki.yaml');
        const userSettings = yaml.load(fs.readFileSync(configPath, 'utf8'));
        const settings = deepMerge(defaultConfig.settings, userSettings);

        const sidebarsYaml = fs.readFileSync(path.join(process.cwd(), 'sidebars.yaml'), 'utf8');
        const sidebars = yaml.load(sidebarsYaml);

        configCache = { settings, sidebars };
        return configCache;
    } catch (error) {
        // Return default configuration if files don't exist
        configCache = defaultConfig;
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
function transformSidebarItems(items) {
    if (!items) return items;
    return items.map(item => {
        if (typeof item === 'string') {
            return transformDocumentPath(item);
        }
        if (item.items) {
            return {
                ...item,
                items: transformSidebarItems(item.items)
            };
        }
        if (item.document) {
            return {
                ...item,
                document: transformDocumentPath(item.document)
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
    'warning': 'warning',
    'danger': 'error'
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
                }

                return `<div role="alert" class="alert alert-${alertType} mb-2">${iconSvg}<span>`;
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
    
    // Convert .md links to .html (for internal documentation links)
    if (href.endsWith('.md')) {
      token.attrs[hrefIndex][1] = href.replace(/\.md$/, '.html');
    }
    // Also handle .md links with hash fragments (e.g., file.md#section)
    else if (href.includes('.md#')) {
      token.attrs[hrefIndex][1] = href.replace(/\.md#/, '.html#');
    }
  }
  
  return defaultLinkOpen(tokens, idx, options, env, self);
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
async function parseMarkdown(markdownContent) {
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
    for (const [key, value] of Object.entries(props)) {
        mappedProps[key] = typeof value === 'string' ? md.renderInline(value) : value;
    }
    logger.log(`mappedProps: ${JSON.stringify(mappedProps, null, 2)}`);
    //console.log('headings', JSON.stringify(extractHeadings(markdownBody), null, 2));
    
    if (props.handlebars) {
        try {
            const handlebarsResult = compiledBody(mappedProps);
            const html = md.render(handlebarsResult);
            return { props: mappedProps, md: markdownBody, html };
        } catch (error) {
            console.error('Handlebars compilation error:', error);
            // Fall back to non-handlebars processing
            const html = md.render(markdownBody);
            return { props: mappedProps, md: markdownBody, html };
        }
    } else {
        const html = md.render(compiledBody);
        return { props: mappedProps, md: markdownBody, html };
    }
}

function renderPage(templateName, { props, html, page, id }) {
    const { settings, sidebars } = loadConfig();
    const transformedSidebars = {
        menu: transformSidebarItems(sidebars.menu)
    };
    const transformedSidebarsNavbar = {
        navbar: transformSidebarItems(sidebars.navbar)
    };
    //console.log(`transformedSidebars: ${JSON.stringify(transformedSidebars, null, 2)}`);
    //console.log(`context: props: ${JSON.stringify(props, null, 2)}, html:  ${JSON.stringify(html, null, 2)}`);
    const pageData = {
        copyright: {
            year: new Date().getFullYear(),
            name: settings.site.title
        },
        breadcrumbs: page.path.split('/').filter(Boolean),
        settings: settings,
        sidebars: transformedSidebars,
        navbar: transformedSidebarsNavbar.navbar,
        title: settings.site.title,
        baseUrl: settings.site.baseUrl || '/',
        html,
        props,
        page
    };
    //logger.log(`pageData: ${JSON.stringify({...pageData}, null, 2)}`);
    // First render the content
    const content = templates.docpage({ ...pageData });
    return content;
}

export { parseMarkdown, renderPage, loadConfig }; 