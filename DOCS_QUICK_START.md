# Quick Start Guide: Documentation System

## 🚀 Getting Started in 5 Minutes

### Step 1: Access the Admin Panel

Navigate to:
```
http://localhost:3000/admin/docs
```

You'll see the documentation projects dashboard.

### Step 2: Create Your First Documentation Project

1. Click **"New Project"** button
2. Fill in the form:
   - **Title**: "My Project Documentation"
   - **Slug**: "my-project" (auto-generated from title)
   - **Description**: Brief overview
   - **Status**: Choose "Published" to make it live
   - **Visibility**: Choose "Public" for everyone to see

3. (Optional) Configure theme:
   - Primary color: `#3b82f6` (default blue)
   - Font family: `Inter` (default)
   - Enable "Show page numbers in sidebar"

4. Click **"Create Project"**

### Step 3: Add Your First Page

1. In the project detail page, click **"Add Page"**
2. Enter page details:
   - **Title**: "Getting Started"
   - **Slug**: "getting-started" (auto-generated)
   - **Content**: Write your MDX content

Example MDX content:
```mdx
# Getting Started

Welcome to the documentation!

## Installation

To install, run:

\`\`\`bash
npm install my-package
\`\`\`

## Quick Example

\`\`\`javascript
import { MyComponent } from 'my-package';

function App() {
  return <MyComponent />;
}
\`\`\`

<Alert type="info" title="Note">
  This is a helpful tip!
</Alert>

## Next Steps

- Check out the [API Reference](/docs/my-project/api-reference)
- Read the [Tutorial](/docs/my-project/tutorial)
```

3. Watch the **live preview** update as you type
4. Click **"Save Draft"** or **"Publish"**

### Step 4: View Your Documentation

Visit:
```
http://localhost:3000/docs/my-project/getting-started
```

You'll see your beautifully rendered documentation!

## 📝 Writing Documentation

### Markdown Basics

```mdx
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
`inline code`

- Bullet list item 1
- Bullet list item 2

1. Numbered list item 1
2. Numbered list item 2

[Link text](https://example.com)
![Image alt](https://example.com/image.png)
```

### Code Blocks

\`\`\`language
// Your code here
\`\`\`

Supported languages: javascript, typescript, python, bash, css, html, json, etc.

### Custom Components

#### Alerts

```mdx
<Alert type="info" title="Information">
  This is an informational message.
</Alert>

<Alert type="warning" title="Warning">
  Be careful with this!
</Alert>

<Alert type="success" title="Success">
  Everything worked!
</Alert>

<Alert type="error" title="Error">
  Something went wrong.
</Alert>
```

#### Cards

```mdx
<Card title="Example Card">
  Content inside the card.
</Card>
```

#### Badges

```mdx
This is <Badge>New</Badge> feature!
```

#### Code Blocks with Titles

```mdx
<CodeBlock title="api.ts" language="typescript">
export function getData() {
  return fetch('/api/data');
}
</CodeBlock>
```

## 🗂️ Organizing Content

### Creating Sections

Sections help organize your documentation into logical groups.

1. In project detail, click **"Add Section"**
2. Enter section name: "API Reference"
3. Choose parent section (optional, for nesting)
4. Save

You can nest sections up to 5 levels deep.

### Organizing Pages

1. Create pages within sections
2. Use the **order** field to control display order (lower = first)
3. Pages without a section appear at the root level

### Example Structure

```
My Project Documentation
├── Getting Started
├── Installation
├── Tutorials
│   ├── Basic Tutorial
│   ├── Advanced Tutorial
│   └── Best Practices
├── API Reference
│   ├── Authentication
│   ├── Endpoints
│   │   ├── Users
│   │   └── Products
│   └── Error Handling
└── FAQ
```

## 🎨 Customizing Appearance

### Theme Colors

In project settings, set:
- **Primary Color**: Hex code like `#3b82f6`
- **Font Family**: Font stack like `Inter, system-ui, sans-serif`

### Custom CSS

Add custom CSS in project settings:

```css
.doc-content {
  font-size: 18px;
  line-height: 1.8;
}

.doc-content h1 {
  color: #2563eb;
}
```

### Logo

Upload a logo image and add the URL in project settings. It will appear in the header.

## 🔍 SEO Optimization

### Project-Level SEO

Set in project settings:
- **Meta Title**: Override default title
- **Meta Description**: Brief description for search engines
- **OG Image**: Social media preview image

### Page-Level SEO

For each page, set:
- **Meta Title**: Page-specific SEO title
- **Meta Description**: Page-specific description
- **Keywords**: Comma-separated keywords

## 📊 Analytics

Track documentation usage:

- **Views**: How many times pages are viewed
- **Searches**: How many searches are performed (when search is implemented)
- **Time on Page**: Average reading time

View analytics in the project detail page.

## 🔐 Access Control

### Status Options

- **Draft**: Not publicly visible, only admins can see
- **Published**: Live and accessible
- **Archived**: Hidden but preserved

### Visibility Options

- **Public**: Anyone can view
- **Private**: Only authenticated users
- **Unlisted**: Accessible only via direct link (not in listings)

## 💡 Pro Tips

### Auto-Save

The editor auto-saves every 3 seconds. You'll see a "Saving..." indicator.

### Keyboard Shortcuts

- **Cmd/Ctrl + S**: Manual save
- **Cmd/Ctrl + K**: Open search (coming soon)

### URL Structure

Pages are accessible at:
```
/docs/{project-slug}/{page-slug}
```

You can use paths like:
```
/docs/my-project/getting-started
/docs/my-project/api/authentication
/docs/my-project/tutorials/advanced
```

### Linking Between Pages

Use relative links:
```mdx
Check out the [API Reference](./api-reference)
Or [Authentication Guide](../guides/authentication)
```

### Table of Contents

The table of contents is automatically generated from your headings (H2, H3, etc.).

To hide a heading from TOC, use HTML:
```mdx
<h2 style="display: none;">Hidden Heading</h2>
```

### Images

Use absolute URLs or paths:
```mdx
![Architecture diagram](https://example.com/diagram.png)
![Local image](/images/screenshot.png)
```

## 🛠️ Troubleshooting

### MDX Parse Errors

If you see a parse error:
1. Check for unclosed tags
2. Ensure component names are capitalized
3. Validate your JSX syntax

### Page Not Showing

1. Check page status is "Published"
2. Verify project status is "Published"
3. Check visibility settings
4. Confirm slug is correct

### Auto-Save Not Working

1. Ensure you have edit permissions
2. Check browser console for errors
3. Verify network connection

## 🎯 Common Use Cases

### API Documentation

Create sections for:
- Authentication
- Endpoints (one page per endpoint)
- Request/Response examples
- Error codes
- Rate limits

### Tutorial Series

Create pages for:
- Introduction
- Prerequisites
- Step-by-step guides
- Common issues
- Next steps

### Product Documentation

Create sections for:
- Getting started
- Features
- Configuration
- Integrations
- FAQ
- Troubleshooting

## 🌟 Best Practices

1. **Keep pages focused**: One topic per page
2. **Use headings**: Structure content with H2, H3
3. **Add examples**: Show code snippets and examples
4. **Link related content**: Help users discover more
5. **Update regularly**: Keep documentation current
6. **Test links**: Verify all links work
7. **Optimize images**: Use compressed images
8. **Write for humans**: Clear, concise language

## 📚 Next Steps

1. Create more pages to fill out your documentation
2. Add sections to organize content
3. Customize the theme to match your brand
4. Set up SEO for better discoverability
5. Share the documentation URL with users

---

Need help? Check out the full specification in `specs/010-documentation-system/spec.md`
