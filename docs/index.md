---
title: Welcome to Okidoki
description: Your documentation is now ready
handlebars: true
---

# Welcome to Okidoki

This is an example documentation page. Edit this file to get started with your documentation.

## Features

- Markdown support
- Search functionality
- Beautiful UI
- Cache invalidation system
- Content hash validation

## New Section

This is a new section added to test cache invalidation. The search index should be updated with this new content.

## Custom Content Example

The content below is included from a custom HTML file using the include helper:

{{include "custom.html"}}

And here's another example with beautifully formatted HTML:

{{include "call-to-action.html"}}

This demonstrates how you can include custom HTML content with full access to the current page context - including proper indentation, line breaks, and nested elements!

## 🎛️ Layout Controls Demo

Check out the **[Landing Page Demo](landing.html)** to see layout controls in action:
- No sidebar menu
- No breadcrumbs  
- No footer
- Full-width content
- Perfect for marketing/splash pages

The layout controls can be set via:
- **Frontmatter**: `hideMenu: true`, `hideBreadcrumbs: true`, `hideFooter: true`, `fullWidth: true`
- **sidebars.yaml**: Configure layout properties for specific menu items
