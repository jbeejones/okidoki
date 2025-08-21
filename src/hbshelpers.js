import handlebars from 'handlebars';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';

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
                    ${item.title} ${item.badge ? `<div class="badge badge-xs badge-${item.badge.variant || 'success'}">${item.badge.text}</div>` : ''}
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

    handlebarsInstance.registerHelper('alert', function (text, type, options) {
        let alertType = 'success';
        let content = '';
        
        // Check if this is being used as a block helper
        if (typeof text === 'object' && text.hash) {
            // Block helper usage: {{#alert type="info"}}content{{/alert}}
            options = text;
            alertType = options.hash.type || 'success';
            content = options.fn(this);
        } else {
            // Parameter helper usage: {{alert "text" "type"}}
            if (typeof type === 'object') {
                options = type;
                alertType = 'success';
            } else {
                alertType = type || 'success';
            }
            content = text || '';
        }
        
        // Parse content as markdown
        const parsedContent = md.render(content);
        
        const alertHtml = '<div role="alert" class="alert mb-2 alert-' + alertType + '">' +
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />' +
            '</svg>' +
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
    
    
}
export default registerHelpers;