---
title: Alerts and Badges Demo
description: Showcase of alert and badge functionality using Handlebars helpers
handlebars: true
---

# Alerts and Badges

This page demonstrates the alert and badge functionality available in OkiDoki using Handlebars helpers.

## Alert Helper

Create styled alerts using the `{{alert}}` helper:

### Basic Alerts

{{#alert "info"}}
This is an **informational** alert. Use it for neutral information.
{{/alert}}

{{#alert "success"}}
This is a **success** alert. Use it for positive confirmations.
{{/alert}}

{{#alert "warning"}}
This is a **warning** alert. Use it to highlight potential issues.
{{/alert}}

{{#alert "error"}}
This is an **error** alert. Use it for critical warnings and errors.
{{/alert}}

{{#alert "error"}}
❌ **Error**: Critical code detected!

```javascript
console.log('Be careful with this');
process.exit(1);
```

Please check your `code file` and ensure that your code is sanitized.
{{/alert}}

{{#alert "info"}}
ℹ️ **Code Example**: Here's how to use the API:

```bash
curl -X GET https://api.example.com/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The response will be in JSON format with user data.
{{/alert}}

{{#alert "success"}}
✅ **Success**: Code deployed successfully!

```json
{
  "status": "deployed",
  "version": "1.2.3", 
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Your application is now live at `https://app.example.com`
{{/alert}}

{{#alert}}
This is a **neutral** alert. Default alert without type specified.
{{/alert}}

### Soft Alerts

Add `soft=true` for a muted appearance:

{{#alert "info" soft=true}}
Soft information alert with subtle styling
{{/alert}}

{{#alert "success" soft=true}}
Soft success alert with muted colors
{{/alert}}

{{#alert "warning" soft=true}}
Soft warning alert for gentle notices
{{/alert}}

{{#alert "error" soft=true}}
Soft error alert with reduced intensity
{{/alert}}

### Inline Alerts

{{alert "Quick info message" "info"}} {{alert "Success!" "success"}} {{alert "Warning!" "warning"}}

## Badge Helper

Create inline badges using the `{{badge}}` helper:

### Basic Badges

Status: {{badge "Active" "success"}} {{badge "v2.1" "info"}} {{badge "Beta" "warning"}}

Project: {{badge "OkiDoki" "primary"}} {{badge "Open Source" "accent"}}

### Badge Types

{{badge "Primary" "primary"}} {{badge "Secondary" "secondary"}} {{badge "Accent" "accent"}}

{{badge "Info" "info"}} {{badge "Success" "success"}} {{badge "Warning" "warning"}} {{badge "Error" "error"}}

{{badge "Neutral" "neutral"}} {{badge "Ghost" "ghost"}} {{badge "Outline" "outline"}}

## Practical Examples

### API Endpoint Documentation

#### {{badge "GET" "primary"}} `/users`
Retrieve a list of all users in the system.

#### {{badge "POST" "success"}} `/users`
Create a new user account.

#### {{badge "PUT" "warning"}} `/users/{id}`
Update an existing user's information.

#### {{badge "DELETE" "error"}} `/users/{id}`
Remove a user from the system.

### Version Information

Current Version: {{badge "v2.1.0" "info"}}
Status: {{badge "Stable" "success"}}
Build: {{badge "#1234" "accent"}}

### Mixed Content

{{#alert "info"}}
**API Status**: {{badge "Online" "success"}} - All systems operational.

{{badge "Documentation" "primary"}} is available at `/docs`
{{/alert}}

### Code Examples

Use badges inline like this: The API returns {{badge "200 OK" "success"}} for successful requests.

## Syntax Reference

### Alert Syntax

```handlebars
<!-- Block syntax (recommended) -->
{{#alert "type"}}Your content{{/alert}}
{{#alert "type" soft=true}}Soft alert{{/alert}}

<!-- Inline syntax -->
{{alert "Message" "type"}}
```

**Types**: `info`, `success`, `warning`, `error` (or omit for neutral)

### Badge Syntax

```handlebars
{{badge "Text" "type"}}
```

**Types**: `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`, `neutral`, `ghost`, `outline` 