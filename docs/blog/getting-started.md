---
title: Getting Started with OkiDoki
description: A comprehensive guide to getting started with OkiDoki documentation generator
---

# Getting Started with OkiDoki

OkiDoki is a modern, fast, and flexible documentation generator that turns your Markdown files into beautiful documentation websites.

## Installation

Install OkiDoki globally using npm:

```bash
npm install -g okidoki
```

## Quick Start

1. **Initialize a new project**

```bash
mkdir my-docs && cd my-docs
okidoki init
```

2. **Generate your documentation**

```bash
okidoki generate
```

3. **View your site**

```bash
npx serve dist
```

## Multi-Section Navigation

One of OkiDoki's powerful features is multi-section navigation. You can organize your content into different sections (like docs, blog, guides, etc.), each with its own sidebar menu.

### How It Works

When you create a new section in `sidebars.yaml`:

```yaml
menu:
  - title: Documentation
    document: /docs.md

blog:
  - title: Blog Home
    document: /blog/index.md
  - title: Getting Started
    document: /blog/getting-started.md
```

Pages in the `/blog/` directory will automatically use the `blog` sidebar menu instead of the default `menu`.

### Best Practices

- **Prefix your paths**: Use directory prefixes like `/blog/`, `/guides/`, `/api/` to organize content
- **Name your sections**: Choose clear section names in `sidebars.yaml`
- **Keep it organized**: Each section should have a cohesive theme or purpose

## Next Steps

- Check out the [Advanced Features](/blog/advanced-features.html) guide
- Explore the [main documentation](/index.html)

