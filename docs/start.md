---
title: Getting Started with OkiDoki
description: Complete guide to get started with OkiDoki documentation generator
---

# Getting Started with OkiDoki

Welcome to **OkiDoki** - an open source, simple, fast documentation generator that turns your markdown files into beautiful documentation sites.

## 🚀 Get Running in 30 Seconds

Follow these simple steps to create your first documentation site:

### 1. Install OkiDoki Globally

```bash
npm install -g okidoki
```

### 2. Create Your Project Directory

```bash
mkdir mydocs && cd mydocs
```

### 3. Initialize Your Documentation

```bash
okidoki init
```

This creates:
- `docs/` directory with sample content
- `okidoki.yaml` configuration file  
- `sidebars.yaml` navigation structure
- Beautiful homepage template

### 4. Generate Your Documentation

```bash
okidoki generate
```

### 5. Serve and View Your Site

```bash
npx serve dist
```

Your documentation will be available at `http://localhost:3000` 🎉

## ✨ Key Features

### 📝 Markdown First
Write in standard markdown. No proprietary formats required - just pure, portable markdown files.

### ⚡ Fast Search  
Full-text search across all your documentation with instant results.

### 🎨 Clean Themes
Beautiful, responsive themes out of the box. Support for light and dark modes.

### 🔧 Simple Configuration
Minimal configuration required. Everything works with sensible defaults.

## 📁 Project Structure

After running `okidoki init`, your project will look like this:

```
mydocs/
├── docs/
│   ├── index.md        # Beautiful homepage
│   ├── start.md        # This getting started guide
│   ├── help.md         # Help and support page
│   └── test.md         # Sample content page
├── okidoki.yaml        # Main configuration
├── sidebars.yaml       # Navigation structure
└── dist/               # Generated site (after build)
```

## ⚙️ Configuration

### okidoki.yaml

```yaml
site:
  title: "My Documentation"
  description: "Documentation generated with OkiDoki"
  theme:
    light: "fantasy"
    dark: "forest"

globals:
  version: "1.0.0"
  api_url: "https://api.example.com"

search:
  enabled: true
  maxResults: 10
```

### sidebars.yaml

```yaml
menu:
  - title: "Getting Started"
    document: /start.md
  - title: "API Reference" 
    document: /api.md

navbar:
  - title: "Home"
    document: /index.html
  - title: "Help"
    document: /help.md
```

## 🛠️ Development Workflow

### For Active Development

Use the `--dev` flag to set up development scripts:

```bash
okidoki init --dev
npm install
npm run dev:serve
```

This will:
- Watch for file changes
- Auto-regenerate documentation  
- Serve with live reload

### Manual Development

For manual control:

```bash
# Watch files and regenerate
nodemon -w ./docs -e md,png,jpg,jpeg,gif,svg,webp --exec "okidoki generate"

# Serve in another terminal
npx serve dist
```

## 🎯 Next Steps

1. **Customize Your Content**: Edit files in the `docs/` directory
2. **Configure Navigation**: Update `sidebars.yaml` with your page structure
3. **Personalize Settings**: Modify `okidoki.yaml` for your project needs
4. **Add More Pages**: Create additional `.md` files for your documentation
5. **Choose Themes**: Experiment with different DaisyUI themes

## 📚 Learn More

- **[Official Documentation](https://jbeejones.github.io/okidoki-website/index.html)** - Complete reference and examples
- **[GitHub Repository](https://github.com/jbeejones/okidoki)** - Source code and issues
- **Help & Support** - Check our [Help page](/help) for troubleshooting

## 💡 Tips

- **File Organization**: Keep related content in subdirectories under `docs/`
- **Images & Assets**: Place images in `docs/images/` or reference external URLs
- **Global Variables**: Use the `globals` section in `okidoki.yaml` for reusable values
- **Search Optimization**: Use descriptive titles and descriptions in your frontmatter

---

**Ready to build amazing documentation?** 🚀 

Start editing your markdown files and run `okidoki generate` to see your changes! 