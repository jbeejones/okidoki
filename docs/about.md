---
title: About OkiDoki
description: Learn about OkiDoki - a minimal-config static site generator for API documentation
handlebars: false
---

# OkiDoki - static generator for API docs

## Why Choose OkiDoki?

OkiDoki is a minimal-config static site generator focused on developer documentation needs.

**Multi-language code examples**: Handlebars `{{#tabs}}` helpers let you write code snippets once and display them across multiple language tabs. Useful for API documentation where you need to show the same endpoint in Python, JavaScript, cURL, etc.

**Zero-config theming**: Uses DaisyUI and Tailwind CSS with automatic dark/light mode switching. No custom CSS required.

**Built-in search**: Lunr.js full-text search is configured out of the box. No external services needed.

**Static output**: Generates plain HTML/CSS/JS files that work on any web server or CDN. No runtime dependencies.



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

Edit `okidoki.yaml` for the docs title and global variables.

```yaml
# Okidoki Configuration
site:
  title: "My Docs"
  description: "Docs generated with Okidoki"

# globals
globals:
  version: "1.0.0"
  author: "John Doe"
```

Edit `docs/index.md`:

````markdown

# Getting started

This doumentation is currently for version {{globals.version}}.

This is a code example in JavaScript:
```js
console.log("Hello from JavaScript!");
```

Author: {{globals.author}}
````

### 4. Generate your site

```bash
okidoki generate
```

### 5. Preview locally

**Simplest approach** - Generate once and serve:

```bash
okidoki generate && npx serve dist
```

**Auto-rebuild during development** - For automatic rebuilding when files change, install nodemon:

```bash
npm install -g nodemon

# Watch files and auto-regenerate
nodemon -w ./docs -w okidoki.yaml -w sidebars.yaml -e md,png,jpg,jpeg,gif,svg,webp,yaml,yml --exec "okidoki generate && npx serve dist"
```

**Don't want to install nodemon globally?** Use npx instead:

```bash
npx nodemon -w ./docs -w okidoki.yaml -w sidebars.yaml -e md,png,jpg,jpeg,gif,svg,webp,yaml,yml --exec "okidoki generate && npx serve dist"
```

That's it! Your documentation site is ready. Edit markdown files in `docs/`, and they'll automatically rebuild during development. Deploy the `dist/` folder anywhere when ready.


## Deployment

OkiDoki generates static files in the `dist/` folder that can be deployed anywhere. Here are the most popular deployment options:

### GitHub Pages

Deploy directly from your GitHub repository:

1. **Create a GitHub Actions workflow** (recommended):

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install OkiDoki
        run: npm install -g okidoki
        
      - name: Generate site
        run: okidoki generate
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. **Enable Pages in repository settings**:
   - Go to Settings → Pages
   - Source: "GitHub Actions"
   - Your site will be available at `https://username.github.io/repository-name`

### Netlify

Deploy with automatic builds from Git or manual drag-and-drop:

#### Option 1: Git Integration (Recommended)
1. Connect your GitHub/GitLab repository to Netlify
2. **Build settings**:
   - Build command: `npm install -g okidoki && okidoki generate`
   - Publish directory: `dist`
3. **Environment variables** (if needed):
   - `NODE_VERSION`: `18` (or your preferred version)

#### Option 2: Manual Deploy
```bash
# Generate your site
okidoki generate

# Install Netlify CLI
npm install -g netlify-cli

# Deploy (first time)
netlify deploy --dir=dist --prod
```

### Vercel

Deploy with Git integration or Vercel CLI:

#### Option 1: Git Integration (Recommended)
1. Import your repository at [vercel.com/new](https://vercel.com/new)
2. **Build settings** (usually auto-detected):
   - Framework Preset: Other
   - Build Command: `npm install -g okidoki && okidoki generate`
   - Output Directory: `dist`

#### Option 2: Vercel CLI
```bash
# Generate your site
okidoki generate

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Other Options

**Traditional Web Hosting**: Upload the `dist/` folder contents via FTP/SFTP to your web server's public directory.

**Amazon S3 + CloudFront**: Perfect for high-traffic sites requiring global CDN distribution.

**Firebase Hosting**: Google's hosting solution with easy CLI deployment.

All these platforms support custom domains and HTTPS out of the box. Your documentation will be fast and globally distributed! 🚀

## Why I Built OkiDoki

I got tired of existing documentation tools being either too simple (basic markdown-to-HTML converters) or overly complex (requiring extensive configuration for basic features). Most tools make you choose between beautiful output and simplicity.

When writing API docs, I kept copying the same code examples across multiple language tabs manually. I wanted a tool that could handle frontmatter variables and multi-language code blocks natively, without plugins or complex setup.

The final straw was setting up search functionality - it always required external services, complex indexing, or heavy JavaScript frameworks. I wanted something that just worked out of the box with static files.
