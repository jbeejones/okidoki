---
title: Advanced Features
description: Explore advanced features of OkiDoki
pagenav: true
---

# Advanced Features

OkiDoki comes with many advanced features that make it a powerful documentation tool.

## Multi-Section Navigation

The multi-section navigation feature allows you to organize content into separate areas, each with its own sidebar menu.

### Creating New Sections

To create a new section:

1. **Add a section to `sidebars.yaml`**:

```yaml
guides:
  - title: User Guide
    document: /guides/user-guide.md
  - title: Admin Guide
    document: /guides/admin-guide.md
```

2. **Create the directory and files**:

```bash
mkdir docs/guides
touch docs/guides/user-guide.md
touch docs/guides/admin-guide.md
```

3. **Generate your documentation**:

```bash
okidoki generate
```

Pages in `/guides/` will automatically use the `guides` sidebar!

## Page Navigation

Add a table of contents to your pages with the `pagenav` frontmatter:

```yaml
---
title: My Page
pagenav: true
---
```

This creates a sidebar navigation showing all headings on the page.

## Custom HTML Pages

You can include custom HTML pages with Handlebars templating:

```yaml
---
title: Custom Page
customHTML: true
---

<div class="hero">
  <h1>{{title}}</h1>
  <p>This is raw HTML with Handlebars support!</p>
</div>
```

## Search Functionality

OkiDoki includes built-in search powered by Lunr.js. Configure it in `okidoki.yaml`:

```yaml
search:
  enabled: true
  maxResults: 10
  minSearchLength: 2
  placeholder: "Search documentation..."
```

## Theming

Customize your site's appearance with DaisyUI themes:

```yaml
site:
  theme:
    light: "lemonade"
    dark: "coffee"
```

## Learn More

- Return to [Blog Home](/blog/index.html)
- Visit the [main documentation](/index.html)

