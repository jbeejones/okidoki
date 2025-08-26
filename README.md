# OkiDoki - static generator for API docs

OkiDoki is a static site generator built for API and technical documentation. Write your docs in standard Markdown and generate fast, searchable documentation sites with minimal configuration. Built for developer workflows with sub-second build times and a lightweight output.

Visit the full documentation at [Githib](https://jbeejones.github.io/okidoki)

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
  theme:
    light: "fantasy"
    dark: "forest"

globals:
  version: "1.0.0"
  api_url: "https://api.example.com"
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

Create a new markdown file in the `docs/` directory:

```markdown
# My First Page

This is my first documentation page with **bold text** and `code`.

## Code Example

```javascript
function hello() {
  console.log("Hello, OkiDoki!");
}
```


## Next Steps

- Check out the [Documentation Reference](https://jbeejones.github.io/okidoki/reference.md) for advanced features
- Browse [Examples](https://jbeejones.github.io/okidoki/markdown-examples.md) for inspiration  
- Visit the [Help](https://jbeejones.github.io/okidoki/help.md) section if you run into issues

## Key Features

- **Markdown First**: Write in standard markdown, no proprietary formats
- **Fast Search**: Full-text search across all documentation
- **Clean Themes**: Beautiful, responsive themes out of the box
- **Quick Build**: Generate docs in under 1 second
- **Small Footprint**: Generated sites are ~50KB 

