---
title: Multi-Section Navigation
description: Guide to using multi-section navigation in OkiDoki for organizing different content types
pagenav: true
---

# Multi-Section Navigation

OkiDoki now supports multi-section navigation, allowing you to organize different types of content (documentation, blogs, guides, API references, etc.) with their own dedicated sidebar menus.

## Overview

With multi-section navigation, you can create separate content areas that each have their own sidebar navigation. Pages are automatically assigned to the correct section based on their path.

### Key Features

- **Automatic Detection**: Pages are automatically assigned to sections based on their file path
- **Flexible Organization**: Create as many sections as you need
- **Path-Based Routing**: Use directory prefixes to organize content
- **Seamless Navigation**: Each section maintains its own sidebar while sharing the top navbar and footer

## How It Works

When a page is rendered, OkiDoki:

1. Checks the page's path (e.g., `/blog/my-post.html`)
2. Searches all sections in `sidebars.yaml` to find which one contains this page
3. Renders the page with that section's sidebar menu
4. Falls back to the default `menu` section if not found in any section

## Setting Up Multi-Section Navigation

### 1. Define Sections in sidebars.yaml

Create top-level sections in your `sidebars.yaml` file. Each section (except `navbar` and `footer` which are reserved) can have its own sidebar menu:

```yaml
# Main documentation menu (default)
menu:
  - title: Getting Started
    document: /start.md
  - title: Configuration
    document: /configuration.md
  - title: Features
    document: /features.md

# Blog section
blog:
  - title: Blog Home
    document: /blog/index.md
  - title: Getting Started with OkiDoki
    document: /blog/getting-started.md
  - title: Advanced Features
    document: /blog/advanced-features.md

# API documentation section
api:
  - title: API Overview
    document: /api/index.md
  - title: Authentication
    document: /api/authentication.md
  - title: Endpoints
    document: /api/endpoints.md

# Top navigation bar (shared across all sections)
navbar:
  - title: Home
    document: /index.html
  - title: Blog
    document: /blog/index.html
  - title: API
    document: /api/index.html

# Footer (shared across all sections)
footer:
  - title: Resources
    items:
      - label: GitHub
        url: https://github.com/yourusername/your-repo
```

### 2. Organize Files by Section

Create directories that match your section names:

```bash
docs/
├── index.md                    # Uses 'menu' section
├── start.md                    # Uses 'menu' section
├── configuration.md            # Uses 'menu' section
├── blog/                       # Blog section
│   ├── index.md               # Uses 'blog' section
│   ├── getting-started.md     # Uses 'blog' section
│   └── advanced-features.md   # Uses 'blog' section
└── api/                        # API section
    ├── index.md               # Uses 'api' section
    ├── authentication.md      # Uses 'api' section
    └── endpoints.md           # Uses 'api' section
```

### 3. Create Content Files

Create your markdown files in the appropriate directories. The path in the file system should match the `document` paths in `sidebars.yaml`:

**docs/blog/index.md**:
```markdown
---
title: Blog Home
description: Welcome to our blog
---

# Blog Home

Welcome to our blog! Here you'll find articles and tutorials.

## Recent Posts

- [Getting Started with OkiDoki](/blog/getting-started.html)
- [Advanced Features](/blog/advanced-features.html)
```

### 4. Generate Documentation

Run the generate command as usual:

```bash
okidoki generate
```

OkiDoki will automatically:
- Detect which section each page belongs to
- Render the appropriate sidebar for each page
- Create the correct navigation structure

## Best Practices

### 1. Use Clear Directory Structure

Organize your content with clear, descriptive directory names that match your section names:

```
docs/
├── blog/           # Blog content
├── guides/         # User guides
├── api/            # API documentation
└── tutorials/      # Tutorials
```

### 2. Create Section Index Pages

Each section should have an `index.md` that serves as the landing page:

```yaml
blog:
  - title: Blog Home
    document: /blog/index.md    # Section landing page
  - title: Post 1
    document: /blog/post-1.md
```

### 3. Link Between Sections

Use absolute paths when linking between different sections:

```markdown
Check out our [API documentation](/api/index.html) for more details.
```

### 4. Consistent Path Prefixes

Always use the same prefix for files in a section:
- Blog posts: `/blog/post-name.md`
- API docs: `/api/endpoint-name.md`
- Guides: `/guides/guide-name.md`

### 5. Navigation Links

Add links to different sections in your navbar so users can easily navigate between them:

```yaml
navbar:
  - title: Docs
    document: /index.html
  - title: Blog
    document: /blog/index.html
  - title: API
    document: /api/index.html
```

## Advanced Configuration

### Nested Items

Sections can have nested menu items:

```yaml
blog:
  - title: Posts
    items:
      - label: 2024
        items:
          - label: January
            document: /blog/2024/january-post.md
          - label: February
            document: /blog/2024/february-post.md
      - label: 2023
        items:
          - label: December
            document: /blog/2023/december-post.md
```

### Section-Specific Features

You can use all OkiDoki features within each section:

```yaml
blog:
  - title: Advanced Post
    document: /blog/advanced-post.md
    pagenav: true              # Enable page navigation
    hideMenu: false            # Show sidebar
    fullWidth: false           # Standard width
```

### Search Across Sections

The search functionality automatically includes all sections. To exclude specific documents from search:

```yaml
blog:
  - title: Draft Post
    document: /blog/draft.md
    exclude_from_search: true
```

## Example Use Cases

### Documentation + Blog

```yaml
menu:
  - title: Documentation
    items:
      - label: Getting Started
        document: /docs/getting-started.md
      - label: API Reference
        document: /docs/api-reference.md

blog:
  - title: Blog Posts
    items:
      - label: Latest Release
        document: /blog/latest-release.md
      - label: Tutorial
        document: /blog/tutorial.md
```

### Product + Support

```yaml
menu:
  - title: Product Features
    document: /product.md

support:
  - title: Help Center
    document: /support/index.md
  - title: FAQ
    document: /support/faq.md
  - title: Contact
    document: /support/contact.md
```

### Multi-Language Documentation

```yaml
menu:
  - title: English Documentation
    document: /en/index.md

docs_es:
  - title: Documentación en Español
    document: /es/index.md

docs_fr:
  - title: Documentation Française
    document: /fr/index.md
```

## Troubleshooting

### Page Shows Wrong Sidebar

**Problem**: A page is showing the wrong sidebar menu.

**Solution**: Check that:
1. The file path matches the `document` path in `sidebars.yaml`
2. The document is listed in the correct section
3. The path prefix matches the section name

### Section Not Working

**Problem**: Pages in a new section are showing the default menu.

**Solution**: Verify that:
1. The section name is not a reserved word (`navbar`, `footer`)
2. Documents in the section are properly listed in `sidebars.yaml`
3. File paths match exactly (including leading `/`)

### Links Broken Between Sections

**Problem**: Links between sections result in 404 errors.

**Solution**: Use absolute paths starting with `/` and include the `.html` extension:

```markdown
<!-- Correct -->
[API Docs](/api/index.html)

<!-- Incorrect -->
[API Docs](api/index.html)
[API Docs](/api/index)
```

## Migration Guide

### From Single-Section to Multi-Section

If you have an existing OkiDoki site and want to add sections:

1. **Keep existing structure**: Your current `menu` section will continue to work
2. **Add new sections**: Create new top-level keys in `sidebars.yaml`
3. **Reorganize files**: Move files into section-specific directories
4. **Update links**: Update internal links to use new paths
5. **Regenerate**: Run `okidoki generate`

Example migration:

**Before**:
```yaml
menu:
  - title: All Content
    items:
      - label: Blog Post
        document: /blog-post.md
      - label: API Docs
        document: /api-docs.md
```

**After**:
```yaml
menu:
  - title: Documentation
    document: /index.md

blog:
  - title: Blog Post
    document: /blog/blog-post.md

api:
  - title: API Docs
    document: /api/api-docs.md
```

## Summary

Multi-section navigation in OkiDoki provides:

- **Flexibility**: Organize content into logical sections
- **Clarity**: Each section has its own focused sidebar
- **Simplicity**: Automatic detection based on file paths
- **Consistency**: Shared navbar and footer across all sections

Start organizing your documentation into sections today for a better user experience!

