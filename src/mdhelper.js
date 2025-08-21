import handlebars from 'handlebars';
import yaml from 'js-yaml';
import markdownit from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor';
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
                }
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
        const handlebarsResult = compiledBody(mappedProps);
        const html = md.render(handlebarsResult);
        return { props: mappedProps, md: markdownBody, html };
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

export { parseMarkdown, renderPage }; 