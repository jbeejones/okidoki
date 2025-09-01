---
title: "Plugin System"
description: "How to create and use custom handlebars helpers with OkiDoki plugins"
handlebars: false
---

# Plugin System

OkiDoki supports a plugin system that allows you to create custom handlebars helpers without modifying the core codebase. This enables you to extend your documentation with custom functionality while keeping your setup clean and maintainable.

## Quick Start

1. **Enable plugins** in your `okidoki.yaml`:
   ```yaml
   plugins:
     enabled: true
     directory: "plugins"  # Optional, defaults to "plugins"
     load: []              # Optional, loads all .js files if empty
   ```

2. **Create a plugins directory** in your project root:
   ```bash
   mkdir plugins
   ```

3. **Create a plugin file** (e.g., `plugins/my-helpers.js`):
   
   **For ES modules projects** (recommended - add `"type": "module"` to your package.json):
   ```javascript
   export default function(handlebarsInstance) {
       handlebarsInstance.registerHelper('uppercase', function(str) {
           return str.toUpperCase();
       });
   }
   ```
   
   **For CommonJS projects** (use `.cjs` extension):
   ```javascript
   // plugins/my-helpers.cjs
   module.exports = function(handlebarsInstance) {
       handlebarsInstance.registerHelper('uppercase', function(str) {
           return str.toUpperCase();
       });
   };
   ```

4. **Use your helper** in markdown:
   ```markdown
   # My Page
   
   Hello {{uppercase "world"}}!
   ```

## Plugin Patterns

### Pattern 1: Function Export (Recommended)

The most flexible pattern - export a function that receives the handlebars instance:

```javascript
// plugins/my-helpers.js
export default function(handlebarsInstance) {
    // Register as many helpers as you want
    handlebarsInstance.registerHelper('myHelper', function(value) {
        return `Processed: ${value}`;
    });
    
    handlebarsInstance.registerHelper('anotherHelper', function(a, b) {
        return a + b;
    });
    
    console.log('✅ My custom helpers loaded');
}
```

### Pattern 2: Object Export

Export an object with a `helpers` property:

```javascript
// plugins/utilities.js
export default {
    helpers: {
        capitalize: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        
        truncate: function(str, length) {
            return str.length > length ? str.substring(0, length) + '...' : str;
        }
    }
};
```

## Configuration Options

### Basic Configuration

```yaml
# okidoki.yaml
plugins:
  enabled: true                    # Enable/disable plugin system
  directory: "plugins"             # Directory containing plugin files
```

### Advanced Configuration

```yaml
plugins:
  enabled: true
  directory: "my-custom-plugins"   # Custom plugins directory
  load:                           # Load specific plugins only
    - "my-helpers"                # Loads my-helpers.js
    - "date-utils"                # Loads date-utils.js
    # If 'load' is empty or omitted, all .js files in directory are loaded
```

## Example Helpers

Here are some practical examples of custom helpers you might want to create:

### Date Formatting

```javascript
export default function(handlebarsInstance) {
    handlebarsInstance.registerHelper('formatDate', function(date, format) {
        const d = new Date(date);
        switch(format) {
            case 'short': return d.toLocaleDateString();
            case 'long': return d.toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            });
            case 'iso': return d.toISOString().split('T')[0];
            default: return d.toLocaleDateString();
        }
    });
}
```

Usage in markdown:
```markdown
Last updated: {{raw-helper}}{{formatDate "2024-01-15" "long"}}{{/raw-helper}}
```

### Conditional Logic

```javascript
export default function(handlebarsInstance) {
    handlebarsInstance.registerHelper('ifAny', function() {
        const args = Array.prototype.slice.call(arguments);
        const options = args.pop();
        
        const hasValue = args.some(arg => !!arg);
        return hasValue ? options.fn(this) : options.inverse(this);
    });
}
```

Usage in markdown:
```markdown
{{#ifAny author.name author.email}}
Author information available
{{else}}
No author information
{{/ifAny}}
```

### HTML Generation

```javascript
export default function(handlebarsInstance) {
    handlebarsInstance.registerHelper('youtube', function(videoId, options) {
        const width = options.hash.width || '560';
        const height = options.hash.height || '315';
        
        const html = `<iframe width="${width}" height="${height}" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" allowfullscreen></iframe>`;
            
        return new handlebarsInstance.SafeString(html);
    });
}
```

Usage in markdown:
```markdown
{{{youtube "dQw4w9WgXcQ" width="800" height="450"}}}
```

### Text Processing

```javascript
export default function(handlebarsInstance) {
    handlebarsInstance.registerHelper('slugify', function(str) {
        return str.toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-');
    });
    
    handlebarsInstance.registerHelper('excerpt', function(text, length) {
        length = length || 150;
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    });
}
```

## Block Helpers

You can also create block helpers that process content:

```javascript
export default function(handlebarsInstance) {
    handlebarsInstance.registerHelper('callout', function(type, options) {
        const content = options.fn(this);
        const alertType = type || 'info';
        
        const html = `<div class="callout callout-${alertType}">
            <div class="callout-content">${content}</div>
        </div>`;
        
        return new handlebarsInstance.SafeString(html);
    });
}
```

Usage in markdown:
```markdown
{{#callout "warning"}}
This is important information that users should pay attention to.
{{/callout}}
```

## Advanced Features

### Accessing Context Data

Your helpers can access the current template context:

```javascript
export default function(handlebarsInstance) {
    handlebarsInstance.registerHelper('siteInfo', function() {
        // Access site configuration
        const siteTitle = this.settings?.site?.title || 'Unknown';
        const baseUrl = this.baseUrl || '/';
        
        return `Site: ${siteTitle} (${baseUrl})`;
    });
}
```

### Using External Dependencies

If your plugin needs external libraries, make sure they're installed in your project:

```javascript
// First: npm install moment
import moment from 'moment';

export default function(handlebarsInstance) {
    handlebarsInstance.registerHelper('momentDate', function(date, format) {
        return moment(date).format(format || 'MMMM Do YYYY');
    });
}
```

## Best Practices

1. **Error Handling**: Always handle edge cases and invalid inputs
2. **Security**: Use `handlebarsInstance.Utils.escapeExpression()` for user content
3. **Safe HTML**: Use `new handlebarsInstance.SafeString()` for trusted HTML output
4. **Naming**: Use descriptive helper names that won't conflict with built-ins
5. **Documentation**: Comment your helpers for future maintenance
6. **Performance**: Keep helpers lightweight for better build performance

## Troubleshooting

### Plugin Not Loading

- Check that `plugins.enabled: true` in your `okidoki.yaml`
- Verify the plugins directory exists and contains `.js` files
- Check the console output for plugin loading messages
- Ensure your plugin exports a function or helpers object

### Helper Not Working

- Verify the helper is registered (check console logs)
- Test the helper with simple values first
- Check for JavaScript syntax errors in your plugin file
- Ensure you're using the correct handlebars syntax in your templates

### Common Issues

1. **Module type warnings**: If you see Node.js warnings about module types:
   - **ES modules**: Add `"type": "module"` to your project's `package.json` and use `.js` files
   - **CommonJS**: Use `.cjs` file extension for your plugins (e.g., `plugins/my-helpers.cjs`)
2. **Path issues**: Plugin directory is relative to your project root (where `okidoki.yaml` is)  
3. **Caching**: Plugins are reloaded on each build, but you may need to restart dev servers

## Built-in Helpers Reference

OkiDoki comes with several built-in helpers you can reference or extend:

- `{{eq a b}}` - Equality comparison
- `{{isArray value}}` - Check if value is array
- `{{isObject value}}` - Check if value is object  
- `{{joinUrl baseUrl path}}` - URL joining with slash handling
- `{{alert "text" "type"}}` - Generate alert components
- `{{badge "text" "type"}}` - Generate badge components
- `{{include "filename.html"}}` - Include HTML files from assets
- `{{searchComponent variant="desktop"}}` - Generate search components

Your custom helpers work alongside these built-in ones, giving you complete flexibility to create the documentation experience you need. 