# Multi-Section Navigation Feature

## Overview

This document describes the implementation of multi-section navigation in OkiDoki, which enables organizing different types of content (documentation, blogs, guides, API references, etc.) with their own dedicated sidebar menus.

## What Changed

### Core Functionality

The system now automatically detects which sidebar section a page belongs to based on its file path and renders the appropriate sidebar menu for that section.

### Modified Files

1. **src/mdhelper.js** - Updated `renderPage()` function
   - Added logic to detect which sidebar section a page belongs to
   - Searches all top-level sections in `sidebars.yaml` (except reserved `navbar` and `footer`)
   - Renders the appropriate sidebar menu based on the detected section
   - Falls back to `menu` section if page not found in any section

2. **src/index.js** - Updated `createSearchIndex()` function
   - Modified search exclusion logic to check all sidebar sections
   - Ensures search works correctly across all sections

3. **sidebars.yaml** - Added example blog section
   - Demonstrates the new multi-section capability
   - Shows how to organize content into separate sections

### New Files

1. **docs/blog/** - Example blog content directory
   - `docs/blog/index.md` - Blog home page
   - `docs/blog/getting-started.md` - Getting started guide
   - `docs/blog/advanced-features.md` - Advanced features guide

2. **docs/multi-section-navigation.md** - Comprehensive documentation
   - Complete guide on using multi-section navigation
   - Best practices and examples
   - Troubleshooting tips

## How It Works

### Detection Algorithm

When rendering a page:

1. The system retrieves all sections from `sidebars.yaml`
2. It skips reserved sections (`navbar`, `footer`)
3. For each remaining section, it recursively searches for the current page's path
4. When found, that section becomes the active sidebar section
5. If not found in any section, defaults to `menu`

### Example

Given this `sidebars.yaml`:

```yaml
menu:
  - title: Documentation
    document: /docs.md

blog:
  - title: Blog Home
    document: /blog/index.md
  - title: First Post
    document: /blog/first-post.md

navbar:
  - title: Home
    document: /index.html

footer:
  - title: Resources
    items:
      - label: GitHub
        url: https://github.com/example/repo
```

**Results:**
- `/docs.html` → Shows `menu` sidebar
- `/blog/index.html` → Shows `blog` sidebar
- `/blog/first-post.html` → Shows `blog` sidebar
- Any page not in a section → Shows `menu` sidebar (default)

## Usage

### Creating a New Section

1. **Add section to sidebars.yaml**:
```yaml
guides:
  - title: User Guide
    document: /guides/user-guide.md
  - title: Admin Guide
    document: /guides/admin-guide.md
```

2. **Create directory and files**:
```bash
mkdir docs/guides
touch docs/guides/user-guide.md
touch docs/guides/admin-guide.md
```

3. **Add content to your markdown files**:
```markdown
---
title: User Guide
description: Complete guide for users
---

# User Guide

Welcome to the user guide...
```

4. **Generate documentation**:
```bash
okidoki generate
```

Pages in `/guides/` will automatically use the `guides` sidebar!

## Benefits

1. **Automatic Organization**: Pages are automatically assigned to the correct section
2. **Clean Separation**: Different content types have their own navigation
3. **Flexibility**: Create as many sections as needed
4. **Backward Compatible**: Existing sites continue to work without changes
5. **Shared Navigation**: Top navbar and footer remain consistent across all sections

## Best Practices

1. **Use descriptive section names**: Choose clear names that reflect the content type
2. **Match directory structure**: Keep file paths consistent with section names
3. **Create index pages**: Each section should have an `index.md` landing page
4. **Add navigation links**: Include links to other sections in the navbar
5. **Consistent prefixes**: Use the same path prefix for all files in a section

Example structure:
```
docs/
├── index.md              # Main menu section
├── features.md           # Main menu section
├── blog/                 # Blog section
│   ├── index.md
│   └── post-1.md
└── api/                  # API section
    ├── index.md
    └── endpoints.md
```

## Testing

The feature has been tested with:

1. ✅ Blog section with 3 pages
2. ✅ Main menu section with existing pages
3. ✅ Verification that blog pages show blog sidebar only
4. ✅ Verification that main pages show main menu only
5. ✅ Documentation generation completes successfully
6. ✅ Search indexing works across all sections

## Migration

Existing OkiDoki sites will continue to work without any changes. The default `menu` section is used for all pages not explicitly assigned to another section.

To add sections to an existing site:
1. Add new sections to `sidebars.yaml`
2. Reorganize files into section-specific directories
3. Update internal links to use new paths
4. Regenerate documentation

## Technical Details

### Reserved Section Names

The following section names are reserved and won't be used for sidebar menus:
- `navbar` - Top navigation bar
- `footer` - Footer links

### Fallback Behavior

- If a page is not found in any section, it uses the `menu` section
- If the detected section doesn't exist, it falls back to `menu`
- If `menu` doesn't exist, an empty sidebar is rendered

### Performance

- Section detection happens during page rendering (build time)
- No runtime overhead for users
- Search indexing includes all sections

## Example Projects

See the included blog section for a working example:
- Blog pages: `/blog/index.html`, `/blog/getting-started.html`, `/blog/advanced-features.html`
- Documentation: `/multi-section-navigation.html`

## Future Enhancements

Potential improvements:
- Section-specific themes
- Section-specific search scopes
- Breadcrumb navigation showing section hierarchy
- Auto-generated section index pages

## Support

For questions or issues:
1. Check the [Multi-Section Navigation documentation](/multi-section-navigation.html)
2. Review the example blog section
3. Open an issue on GitHub

## Summary

The multi-section navigation feature provides a powerful way to organize different types of content while maintaining a clean, intuitive navigation structure. It's backward compatible, easy to use, and requires no configuration beyond organizing your content and updating `sidebars.yaml`.

