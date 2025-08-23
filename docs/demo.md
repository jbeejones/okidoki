---
title: "OkiDoki Feature Demo"
description: "Comprehensive demonstration of all OkiDoki markdown features, handlebars helpers, and variables"
author: "Demo Author"
version: "2.0.0"
category: "Demo"
tags: ["demo", "features", "documentation"]
date: "2024-01-15"
handlebars: true
custom_variable: "This is a custom frontmatter variable"
api_base_url: "https://api.example.com/v1"
---

# OkiDoki Feature Demo

Welcome to the comprehensive demo of OkiDoki's markdown features! This page showcases all available functionality with live examples.

📖 **Want to see the source code?** Check out [Markdown Examples](markdown-examples.md) to see the exact code behind each feature.

## Frontmatter Variables

This page demonstrates local frontmatter variables defined at the top of this markdown file:

- **Title**: {{title}}
- **Author**: {{author}}
- **Version**: {{version}}
- **Category**: {{category}}
- **Custom Variable**: {{custom_variable}}
- **API Base URL**: {{{api_base_url}}}

## Global Variables

OkiDoki also supports global variables defined in `okidoki.yaml`:

- **Site Title**: {{site.title}}
- **Site Description**: {{site.description}}

If you have global variables defined, they would be accessible like: `{{globals.your_variable_name}}`

📄 [**View source code for variables →**](markdown-examples.md#frontmatter-variables)

## OkiDoki Handlebars Helpers

### Multi-Language Tabs

The tabs helper allows you to create multi-language code examples:

{{#tabs}}
  {{#tab title="JavaScript"}}
```js
// Fetch user data from API
const response = await fetch('http:example.com/api/users/123');
const user = await response.json();
console.log(`User: ${user.name}`);
```
  {{/tab}}
  {{#tab title="Python"}}
```python
# Fetch user data from API
import requests

response = requests.get('/users/123')
user = response.json()
print(f"User: {user['name']}")
```
  {{/tab}}
  {{#tab title="cURL"}}
```bash
# Fetch user data from API
curl -X GET '/users/123' \
  -H 'Accept: application/json'
```
  {{/tab}}
  {{#tab title="Go"}}
```go
// Fetch user data from API
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type User struct {
    Name string `json:"name"`
}

func main() {
    // Create HTTP client
    client := &http.Client{}

    // Create request
    req, err := http.NewRequest("GET", "/users/123", nil)
    if err != nil {
        fmt.Printf("Error creating request: %v\n", err)
        return
    }

    // Set headers
    req.Header.Add("Accept", "application/json")

    // Send request
    resp, err := client.Do(req)
    if err != nil {
        fmt.Printf("Error making request: %v\n", err)
        return
    }
    defer resp.Body.Close()

    // Parse response
    var user User
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        fmt.Printf("Error decoding response: %v\n", err)
        return
    }

    fmt.Printf("User: %s\n", user.Name)
}
```
  {{/tab}}
{{/tabs}}


### Alert Components

Alerts help highlight important information:

{{#alert type="success"}}
This is a **success alert**! You can use *markdown* inside alerts, including [links](https://example.com) and `inline code`.
{{/alert}}

{{#alert type="info"}}
This is an **info alert** with a code example:

```javascript
const info = "Alerts support markdown!";
console.log(info);
```
{{/alert}}

{{#alert}}
⚠️ **Warning**: This alert contains:
- A bullet list
- *Italic text* 
- **Bold text**
{{/alert}}

{{#alert type="error"}}
❌ **Error**: Critical issue detected!

Please check your [configuration file](config.yaml) and ensure all required fields are present.
{{/alert}}

You can also use alerts with inline syntax:

{{alert "Quick **markdown** message with `code`!" "success"}}
{{alert "Simple info message" "info"}}
{{alert "Warning message" "warning"}}
{{alert "Error message" "error"}}
{{alert "Default alert"}}

### Badge Components

Badges are great for showing status, versions, or categories:

{{badge "v2.0.0" "primary"}} {{badge "Stable" "success"}} {{badge "API" "info"}} {{badge "New" "warning"}} {{badge "Deprecated" "error"}}

Default badge: {{badge "Default"}}

### Conditional Helpers

The equality helper allows conditional content:

{{#eq version "2.0.0"}}
🎉 You're using version 2.0.0 - the latest version!
{{else}}
You're using version {{version}}. Consider upgrading to 2.0.0.
{{/eq}}

Case-insensitive comparison:
{{#eq author "demo author" ignoreCase=true}}
Author name matches (case-insensitive)!
{{/eq}}

### Type Checking Helpers

{{#isArray tags}}
Tags is an array with {{tags.length}} items: {{#each tags}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/isArray}}


### Raw Content Helper

Sometimes you need to output content without processing:

{{#raw-helper}}
This content is not processed: {{this.would.normally.be.processed}}
But this HTML is preserved: <strong>Bold text</strong>
{{/raw-helper}}

📄 [**View source code for handlebars helpers →**](markdown-examples.md#alert-components)

## Standard Markdown Features

OkiDoki supports all standard markdown syntax:

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

[Links](https://example.com) and images ![Images](/images/okidokilogo.png)

> Blockquotes
> > Nested quotes

| Tables | Are | Supported |
|--------|-----|-----------|
| With   | Any | Content   |

```javascript
// Syntax highlighted code blocks
const example = "Hello World!";
```

📄 [**View source code for standard markdown →**](markdown-examples.md#standard-markdown-features)

## Advanced Examples

### API Documentation Example

Here's how you might document an API endpoint using OkiDoki features:

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
```javascript
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
```
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
```
  {{/tab}}
{{/tabs}}


{{#alert type="success"}}
**Success Response**: User created with status code `201`
{{/alert}}

### Installation Guide Example

{{#alert}}
Make sure you have Node.js 18+ installed before proceeding.
{{/alert}}

#### Step 1: Install OkiDoki

{{#tabs}}
  {{#tab title="npm"}}
```bash
npm install -g okidoki
```
  {{/tab}}
  {{#tab title="yarn"}}
```bash
yarn global add okidoki
```
  {{/tab}}
  {{#tab title="pnpm"}}
```bash
pnpm install -g okidoki
```
  {{/tab}}
{{/tabs}}

#### Step 2: Verify Installation

```bash
okidoki --version
```

{{#eq version "2.0.0"}}
Expected output: `{{version}}`
{{/eq}}

{{#alert type="success"}}
Installation complete! You're ready to generate documentation.
{{/alert}}

📄 [**View complete API example source code →**](markdown-examples.md#complete-api-documentation-example)

## Conclusion

This demo showcases all the powerful features available in OkiDoki:

- ✅ Standard Markdown support with syntax highlighting
- ✅ Multi-language code tabs with the `#tabs` helper
- ✅ Beautiful alert components with `#alert` helper
- ✅ Flexible badge system with `badge` helper
- ✅ Conditional content with `#eq` helper
- ✅ Variable interpolation (global and frontmatter)
- ✅ Custom helper functions
- ✅ Type checking helpers


{{#alert type="info"}}

**Pro Tip**: All these features work together seamlessly to create beautiful, interactive documentation that's easy to maintain and deploy anywhere!

📖 Ready to use these features? Get all the source code at [**Markdown Examples**](markdown-examples.md).
{{/alert}}


---

*This demo was created with OkiDoki {{version}} by {{author}}. Last updated: {{date}}* 