---
title: "Tabs Demo"
description: "Learn how to create tabbed content using Handlebars helpers"
---

# Tabs Demo

This page demonstrates how to create tabbed content using OkiDoki's Handlebars `{{tabs}}` and `{{tab}}` helpers.

## Basic Tabs Example

{{#tabs}}
  {{#tab title="JavaScript"}}
    ```javascript
    const message = "Hello from JavaScript!";
    console.log(message);

    // Fetch data from API
    fetch('/api/users')
      .then(response => response.json())
      .then(data => console.log(data));
    ```
  {{/tab}}
  {{#tab title="Python"}}
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
  {{/tab}}
  {{#tab title="cURL"}}
    ```bash
    # Get users from API
    curl -X GET \
      'https://api.example.com/users' \
      -H 'Accept: application/json' \
      -H 'Authorization: Bearer your-token'
    ```
  {{/tab}}
{{/tabs}}

## Mixed Content Tabs

Tabs can contain any markdown content, not just code blocks:

{{#tabs}}
  {{#tab title="Overview"}}
    Here's some regular markdown content in a tab.

    - Feature A: Does something cool
    - Feature B: Does something else
    - Feature C: Does something amazing

    > **Note**: This tab contains mixed content - not just code!
  {{/tab}}
  {{#tab title="TypeScript"}}
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
  {{/tab}}
  {{#tab title="Configuration"}}
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
  {{/tab}}
{{/tabs}}

## API Documentation Example

Document API endpoints across multiple programming languages:

{{#tabs}}
  {{#tab title="Node.js"}}
    ```javascript
    const axios = require('axios');

    // Create a new user
    async function createUser(userData) {
      try {
        const response = await axios.post('/api/users', userData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }

    // Usage
    const newUser = await createUser({
      name: "John Doe",
      email: "john@example.com"
    });
    ```
  {{/tab}}
  {{#tab title="Python"}}
    ```python
    import requests
    import json

    def create_user(user_data, token):
        """Create a new user via API"""
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }
        
        try:
            response = requests.post(
                '/api/users', 
                json=user_data, 
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error creating user: {e}")
            raise

    # Usage
    new_user = create_user({
        "name": "John Doe",
        "email": "john@example.com"
    }, token)
    ```
  {{/tab}}
  {{#tab title="cURL"}}
    ```bash
    # Create a new user
    curl -X POST \
      'https://api.example.com/users' \
      -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer your-token-here' \
      -d '{
        "name": "John Doe",
        "email": "john@example.com"
      }'

    # Expected Response
    # HTTP/1.1 201 Created
    # {
    #   "id": 123,
    #   "name": "John Doe", 
    #   "email": "john@example.com",
    #   "created_at": "2024-01-15T10:30:00Z"
    # }
    ```
  {{/tab}}
{{/tabs}}

## Syntax Reference

### Basic Structure

```handlebars
{{#tabs}}
  {{#tab title="Tab 1"}}
    Content for the first tab
  {{/tab}}
  {{#tab title="Tab 2"}}
    Content for the second tab
  {{/tab}}
{{/tabs}}
```

### Features

- **Automatic styling**: Uses DaisyUI tab components
- **Responsive**: Works on mobile and desktop
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Markdown support**: Full markdown rendering within tabs
- **Code highlighting**: Syntax highlighting with highlight.js
- **No overflow**: Wide content automatically scrolls horizontally

### Best Practices

1. **Keep titles short**: Tab titles should be concise
2. **Consistent content**: Try to keep similar content types in tabs
3. **Test responsive**: Check how tabs look on mobile devices
4. **Use for comparisons**: Great for showing the same task in different languages 