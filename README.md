# OkiDoki - static generator for API docs

## Why Choose OkiDoki?

OkiDoki is a minimal-config static site generator focused on developer documentation needs.

**Multi-language code examples**: Handlebars `{{#tabs}}` helpers let you write code snippets once and display them across multiple language tabs. Useful for API documentation where you need to show the same endpoint in Python, JavaScript, cURL, etc.

**Zero-config theming**: Uses DaisyUI and Tailwind CSS with automatic dark/light mode switching. No custom CSS required.

**Built-in search**: Lunr.js full-text search is configured out of the box. No external services needed.

**Static output**: Generates plain HTML/CSS/JS files that work on any web server or CDN. No runtime dependencies.

## Why I Built This

I got tired of existing documentation tools being either too simple (basic markdown-to-HTML converters) or overly complex (requiring extensive configuration for basic features). Most tools make you choose between beautiful output and simplicity.

When writing API docs, I kept copying the same code examples across multiple language tabs manually. I wanted a tool that could handle frontmatter variables and multi-language code blocks natively, without plugins or complex setup.

The final straw was setting up search functionality - it always required external services, complex indexing, or heavy JavaScript frameworks. I wanted something that just worked out of the box with static files.

## Quick Start

### 1. Install OkiDoki

```bash
npm install -g okidoki
```

### 2. Create your documentation project

```bash
mkdir my-docs
cd my-docs
okidoki init
```

This creates:
- `docs/` - Your markdown files
- `okidoki.yaml` - Configuration file
- `sidebars.yaml` - Navigation structure

### 3. Write your first doc

Edit `docs/index.md`:

````markdown
---
title: Getting Started
description: Welcome to my project
version: "1.0"
---

# Getting Started with {{title}}

This project is currently at version {{version}}.

{{#tabs}}
{{#tab "JavaScript"}}
```js
console.log("Hello from JavaScript!");
```
{{/tab}}

{{#tab "Python"}}
```python
print("Hello from Python!")
```
{{/tab}}
{{/tabs}}
````

### 4. Generate your site

```bash
okidoki generate
```

### 5. Preview locally

For development with automatic rebuilding, use nodemon to watch for changes:

```bash
# Watch and regenerate + serve (requires nodemon globally or via npx)
npx nodemon -w ./docs -w okidoki.yaml -w sidebars.yaml -e md,png,jpg,jpeg,gif,svg,webp,yaml,yml --exec "okidoki generate && npx serve dist"
```

Or install nodemon globally for easier usage:

```bash
npm install -g nodemon

# Then use shorter commands:
nodemon -w ./docs -w okidoki.yaml -w sidebars.yaml -e md,png,jpg,jpeg,gif,svg,webp,yaml,yml --exec "okidoki generate"
```

Alternatively, generate once and serve:

```bash
okidoki generate && npx serve dist
```

That's it! Your documentation site is ready. Edit markdown files in `docs/`, and they'll automatically rebuild during development. Deploy the `dist/` folder anywhere when ready.


## Features

- 📝 **Markdown-first** - Write docs in markdown, run `okidoki generate`, deploy static files
- 🔗 **Frontmatter variables** - Use `{{title}}` and custom variables directly in your docs  
- 🎨 **Zero-config themes** - DaisyUI + Tailwind with automatic dark/light mode
- 🔍 **Built-in search** - Lunr.js full-text search, no external dependencies
- 📱 **Multi-language code blocks** - `{{#tabs}}` helper for Python/JS/cURL examples
- ⚡ **Static output** - Deploy to Netlify, Vercel, GitHub Pages, or any CDN
- 🛠️ **Template variables** - Keep docs DRY with global and page-level variables
- 📊 **SEO ready** - Frontmatter metadata for search engine optimization

## Development Workflow

Since OkiDoki is typically installed globally, use nodemon for efficient development with auto-regeneration:

```bash
# Install nodemon globally (one-time setup)
npm install -g nodemon

# Watch files and auto-regenerate + serve
nodemon -w ./docs -w okidoki.yaml -w sidebars.yaml -e md,png,jpg,jpeg,gif,svg,webp,yaml,yml --exec "okidoki generate && npx serve dist"

# Or just watch and regenerate (no server)
nodemon -w ./docs -w okidoki.yaml -w sidebars.yaml -e md,png,jpg,jpeg,gif,svg,webp,yaml,yml --exec "okidoki generate"

# Generate once without watching
okidoki generate
```

This watches your `docs/` folder for changes to markdown files (`.md`) and images (`.png`, `.jpg`, etc.), automatically regenerates your documentation, and optionally serves it locally.

**Don't want to install nodemon globally?** Use npx:

```bash
# One-liner for development with auto-reload
npx nodemon -w ./docs -w okidoki.yaml -w sidebars.yaml -e md,png,jpg,jpeg,gif,svg,webp,yaml,yml --exec "okidoki generate && npx serve dist"
```

**Want npm scripts?** Run `okidoki init --dev` to create a package.json with development scripts:

```bash
okidoki init --dev
npm run dev:serve  # Now available!
```

