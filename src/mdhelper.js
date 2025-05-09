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


// Get package directory path
const __filename = fileURLToPath(import.meta.url);
const packageDir = path.dirname(path.dirname(__filename));

// Configuration loading function
function loadConfig() {
    try {
        const configPath = path.join(process.cwd(), 'okidoki.yaml');
        const settings = yaml.load(fs.readFileSync(configPath, 'utf8'));

        const sidebarsYaml = fs.readFileSync(path.join(process.cwd(), 'sidebars.yaml'), 'utf8');
        const sidebars = yaml.load(sidebarsYaml);

        return { settings, sidebars };
    } catch (error) {
        // Return default configuration if files don't exist
        return {
            settings: {
                site: {
                    title: "Documentation",
                    description: "Documentation generated with Okidoki",
                    theme: {
                        light: "bumblebee",
                        dark: "night"
                    }
                }
            },
            sidebars: {
                menu: [],
                navbar: []
            }
        };
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
registerTabs(md);

// Create a new renderer instance
/*
const renderer = {};
    
// Configure marked to use highlight.js
const marked = new Marked(
    markedHighlight({
      emptyLangClass: 'hljs',
      langPrefix: 'hljs language-',
      highlight(code, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );
  registerTabs(marked);

// Override renderer methods
// heading renderer
renderer.heading = function({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/-+$/, '');

    return `
            <h${depth}>
              <a name="${escapedText}" class="anchor" href="#${escapedText}">
                <span class="header-link"></span>
              </a>
              ${text}
            </h${depth}>`;
};

// image renderer
renderer.image = function(token) {
    const titleAttr = token.title ? ` title="${token.title}"` : '';
    return `<img src="${token.href}" alt="${token.text}"${titleAttr} class="max-w-full h-auto">`;
};

// Set marked options
marked.use({ renderer });
*/
// regex to extract frontmatter from markdown
const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

// parse markdown and return props and html
async function parseMarkdown(markdownContent) {
    const match = frontmatterRegex.exec(markdownContent);

    let props = {};
    let markdownBody = markdownContent;

    if (match) {
        const yamlRaw = match[1];
        props = yaml.load(yamlRaw) || {};
        markdownBody = markdownContent.slice(match[0].length);
    }

    // Parse the markdown content
    const compiledBody = props.handlebars ? handlebars.compile(markdownBody) : markdownBody;
    const mappedProps = {};
    for (const [key, value] of Object.entries(props)) {
        mappedProps[key] = typeof value === 'string' ? md.renderInline(value) : value;
    }
    const html = md.render(props.handlebars ? compiledBody(mappedProps) : compiledBody);
    return { props: mappedProps, md: markdownBody, html };
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
        settings: settings,
        sidebars: transformedSidebars,
        navbar: transformedSidebarsNavbar.navbar,
        title: settings.site.title,
        baseUrl: settings.site.baseUrl || '/',
        html,
        props,
        page
    };
    //console.log(`sidebars: ${JSON.stringify(pageData.sidebars, null, 2)}`);
    // First render the content
    const content = templates.docpage({ ...pageData });
    return content;
}

export { parseMarkdown, renderPage }; 