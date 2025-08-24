---
title: Demo Page
description: A demo page showcasing various features
---

# Demo Page

This is a demo page showcasing various markdown features.

## Admonitions

:::info
This is an info admonition.
:::

:::tip
This is a tip admonition.
:::

:::warning
This is a warning admonition.
:::

:::danger
This is a danger admonition.
:::

## Badges

Here are some examples of the new badge functionality:

### Basic Badges
:::badge
Default Badge
:::

### Colored Badges  
:::badge-primary
Primary
:::

:::badge-secondary
Secondary
:::

:::badge-accent
Accent
:::

:::badge-info
Info
:::

:::badge-success
Success
:::

:::badge-warning
Warning
:::

:::badge-error
Error
:::

### Badge Sizes
:::badge-xs
Extra Small
:::

:::badge-sm
Small
:::

:::badge-md
Medium
:::

:::badge-lg
Large
:::

:::badge-xl
Extra Large
:::

### Badge Styles
:::badge-outline
Outline
:::

:::badge-ghost
Ghost
:::

:::badge-soft
Soft
:::

### Badges in Text
You can use badges inline like this :::badge-success Status: Active ::: within your text content.

## Diff Component

Here's an example of the diff component with different aspect ratios:

### Option 1: Remove aspect ratio constraint
```html
<figure class="diff" tabindex="0">
  <div class="diff-item-1" role="img" tabindex="0">
    <img alt="day" src="img/day.png" class="w-full h-auto" />
  </div>
  <div class="diff-item-2" role="img">
    <img alt="night" src="img/night.png" class="w-full h-auto" />
  </div>
  <div class="diff-resizer"></div>
</figure>
```

### Option 2: Use different aspect ratio
```html
<figure class="diff aspect-square" tabindex="0">
  <div class="diff-item-1" role="img" tabindex="0">
    <img alt="day" src="img/day.png" class="w-full h-full object-cover" />
  </div>
  <div class="diff-item-2" role="img">
    <img alt="night" src="img/night.png" class="w-full h-full object-cover" />
  </div>
  <div class="diff-resizer"></div>
</figure>
```

### Option 3: Use object-contain for full image visibility
```html
<figure class="diff aspect-16/9" tabindex="0">
  <div class="diff-item-1" role="img" tabindex="0">
    <img alt="day" src="img/day.png" class="w-full h-full object-contain" />
  </div>
  <div class="diff-item-2" role="img">
    <img alt="night" src="img/night.png" class="w-full h-full object-contain" />
  </div>
  <div class="diff-resizer"></div>
</figure>
```

### Option 4: Custom CSS override (recommended for cropping issues)

Add this style block to your HTML:

```html
<style>
.diff-custom {
  position: relative;
  overflow: hidden;
  height: auto !important;
  min-height: 400px;
}
.diff-custom .diff-item-1,
.diff-custom .diff-item-2 {
  position: absolute;
  top: 0;
  height: 100% !important;
  width: 100%;
}
.diff-custom img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}
</style>

<figure class="diff diff-custom" tabindex="0">
  <div class="diff-item-1" role="img" tabindex="0">
    <img alt="day" src="img/day.png" />
  </div>
  <div class="diff-item-2" role="img">
    <img alt="night" src="img/night.png" />
  </div>
  <div class="diff-resizer"></div>
</figure>
```

### Option 5: Simple inline styles (quickest fix)

```html
<figure class="diff" tabindex="0" style="height: 500px !important;">
  <div class="diff-item-1" role="img" tabindex="0">
    <img alt="day" src="img/day.png" style="width: 100%; height: 100%; object-fit: contain;" />
  </div>
  <div class="diff-item-2" role="img">
    <img alt="night" src="img/night.png" style="width: 100%; height: 100%; object-fit: contain;" />
  </div>
  <div class="diff-resizer"></div>
</figure>
```

## Code Example

```javascript
console.log("Hello World!");
``` 