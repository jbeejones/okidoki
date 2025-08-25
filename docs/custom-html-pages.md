---
title: Custom HTML Pages Guide
description: Learn how to create complete custom HTML pages that override the default templates
---

# Custom HTML Pages Guide

OkiDoki allows you to completely override the default page templates by creating custom HTML files in your `assets` directory. These custom pages can include search functionality, Handlebars context, and full control over the layout.

## 🎯 How It Works

Any HTML file placed in your `assets` directory will **completely replace** the generated page:

```
your-project/
├── assets/
│   ├── index.html          # Overrides generated index.html
│   ├── about.html          # Overrides generated about.html
│   ├── custom-page.html    # Creates entirely new page
│   └── search-desktop.html # Search component include
├── docs/
│   ├── index.md           # Still processed but overridden by assets/index.html
│   └── about.md           # Still processed but overridden by assets/about.html
└── okidoki.yaml
```

## ⚡ Handlebars Processing

Custom HTML files are automatically processed with Handlebars if they contain `{{` syntax:

### Available Context Variables

```html
<!-- Site information -->
<title>{{title}} - {{site.title}}</title>
<meta name="description" content="{{site.description}}">
<link rel="icon" href="{{site.favicon}}">

<!-- Site URLs -->
<a href="{{site.baseUrl}}/index.html">Home</a>
<img src="{{site.logo}}" alt="{{site.title}}">

<!-- Current year for copyright -->
<p>© {{copyright.year}} {{copyright.name}}</p>
```

### Include Components

You can include reusable components in your custom pages:

```html
<!-- Include search functionality -->
{{include "search-desktop.html"}}
{{include "search-mobile.html"}}

<!-- Include custom components -->
{{include "hero-section.html"}}
{{include "footer-links.html"}}
```

## 🔍 Adding Search to Custom Pages

### Method 1: Include Files

Use pre-built search components:

```html
<head>
    <!-- Required for search functionality -->
    <script src="https://unpkg.com/lunr/lunr.js" defer></script>
    <script src="/mybundle.js" defer></script>
</head>
<body>
    <!-- Desktop search -->
    <div class="navbar">
        <div class="flex-1">Brand</div>
        <div class="flex-none">
            {{include "search-desktop.html"}}
        </div>
    </div>
    
    <!-- Mobile search -->
    <div class="lg:hidden">
        {{include "search-mobile.html"}}
    </div>
</body>
```

### Method 2: Search Helper

Use the Handlebars helper for more control:

```html
<!-- Desktop search with custom width -->
{{searchComponent variant="desktop" width="w-64"}}

<!-- Mobile navbar search -->
{{searchComponent variant="mobile-navbar"}}

<!-- Mobile sidebar search -->
{{searchComponent variant="mobile-sidebar"}}

<!-- Custom placeholder -->
{{searchComponent variant="desktop" placeholder="Search our docs..."}}
```

### Method 3: Manual HTML

Write the search HTML manually:

```html
<div class="dropdown dropdown-end">
    <input 
        id="search-desktop" 
        type="text" 
        placeholder="Search documentation..." 
        class="input input-bordered w-24 md:w-auto" 
        tabindex="0"
        oninput="handleSearch(this.value)" 
    />
    <ul id="search-results" class="dropdown-content bg-base-100 rounded-box z-[1] w-96 p-2 shadow hidden max-h-96 overflow-y-auto">
        <!-- Search results populated by JavaScript -->
    </ul>
</div>
```

## 📋 Complete Example

Here's a complete custom page template:

```html
<!DOCTYPE html>
<html lang="en" data-theme="fantasy">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - {{site.title}}</title>
    
    <!-- Required stylesheets and scripts -->
    <link rel="stylesheet" href="/mystyles.css">
    <script src="https://unpkg.com/lunr/lunr.js" defer></script>
    <script src="/mybundle.js" defer></script>
    <link rel="icon" href="{{site.favicon}}">
    
    <!-- Theme switching -->
    <script>
        const lightTheme = 'fantasy';
        const darkTheme = 'forest';
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', darkTheme);
        } else {
            document.documentElement.setAttribute('data-theme', lightTheme);
        }
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            document.documentElement.setAttribute('data-theme', e.matches ? darkTheme : lightTheme);
        });
    </script>
</head>
<body class="bg-base-100">
    
    <!-- Navigation with search -->
    <div class="navbar bg-base-100 border-b">
        <div class="flex-1">
            <a href="/" class="btn btn-ghost text-xl">{{site.title}}</a>
        </div>
        <div class="flex-none">
            {{include "search-desktop.html"}}
        </div>
    </div>
    
    <!-- Your custom content -->
    <main class="container mx-auto p-4">
        <h1>{{title}}</h1>
        <p>{{site.description}}</p>
        
        <!-- Include custom components -->
        {{include "hero-section.html"}}
    </main>
    
</body>
</html>
```

## 🛠 Required Files for Search

To make search work in custom HTML pages, ensure these files are included:

### 1. CSS & JavaScript
```html
<link rel="stylesheet" href="/mystyles.css">
<script src="https://unpkg.com/lunr/lunr.js" defer></script>
<script src="/mybundle.js" defer></script>
```

### 2. Search Component IDs

Use the correct IDs for search functionality:
- **Desktop**: `search-desktop` (input), `search-results` (results)
- **Mobile Navbar**: `search-mobile-navbar` (input), `search-results-mobile-navbar` (results)  
- **Mobile Sidebar**: `search-mobile` (input), `search-results-mobile` (results)

### 3. Event Handlers

Include the required JavaScript event handlers:
```html
oninput="handleSearch(this.value)" 
```

## 💡 Use Cases

### Landing Pages
Create `assets/index.html` for a custom homepage with hero sections, features grid, and call-to-action buttons.

### About Pages
Create `assets/about.html` with team information, company history, and custom layouts.

### Documentation Portals
Create `assets/docs.html` with custom navigation, search prominence, and documentation organization.

### API References
Create `assets/api.html` with interactive API documentation and examples.

## 🚨 Important Notes

1. **Override Behavior**: HTML files in assets completely replace generated pages
2. **Search Dependencies**: Always include lunr.js and mybundle.js for search
3. **Context Availability**: All site configuration is available in Handlebars context
4. **Include Processing**: Include helpers work the same as in markdown files
5. **Theme Support**: Use `data-theme` attribute for DaisyUI theme switching

## 🔧 Debugging

If your custom HTML isn't working:

1. **Check Console**: Look for JavaScript errors in browser dev tools
2. **Verify IDs**: Ensure search input and results have correct IDs
3. **Include Scripts**: Confirm lunr.js and mybundle.js are loading
4. **Test Handlebars**: Use `{{site.title}}` to verify context is working
5. **File Location**: Ensure HTML files are in the `assets` directory

This powerful feature gives you complete control over your documentation's appearance while maintaining all of OkiDoki's functionality! 