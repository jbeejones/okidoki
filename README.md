# OkiDoki - Free & Open Source Documentation Generator

[![npm version](https://img.shields.io/npm/v/okidoki.svg)](https://www.npmjs.com/package/okidoki)
[![GitHub license](https://img.shields.io/github/license/jbeejones/okidoki.svg)](https://github.com/jbeejones/okidoki/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/jbeejones/okidoki.svg)](https://github.com/jbeejones/okidoki/stargazers)

**OkiDoki** is a **free, open-source** static site generator built for API and technical documentation. Write your docs in standard Markdown and generate fast, searchable documentation sites with minimal configuration. Built for developer workflows with sub-second build times and a lightweight output.

🌟 **Completely free and open source** - No subscriptions, no limits, no vendor lock-in!

Visit the full documentation at the [OkiDoki website](https://jbeejones.github.io/okidoki-website) | [Contribute on GitHub](https://github.com/jbeejones/okidoki)

## Installation

Install OkiDoki globally using npm:

```bash
npm install -g okidoki
```
## Quick Setup

1. **Create a new documentation project:**
   ```bash
   mkdir mydocs && cd mydocs
   ```

2. **Initialize your project:**
   ```bash
   okidoki init
   ```
   This creates the basic structure with configuration files.

3. **Generate your documentation:**
   ```bash
   okidoki generate
   ```

4. **Serve your docs locally:**
   ```bash
   npx serve dist
   ```
   Your documentation will be available at `http://localhost:3000`


## Project Structure

After running `okidoki init`, you'll have:

```
mydocs/
├── okidoki.yaml      # Main configuration
├── sidebars.yaml     # Navigation structure
├── docs/             # Your markdown files
│   └── index.md      # Homepage content
└── dist/             # Generated site (after build)
```

## Basic Configuration

### okidoki.yaml
```yaml
site:
  title: "My Documentation"
  description: "Documentation for my project"
```

### sidebars.yaml
```yaml
menu:
  - title: Getting Started
    document: /start.md
  - title: API Reference
    document: /api.md
  - title: Examples
    document: /examples.md
```

## Writing Your First Page

Create a new markdown file `start.md` in the `docs/` directory:

```markdown
# My First Page

This is my first documentation page with **bold text** and `code`.

## Code Example

```javascript
function hello() {
  console.log("Hello, OkiDoki!");
}
```
The run the `okidoki generate` command again and refresh your browser to see the updated documentation site.

## Next Steps

- Check out the [Documentation Reference](https://jbeejones.github.io/okidoki-website/reference.html) for advanced features
- Browse [Examples](https://jbeejones.github.io/okidoki-website/markdown-examples.html) for inspiration  
- Visit the [Help](https://jbeejones.github.io/okidoki-website/help.html) section if you run into issues

## Key Features

- **🆓 Free & Open Source**: No subscriptions, no limits, no vendor lock-in
- **📝 Markdown First**: Write in standard markdown, no proprietary formats
- **⚡ Fast Search**: Full-text search across all documentation
- **🎨 Clean Themes**: Beautiful, responsive themes out of the box
- **⚡ Quick Build**: Generate docs in under 1 second
- **💾 Small Footprint**: Generated sites are ~50KB 

## Contributing

OkiDoki is open source and we welcome contributions! Here are ways you can help:

- 🐛 **Report bugs** - [Open an issue](https://github.com/jbeejones/okidoki/issues)
- 💡 **Suggest features** - [Start a discussion](https://github.com/jbeejones/okidoki/discussions) 
- 📝 **Improve docs** - Submit pull requests for documentation improvements
- 🔧 **Fix issues** - Check our [open issues](https://github.com/jbeejones/okidoki/issues) for ways to help
- ⭐ **Star the project** - Help others discover OkiDoki!

## License

OkiDoki is released under the [MIT License](https://github.com/jbeejones/okidoki/blob/main/LICENSE). You're free to use, modify, and distribute it for any purpose.

