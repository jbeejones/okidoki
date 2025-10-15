---
title: "OkiDoki Markdown Examples"
description: "Learn OkiDoki features by seeing both the rendered output and the markdown source code"
author: "Demo Author"
version: "2.0.0"
category: "Examples"
tags: ["examples", "markdown", "tutorial"]
date: "2024-01-15"
custom_variable: "This is a custom frontmatter variable"
api_base_url: "https://api.example.com/v1"
handlebars: false
---

# OkiDoki Markdown Examples

This page shows you exactly how to write markdown for each OkiDoki feature. 

🎨 **Want to see how it looks?** Visit the [Feature Demo](demo.md) to see all examples beautifully rendered.

## Frontmatter Variables

Define variables at the top of your markdown file and use them throughout the document:

```markdown
---
title: "My Documentation Page"
author: "Demo Author"  
version: "2.0.0"
custom_variable: "This is a custom frontmatter variable"
handlebars: true
---

# {{title}}

- **Author**: {{author}}
- **Version**: {{version}}
- **Custom Variable**: {{custom_variable}}
```

🎨 [**See rendered variables example →**](demo.md#frontmatter-variables)

## Alert Components

Create styled alert boxes to highlight important information. Alerts support markdown content.

### Block Alerts

```handlebars
{{#alert type="success"}}
This is a **success alert**! You can use *markdown* inside alerts, including [links](https://example.com) and `inline code`.
{{/alert}}

{{#alert type="info"}}
This is an **info alert** with a code example:

\```javascript
const info = "Alerts support markdown!";
console.log(info);
\```
{{/alert}}

{{#alert type="warning"}}
⚠️ **Warning**: This alert contains:
- A bullet list
- *Italic text* 
- **Bold text**
{{/alert}}

{{#alert type="error"}}
❌ **Error**: Critical issue detected!

Please check your [configuration file](config.yaml) and ensure all required fields are present.
{{/alert}}
```

### Inline Alerts

For simple one-line messages, use the inline syntax:

```handlebars
{{alert "Quick **markdown** message with `code`!" "success"}}
{{alert "Simple info message" "info"}}
{{alert "Warning message" "warning"}}
{{alert "Error message" "error"}}
```

🎨 [**See rendered alert examples →**](demo.md#alert-components)

## Badge Components

Create small colored badges to show status, versions, or categories:

```handlebars
{{badge "v2.0.0" "primary"}} 
{{badge "Stable" "success"}} 
{{badge "API" "info"}} 
{{badge "New" "warning"}} 
{{badge "Deprecated" "error"}}

Default badge: {{badge "Default"}}
```

Available badge types: `primary`, `success`, `info`, `warning`, `error`. If no type is specified, defaults to `primary`.

🎨 [**See rendered badge examples →**](demo.md#badge-components)

## Multi-Language Code Tabs

Create interactive tabbed code examples to show the same operation in different languages:

```handlebars
{{#tabs}}
  {{#tab title="JavaScript"}}
\```javascript
// Fetch user data from API  
const response = await fetch('{{api_base_url}}/users/123');
const user = await response.json();
console.log(`User: ${user.name}`);
\```
  {{/tab}}
  {{#tab title="Python"}}
\```python
# Fetch user data from API
import requests

response = requests.get('{{api_base_url}}/users/123')
user = response.json()
print(f"User: {user['name']}")
\```
  {{/tab}}
  {{#tab title="cURL"}}
\```bash
# Fetch user data from API
curl -X GET '{{api_base_url}}/users/123' \
  -H 'Accept: application/json'
\```
  {{/tab}}
{{/tabs}}
```

Each `{{#tab}}` block creates a new tab. The `title` parameter sets the tab label.

🎨 [**See rendered tabs example →**](demo.md#multi-language-tabs)

## Conditional Content

Show different content based on variable values using the equality helper:

```handlebars
{{#eq version "2.0.0"}}
🎉 You're using version 2.0.0 - the latest version!
{{else}}
You're using version {{version}}. Consider upgrading to 2.0.0.
{{/eq}}
```

### Case-Insensitive Comparison

Add `ignoreCase=true` to ignore letter case:

```handlebars
{{#eq author "DEMO AUTHOR" ignoreCase=true}}
✅ Author name matches (case-insensitive)!
{{else}}
❌ Author name doesn't match.
{{/eq}}
```

🎨 [**See rendered conditional examples →**](demo.md#conditional-helpers)

## Type Checking Helpers

Check variable types and iterate over arrays:

```handlebars
{{#isArray tags}}
📋 Tags is an array with {{tags.length}} items: {{#each tags}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{else}}
Tags is not an array.
{{/isArray}}

{{#isObject user}}
User is an object with properties: {{user.name}}, {{user.email}}
{{else}}
User is not an object.
{{/isObject}}
```

🎨 [**See rendered type checking examples →**](demo.md#type-checking-helpers)

## Raw Content Helper

Prevent handlebars processing of specific content:

```handlebars
{{#raw-helper}}
This content is not processed: {{this.would.normally.be.processed}}
But this HTML is preserved: <strong>Bold text</strong>
{{/raw-helper}}
```

🎨 [**See rendered raw helper example →**](demo.md#raw-content-helper)

## Standard Markdown Features

OkiDoki supports all standard markdown syntax:

````markdown
# Headers
## H2 through H6

**Bold text** and *italic text* and ***both***
~~Strikethrough~~ and `inline code`

- Unordered lists
  - Nested items
- Task lists: - [x] Done - [ ] Todo

1. Ordered lists
2. With sub-items
   1. Like this

[Links](https://example.com) and images ![Images](/images/okidokilogi.png)

> Blockquotes
> > Nested quotes

| Tables | Are | Supported |
|--------|-----|-----------|
| With   | Any | Content   |

```javascript
// Syntax highlighted code blocks
const example = "Hello World!";
```
````

🎨 [**See rendered markdown examples →**](demo.md#standard-markdown-features)

## Code Block Line Highlighting & Titles

Highlight specific lines in your code blocks and add descriptive titles:

### Line Highlighting

Use `{line-numbers}` syntax to highlight specific lines:

````markdown
```js{1,3}
const greeting = "Hello";  // Line 1 highlighted
const name = "World";
console.log(greeting);     // Line 3 highlighted
```
````

Supports ranges and multiple selections:
- Single line: `{3}`
- Multiple lines: `{1,3,5}`
- Ranges: `{2-5}`
- Combined: `{1,3-5,8}`

### Code Block Titles

Add a title to provide context for your code examples:

````markdown
```javascript title="app.js"
function initializeApp() {
    console.log("App initialized!");
}
```
````

### Combined Features

Use both line highlighting and titles together:

````markdown
```typescript{1,4-5} title="user.ts"
interface User {
    name: string;
    email: string;
    isActive: boolean;  // Lines 4-5 highlighted
    lastLogin: Date;
}
```
````

🎨 [**See live examples →**](code-highlighting-demo.md)

## Complete API Documentation Example

Here's how all OkiDoki features work together for real API documentation:

````handlebars
{{#alert type="info"}}
**Base URL**: {{{api_base_url}}}

**Authentication**: Bearer token required for all endpoints.
{{/alert}}

### Create User {{badge "POST" "primary"}}

Create a new user in the system.

{{#alert type="warning"}}
**Rate Limit**: 100 requests per minute per API key.
{{/alert}}

**Endpoint**: `/users`

{{#tabs}}
  {{#tab title="JavaScript"}}
\```javascript
const newUser = await fetch('{{api_base_url}}/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com'
    })
});

const user = await newUser.json();
console.log('Created user:', user);
\```
  {{/tab}}
  {{#tab title="Python"}}
```python
import requests

response = requests.post('{{api_base_url}}/users', 
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'name': 'John Doe',
        'email': 'john@example.com'
    }
)

user = response.json()
print(f'Created user: {user}')

  {{/tab}}
{{/tabs}}

{{#alert type="success"}}
**Success Response**: User created with status code `201`
{{/alert}}
````

🎨 [**See rendered API documentation example →**](demo.md#advanced-examples)

---

## Getting Started

1. **Copy any example** from above into your markdown files
2. **Set `handlebars: true`** in your frontmatter to enable OkiDoki features  
3. **See the results** live at the [**Feature Demo**](demo.md) page

💡 **Pro tip**: Use the 🎨 links throughout this page to jump directly to rendered examples, then come back here to copy the source code!

Remember: OkiDoki features only work when `handlebars: true` is set in your document's frontmatter.

*This examples page was created with OkiDoki v2.0.0. For rendered examples, visit the [Feature Demo](demo.md) page.* 