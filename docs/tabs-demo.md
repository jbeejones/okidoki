---
title: "Tabs Demo"
description: "Comparing Handlebars tabs and new markdown tabs syntax"
---

# Tabs Demo

This page demonstrates both the old Handlebars tabs syntax and the new markdown tabs syntax.

## New Markdown Tabs Syntax

You can now use pure markdown syntax for tabs with strict syntax requirements:

**Syntax Rules:**
- `:::tabs` - Opens a tabs container (no spaces after `:::`)  
- `:::tab Title` - Creates a tab with the given title (no spaces after `:::`)
- `:::` - Closes tabs/tab sections
- **Consistent with admonitions**: Same strict syntax as `:::info`, `:::warning`, etc.

:::tabs
:::tab JavaScript
```javascript
const message = "Hello from JavaScript!";
console.log(message);

// Fetch data from API
fetch('/api/users')
  .then(response => response.json())
  .then(data => console.log(data));
```
:::
:::tab Python
```python
def main():
    message = "Hello from Python!"
    print(message)

    # Fetch data from API
    import requests
    try:
        response = requests.get('/api/users')
        data = response.json()
        print(data)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
```
:::
:::tab cURL
```bash
# Get users from API
curl -X GET \
  'https://api.example.com/users' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer your-token'
```
:::
:::

## Another Example with Mixed Content

:::tabs
:::tab Overview
Here's some regular markdown content in a tab.

- Feature A: Does something cool
- Feature B: Does something else
- Feature C: Does something amazing

> **Note**: This tab contains mixed content - not just code!
:::
:::tab Code Example
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  async getUser(id: number): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
}
```
:::
:::tab Configuration
```yaml
# config.yml
api:
  baseUrl: "https://api.example.com"
  timeout: 30000
  retries: 3

features:
  enableCache: true
  enableLogging: true
  enableMetrics: false
```
:::
:::

## Old Handlebars Syntax (Still Works)

{{#tabs}}
  {{#tab title="JavaScript"}}
    ```js
    const oldWay = "This still works!";
    console.log(oldWay);
    ```
  {{/tab}}
  {{#tab title="Python"}}
    ```python
    old_way = "This still works!"
    print(old_way)
    ```
  {{/tab}}
{{/tabs}}

## Benefits of Markdown Syntax

- **Cleaner**: No need for Handlebars helpers
- **Automatic**: No `handlebars: true` frontmatter required
- **Portable**: Works in any markdown editor with preview
- **Familiar**: Uses the same `:::` syntax as admonitions
- **Flexible**: Mix code, text, lists, and other markdown elements in tabs 