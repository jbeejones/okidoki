---
title: Admonitions Demo
description: Testing the new admonition syntax
---

# Admonitions Demo

This page demonstrates the new admonition syntax alongside the existing Handlebars alert helpers.

## New Admonition Syntax

You can now use VitePress/Docusaurus-style admonitions:

:::info
This is an informational callout. Use it for neutral information and general notes.
:::

:::tip
This is a tip callout. Great for helpful suggestions and best practices that users should know.
:::

:::warning  
This is a warning callout. Use it to highlight potential issues or things users should be careful about.
:::

:::danger
This is a danger callout. Use it for critical warnings and errors that could cause problems.
:::

## Existing Handlebars Alert Helpers

You can still use the existing Handlebars syntax:

{{#alert type="info"}}
This is an info alert using the Handlebars helper syntax.
{{/alert}}

{{#alert type="success"}}
This is a success alert using the Handlebars helper syntax.
{{/alert}}

{{#alert type="warning"}}
This is a warning alert using the Handlebars helper syntax.
{{/alert}}

{{#alert type="error"}}
This is an error alert using the Handlebars helper syntax.
{{/alert}}

## Mixed Usage

You can mix both syntaxes in the same document:

:::info
This admonition contains **markdown formatting** and `inline code`.

- It supports lists
- And other markdown features
- Including [links](https://example.com)
:::

{{#alert type="success"}}
This Handlebars alert also supports **markdown** and `code`.
{{/alert}}

## Multiline Admonitions

:::tip
Admonitions can contain multiple paragraphs and complex content.

This is a second paragraph with more detailed information.

```javascript
// They can even contain code blocks
console.log("Hello from an admonition!");
```

And more content after the code block.
::: 