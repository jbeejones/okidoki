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

## Standard Markdown Features

### Headers

# Header 1
## Header 2  
### Header 3
#### Header 4
##### Header 5
###### Header 6

### Text Formatting

This is **bold text**, this is *italic text*, this is ***bold and italic***, and this is ~~strikethrough~~.

You can also use `inline code` within sentences.

### Lists

#### Unordered Lists
- First item
- Second item
  - Nested item
  - Another nested item
    - Deep nested item
- Third item

#### Ordered Lists
1. First step
2. Second step
   1. Substep A
   2. Substep B
3. Third step

#### Task Lists
- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task

### Links and Images

Here's a [link to OkiDoki](https://github.com/your-repo/okidoki) and here's an image:

![OkiDoki Logo](./images/okidokilogo.png)

### Blockquotes

> This is a blockquote. It can contain multiple lines
> and even **formatted text**.
>
> > This is a nested blockquote.

### Horizontal Rule

---

### Tables

| Feature | Status | Notes |
|---------|---------|-------|
| Tabs Helper | ✅ Complete | Multi-language code examples |
| Alert Helper | ✅ Complete | Success, info, warning, error styles |
| Badge Helper | ✅ Complete | Various badge types |
| Global Variables | ✅ Complete | From okidoki.yaml |
| Frontmatter | ✅ Complete | YAML metadata support |

## Code Examples

### Single Language Code Block

```javascript
// JavaScript example
const greeting = "Hello, OkiDoki!";
console.log(greeting);

function generateDocs() {
    return "Documentation generated successfully!";
}
```

```python
# Python example
greeting = "Hello, OkiDoki!"
print(greeting)

def generate_docs():
    return "Documentation generated successfully!"
```

```bash
# Bash example
echo "Hello, OkiDoki!"
okidoki generate
```

📄 [**View source code for standard markdown →**](markdown-examples.md#standard-markdown-features)

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
This is a success alert! Perfect for showing positive outcomes.
{{/alert}}

{{#alert type="info"}}
This is an info alert. Great for providing additional context or tips.
{{/alert}}

{{#alert type="warning"}}
This is a warning alert. Use it to highlight important caveats or potential issues.
{{/alert}}

{{#alert type="error"}}
This is an error alert. Use it to highlight critical issues or requirements.
{{/alert}}

You can also use alerts with inline syntax:

{{alert "Quick success message!" "success"}}

{{alert "Important information to note" "info"}}

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

## Advanced Examples

### API Documentation Example

Here's how you might document an API endpoint using OkiDoki features:

{{#alert type="info"}}
**Base URL**: {{api_base_url}}
{{/alert}}

#### Create User Endpoint

{{badge "POST" "primary"}} `/users`

Create a new user in the system.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | ✅ | User's full name |
| email | string | ✅ | User's email address |
| role | string | ❌ | User role (default: 'user') |

**Example Request:**

{{#tabs}}
  {{#tab title="JavaScript"}}
```js
const newUser = await fetch('{{api_base_url}}/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
    })
});

const user = await newUser.json();
console.log('Created user:', user);
```
  {{/tab}}
  {{#tab title="Python"}}
```python
import requests

response = requests.post('{{api_base_url}}/users', json={
    'name': 'John Doe',
    'email': 'john@example.com',
    'role': 'admin'
})

user = response.json()
print(f'Created user: {user}')
```
  {{/tab}}
  {{#tab title="cURL"}}
```bash
curl -X POST '{{api_base_url}}/users' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }'
```
  {{/tab}}
{{/tabs}}

**Response:**

```json
{
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "created_at": "2024-01-15T10:30:00Z"
}
```

{{#alert type="success"}}
**Success!** User created with ID: 123
{{/alert}}

### Installation Guide Example

{{#alert type="warning"}}
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