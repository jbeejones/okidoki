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
        return new handlebars.SafeString('<p>This is a dynamic function, you passed in: ' + value + '</p>');
    });

    handlebarsInstance.registerHelper('raw-helper', function (options) {
        return options.fn();
    });
}
export default registerHelpers;