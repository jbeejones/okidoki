---
title: "Code Highlighting Demo"
description: "Demonstration of line highlighting and code block titles"
---

# Code Highlighting Features

OkiDoki now supports line highlighting and optional titles for code blocks!

## Basic Line Highlighting

You can highlight specific lines in your code blocks:

```js{1,3}
const greeting = "Hello";  // This line is highlighted
const name = "World";
console.log(greeting);     // This line is highlighted too
```

## Range Highlighting and title

Use ranges to highlight multiple consecutive lines:

```python{2-4}
def calculate_sum(a, b):
    # These three lines are highlighted
    result = a + b
    return result

print(calculate_sum(5, 3))
```

## Code Block with Title

Add a title to your code blocks for better context:

```javascript title="app.js"
function initializeApp() {
    console.log("App initialized!");
}

initializeApp();
```

## Combined: Title + Line Highlighting

Use both features together:

```typescript{1,4-5} title="user.ts"
interface User {
    name: string;
    email: string;
    isActive: boolean;  // These lines are highlighted
    lastLogin: Date;    // These lines are highlighted
}

const user: User = {
    name: "John Doe",
    email: "john@example.com",
    isActive: true,
    lastLogin: new Date()
};
```

## Multiple Highlighted Lines

Highlight multiple individual lines and ranges:

```bash{1,3,5-7} title="deploy.sh"
#!/bin/bash
echo "Starting deployment..."
npm run build
echo "Build complete"
echo "Deploying to server..."
rsync -avz dist/ user@server:/var/www/
echo "Deployment complete!"
```

## Complex Example

A real-world example with API code:

```javascript{8-10,15} title="api/users.js"
const express = require('express');
const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        // These lines handle the response
        res.status(200).json(users);
        console.log(`Retrieved ${users.length} users`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// This line exports the router
module.exports = router;
```

## Syntax Examples

Here are the syntax patterns you can use:

- Single line: ` ```js{3} `
- Multiple lines: ` ```js{1,3,5} `
- Range: ` ```js{2-5} `
- Combined: ` ```js{1,3-5,8} `
- With title: ` ```js title="filename.js" `
- Both features: ` ```js{1,3-5} title="filename.js" `

The order of the line spec and title doesn't matter:
- ` ```js{1-3} title="app.js" ` ✅
- ` ```js title="app.js" {1-3} ` ✅

