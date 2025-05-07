
function registerHelpers(handlebarsInstance) {
    // Register the equals Handlebars helper
    handlebarsInstance.registerHelper('eq', function (a, b, options) {
        const ignoreCase = options.hash.ignoreCase || false;
        if (ignoreCase && typeof a === 'string' && typeof b === 'string') {
            return a.toLowerCase() === b.toLowerCase();
        }
        return a === b;
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
    handlebarsInstance.registerPartial('menuNode', `
<ul>
    {{#each this}}
    <li>        
        {{#isObject this}}
            {{#if this.items}}
                <details {{#if this.open}}open{{/if}}>
                    <summary>{{this.title}}</summary>
                    {{> menuNode this.items}}
                </details>
            {{else}}
                {{#if this.url}}
                    <a href="{{this.url}}">
                        {{#if this.icon}}{{this.icon}} {{/if}}{{this.title}}
                    </a>
                {{else}}
                    <a href="{{this.document}}">
                        {{#if this.icon}}{{this.icon}} {{/if}}{{this.title}}
                    </a>
                {{/if}}
            {{/if}}
        {{else}}
            <a href="{{this}}">
                {{this}}
            </a>
        {{/isObject}}
    </li>
    {{/each}}
</ul>
`);

    handlebarsInstance.registerHelper('myfunc', (value, options) => {
        return new handlebars.SafeString('<p>This is a dynamic function, you passed in: ' + value + '</p>');
    });

    handlebarsInstance.registerHelper('raw-helper', function (options) {
        return options.fn();
    });
}
export default registerHelpers;