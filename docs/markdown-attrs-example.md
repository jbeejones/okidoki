# Markdown Attributes Example

This page demonstrates the usage of `markdown-it-attrs` plugin in OkiDoki.

## Basic Usage

You can add HTML attributes to markdown elements using curly braces syntax:

### Headers with Classes

# Header with class {.my-header}
## Header with ID {#header-id}
### Header with both class and ID {.my-class #header-with-id}

### Paragraphs with Attributes

This is a paragraph with a class {.highlight}

This paragraph has an ID and class {#important .warning}

### Lists with Attributes

- List item with class {.important}
- Another item {.highlight}
- Third item {#special}

### Links with Attributes

[Link with class](https://example.com) {.external-link}

### Images with Attributes

![Alt text](https://via.placeholder.com/300x200) {.responsive-image #banner}

### Code Blocks with Attributes

```javascript {.code-example #js-demo}
function hello() {
    console.log("Hello, World!");
}
```

### Blockquotes with Attributes

> This is a blockquote with a class {.warning}
> 
> It can span multiple lines and still have attributes.

### Tables with Attributes

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

{.table-striped #data-table}

## Advanced Usage

### Multiple Classes and Attributes

This paragraph has multiple classes and attributes {.text-center .text-bold #main-content data-role="content"}

### Inline Elements

This text has **bold text with class** {.highlight} and *italic text with ID* {#emphasis}.

## CSS Styling Examples

You can use these attributes with CSS:

```css
.highlight {
    background-color: yellow;
    padding: 2px 4px;
}

.warning {
    border-left: 4px solid orange;
    padding-left: 10px;
    background-color: #fff3cd;
}

.table-striped tr:nth-child(even) {
    background-color: #f2f2f2;
}
```

## Notes

- Attributes are added using curly braces `{}` after the markdown element
- You can use classes (`.class-name`), IDs (`#id-name`), and other HTML attributes
- Multiple attributes can be combined: `{.class1 .class2 #id data-attr="value"}`
- The plugin works with most markdown elements: headers, paragraphs, lists, links, images, code blocks, etc.
