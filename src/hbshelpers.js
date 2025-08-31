import handlebars from 'handlebars';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import fs from 'fs';
import path from 'path';

// Create a markdown parser instance similar to the one in mdhelper.js
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



function registerHelpers(handlebarsInstance) {
    // Register the equals Handlebars helper
    handlebarsInstance.registerHelper('eq', function (a, b, options) {
        const ignoreCase = options.hash.ignoreCase || false;
        if (ignoreCase && typeof a === 'string' && typeof b === 'string') {
            return a.toLowerCase() === b.toLowerCase() ? options.fn(this) : options.inverse(this);
        }
        return a === b ? options.fn(this) : options.inverse(this);
    });

    // Helpers
    handlebarsInstance.registerHelper('isArray', function (value, options) {
        if (Array.isArray(value)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    handlebarsInstance.registerHelper('isObject', function (value, options) {
        if (typeof value === 'object' && !Array.isArray(value)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    // Register menuNode partial
    handlebarsInstance.registerHelper('menuNode', function(context, options) {
        
        if (!context || !Array.isArray(context)) {
            return '';
        }

        const activeDocId = options.hash.activeDocId;        
        const buildMenuItem = (item) => {
            if (!item || typeof item !== 'object') {
                return '';
            }

            if (item.items) {
                return `
                    <details ${item.open ? 'open' : ''}>
                        <summary>${item.title}</summary>
                        ${buildMenuList(item.items)}
                    </details>
                `;
            }

            const href = item.url || item.document;
            const isActive = false; //item.document === activeDocId;
            return `
                <a href="${href}" class="${isActive ? 'menu-active' : ''}">
                    ${item.title} ${item.badge ? `<div class="badge badge badge-${item.badge.variant || 'success'}">${item.badge.text}</div>` : ''}
                </a>
            `;
        };

        const buildMenuList = (items) => {
            return `
                <ul>
                    ${items.map(item => `
                        <li>
                            ${buildMenuItem(item)}
                        </li>
                    `).join('')}
                </ul>
            `;
        };

        return new handlebarsInstance.SafeString(buildMenuList(context));
    });

    handlebarsInstance.registerHelper('myfunc', (value, options) => {
        return new handlebarsInstance.SafeString('<p>This is a dynamic function, you passed in: ' + value + '</p>');
    });

    handlebarsInstance.registerHelper('raw-helper', function (options) {
        return options.fn();
    });

    // Helper to properly join baseUrl with paths (avoiding double slashes)
    handlebarsInstance.registerHelper('joinUrl', function(baseUrl, path) {
        if (!path) return baseUrl || '/';
        if (typeof path === 'string' && path.startsWith('http')) return path; // External URL
        
        const cleanBase = (baseUrl || '/').replace(/\/$/, '');
        const cleanPath = (path || '').replace(/^\//, '');
        return cleanBase + '/' + cleanPath;
    });

    handlebarsInstance.registerHelper('alert', function (text, type, options) {
        let alertType = '';
        let content = '';
        
        // Check if this is being used as a block helper
        if (typeof text === 'object' && text.hash) {
            // Block helper usage: {{#alert type="info"}}content{{/alert}}
            options = text;
            alertType = options.hash.type || '';
            content = options.fn(this);
        } else {
            // Check if this is block helper with positional type: {{#alert "info"}}content{{/alert}}
            if (typeof type === 'object' && type.fn) {
                options = type;
                alertType = text || ''; // First param is the alert type
                content = options.fn(this);
            } else {
                // Inline helper usage: {{alert "text" "type"}}
                alertType = type || '';
                content = text || '';
            }
        }
        
        // Build the alert class - default is just "alert", with optional color modifier  
        const alertClass = 'alert mb-2' + (alertType ? ' alert-' + alertType : '');
        
        // Choose the appropriate icon based on alert type
        let iconSvg = '';
        switch (alertType) {
            case 'success':
                // Checkmark icon for success
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />' +
                    '</svg>';
                break;
            case 'warning':
                // Warning triangle icon
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />' +
                    '</svg>';
                break;
            case 'error':
                // X mark icon for error
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />' +
                    '</svg>';
                break;
            case 'info':
            default:
                // Information circle icon (default for info and base alert)
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />' +
                    '</svg>';
                break;
        }
        
        // Process markdown content with full rendering to support code blocks
        let parsedContent = md.render(content).trim();
        
        // Remove outer paragraph tags if the entire content is wrapped in a single paragraph
        // This happens when the content is simple text without block elements
        if (parsedContent.startsWith('<p>') && parsedContent.endsWith('</p>')) {
            // Check if there's only one paragraph by counting opening <p> tags
            const paragraphCount = (parsedContent.match(/<p>/g) || []).length;
            if (paragraphCount === 1) {
                parsedContent = parsedContent.slice(3, -4); // Remove <p> and </p>
            }
        }
        
        const alertHtml = '<div role="alert" class="' + alertClass + '">' +
            iconSvg +
            '<span>' + parsedContent + '</span>' +
            '</div>\n\n';
        
        return new handlebarsInstance.SafeString(alertHtml);
    });

    handlebarsInstance.registerHelper('badge', function (text, type, options) {
        // If only one parameter is passed, the second is options, so type should default
        if (typeof type === 'object') {
            options = type;
            type = 'primary';
        }
        
        // Default to primary if no type provided
        type = type || 'primary';
        
        const badgeHtml = '<div class="badge badge-' + type + '">' + text + '</div>';
        
        return new handlebarsInstance.SafeString(badgeHtml);
    });

        // Global storage for include content (to be processed after markdown)
    if (!global.okidokiIncludes) {
        global.okidokiIncludes = new Map();
    }

    // Search component helper - generates search input and results HTML
    handlebarsInstance.registerHelper('searchComponent', function(options) {
        const variant = options.hash.variant || 'default';
        const placeholder = options.hash.placeholder || 'Search documentation...';
        const width = options.hash.width || 'auto';
        
        let inputId, resultsId, inputClasses, resultsClasses, containerClasses;
        
        switch(variant) {
            case 'mobile-navbar':
                inputId = 'search-mobile-navbar';
                resultsId = 'search-results-mobile-navbar';
                inputClasses = 'input input-bordered input-sm w-32';
                resultsClasses = 'dropdown-content bg-base-100 rounded-box z-[1] w-72 p-2 shadow hidden max-h-96 overflow-y-auto';
                containerClasses = 'dropdown dropdown-end';
                break;
                
            case 'mobile-sidebar':
                inputId = 'search-mobile';
                resultsId = 'search-results-mobile';
                inputClasses = 'input input-bordered w-full mb-4';
                resultsClasses = 'dropdown-content bg-base-100 rounded-box z-[1] w-full p-2 shadow hidden max-h-96 overflow-y-auto';
                containerClasses = 'dropdown dropdown-top w-full';
                break;
                
            case 'desktop':
            default:
                inputId = 'search-desktop';
                resultsId = 'search-results';
                inputClasses = `input input-bordered ${width === 'auto' ? 'w-24 md:w-auto' : width}`;
                resultsClasses = 'dropdown-content bg-base-100 rounded-box z-[1] w-96 p-2 shadow hidden max-h-96 overflow-y-auto';
                containerClasses = 'dropdown dropdown-end';
                break;
        }
        
        const searchHtml = `
<div class="${containerClasses}">
    <input 
        id="${inputId}" 
        type="text" 
        placeholder="${placeholder}" 
        class="${inputClasses}" 
        tabindex="0"
        oninput="handleSearch(this.value)" 
    />
    <ul id="${resultsId}" class="${resultsClasses}">
        <!-- Search results will be populated here -->
    </ul>
</div>`;
        
        return new handlebarsInstance.SafeString(searchHtml);
    });

    // Include helper - allows including HTML files from assets directory
    handlebarsInstance.registerHelper('include', function (filename, context, options) {
        try {
            // Handle both block and inline helper usage
            if (typeof context === 'object' && context.hash) {
                // If only filename is provided: {{include "file.html"}}
                options = context;
                context = this; // Use current context
            }
            
            // Default context to current scope if not provided
            if (!context) {
                context = this;
            }
            
            // Look for assets directory - check multiple possible locations
            let assetsDir = null;
            
            // 1. Check if there's a configured assets directory
            if (this.settings && this.settings.site && this.settings.site.assets) {
                assetsDir = path.resolve(this.settings.site.assets);
            } else {
                // 2. Check for default "assets" folder in project root
                const defaultAssetsDir = path.join(process.cwd(), 'assets');
                if (fs.existsSync(defaultAssetsDir)) {
                    assetsDir = defaultAssetsDir;
                }
            }
            
            if (!assetsDir || !fs.existsSync(assetsDir)) {
                console.warn(`Include helper: Assets directory not found. Looked for: ${assetsDir || 'assets'}`);
                return '';
            }
            
            // Construct the full file path
            const filePath = path.join(assetsDir, filename);
            
            // Security check - ensure the file is within the assets directory
            const resolvedPath = path.resolve(filePath);
            const resolvedAssetsDir = path.resolve(assetsDir);
            if (!resolvedPath.startsWith(resolvedAssetsDir)) {
                console.warn(`Include helper: File ${filename} is outside assets directory`);
                return '';
            }
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                console.warn(`Include helper: File not found: ${filePath}`);
                return '';
            }
            
            // Read the file content
            let fileContent = fs.readFileSync(filePath, 'utf8');
            
            // If the included file contains handlebars syntax, compile and render it with the provided context
            if (fileContent.includes('{{')) {
                const template = handlebarsInstance.compile(fileContent);
                fileContent = template(context);
            }
            
            // Generate a unique placeholder token
            const token = `OKIDOKI_INCLUDE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Store the rendered content for later replacement
            global.okidokiIncludes.set(token, fileContent);
            
            // Return the placeholder token (this will be processed by markdown, then replaced)
            return new handlebarsInstance.SafeString(token);
            
        } catch (error) {
            console.error(`Include helper error for file ${filename}:`, error.message);
            return '';
        }
    });
    
    
}
export default registerHelpers;