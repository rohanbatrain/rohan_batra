# MDX Migration Guide

## Overview

The admin panel now supports **two editor types** for content fields:

1. **Rich HTML** (default) - Traditional HTML editing
2. **MDX** (Markdown with JSX) - Modern, component-based content

## What Changed

### User Model
- Added `preferences.editor` field (enum: `'rich-html'` | `'mdx'`)
- Default value: `'rich-html'` (no breaking changes)

### New API Endpoint
- `GET /api/user/preferences` - Fetch user preferences
- `PATCH /api/user/preferences` - Update user preferences

### New Components
- `ContentEditor` - Universal content editor that adapts to user preference
- Admin Settings page now includes editor preference toggle

## Migration Path

### For Existing Users
**No action required!** All existing content remains as Rich HTML. Users continue with the default Rich HTML editor.

### Opt-in to MDX
1. Go to `/admin/settings`
2. Find "Content Editor Type" in User Preferences
3. Select "MDX (Markdown)"
4. Page will reload to apply changes

### For New Features
Use the `ContentEditor` component instead of `Textarea`:

```tsx
import ContentEditor from '@/components/admin/ContentEditor';

// In your form:
<ContentEditor
  value={form.description}
  onChange={(value) => setForm({ ...form, description: value })}
  label="Description"
  placeholder="Write your description..."
  rows={8}
  showPreview={true}  // Enable Edit/Preview tabs
/>
```

## MDX Features

### Markdown Syntax
```mdx
# Heading 1
## Heading 2
### Heading 3

**Bold** and *italic* text

- Bullet lists
- Multiple items

1. Numbered lists
2. In order

[Link text](https://example.com)
![Image](https://example.com/image.png)
```

### Code Blocks
````mdx
```javascript
const hello = 'world';
console.log(hello);
```
````

### Custom Components
```mdx
<Alert type="info" title="Note">
  This is an informational alert
</Alert>

<Card title="Example Card">
  Card content here
</Card>

<Badge>New Feature</Badge>
```

## Implementation Status

### ✅ Complete
- [x] User model updated with editor preference
- [x] API endpoints for preferences (GET/PATCH)
- [x] ContentEditor component with auto-detection
- [x] Admin settings page with editor toggle
- [x] MDX preview functionality
- [x] Backward compatibility maintained

### 📋 To Do
- [ ] Update character forms to use ContentEditor
- [ ] Update book chapter forms to use ContentEditor
- [ ] Update blog post forms to use ContentEditor
- [ ] Update documentation pages to use ContentEditor
- [ ] Add MDX syntax highlighting in editor
- [ ] Add MDX component autocomplete

## Benefits of MDX

### For Technical Content
- ✅ Clean, readable syntax
- ✅ Version control friendly (plain text)
- ✅ Code blocks with syntax highlighting
- ✅ Reusable React components
- ✅ Live preview

### For Documentation
- ✅ Consistent formatting
- ✅ Easy to write and maintain
- ✅ Component library integration
- ✅ Better collaboration

### For Blog Posts
- ✅ Markdown portability
- ✅ Faster writing workflow
- ✅ SEO-friendly output
- ✅ No HTML knowledge required

## Backward Compatibility

### Rich HTML Content
- All existing Rich HTML content remains unchanged
- Users can continue using Rich HTML indefinitely
- No forced migration required
- Can switch between editors anytime

### Data Storage
- Content is stored as-is (HTML or MDX)
- No conversion happens on storage
- Format is determined by user preference at time of creation
- Rendering adapts to content type

## Rendering Strategy

### Character Descriptions
```tsx
// Automatically detects content type
{character.description && (
  isMDX ? (
    <MDXContent content={character.description} />
  ) : (
    <div dangerouslySetInnerHTML={{ __html: character.description }} />
  )
)}
```

### Blog Posts
```tsx
// MDX content rendered with components
{post.contentFormat === 'mdx' ? (
  <MDXContent content={post.content} />
) : (
  <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
)}
```

## FAQ

**Q: Will this break existing content?**  
A: No! All existing Rich HTML content continues to work. MDX is opt-in.

**Q: Can I switch back to Rich HTML?**  
A: Yes, anytime through `/admin/settings`. Content created in MDX will still be MDX, but new content will use your current preference.

**Q: What about existing forms?**  
A: Existing forms still work. New forms should use `ContentEditor` component for better UX.

**Q: How do I convert existing HTML to MDX?**  
A: Use the `html-to-markdown` library or manually rewrite. No automatic conversion is provided.

**Q: Can I use HTML in MDX?**  
A: Yes! MDX supports inline HTML, but prefer Markdown syntax and custom components.

## Testing

### Test Editor Preference
1. Go to `/admin/settings`
2. Change editor type to MDX
3. Go to `/admin/characters/new`
4. Verify content fields show "MDX" badge
5. Test preview functionality
6. Switch back to Rich HTML
7. Verify fields revert to Rich HTML mode

### Test API
```bash
# Get preferences
curl http://localhost:3000/api/user/preferences \
  -H "Cookie: your-session-cookie"

# Update preferences
curl -X PATCH http://localhost:3000/api/user/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"editor": "mdx"}'
```

## Rollback Plan

If issues arise:

1. **Quick Fix**: Set default back to `'rich-html'` in User model
2. **API Disable**: Comment out preference changes in API
3. **Component Fallback**: `ContentEditor` gracefully falls back to `Textarea`
4. **Data Safe**: No data conversion means no data loss

## Next Steps

1. **Phase 1** (Current): Core infrastructure + settings toggle ✅
2. **Phase 2**: Update 5-10 major forms to use ContentEditor
3. **Phase 3**: Add syntax highlighting and autocomplete
4. **Phase 4**: Create MDX component library documentation
5. **Phase 5**: Optional HTML→MDX conversion tool

---

**Last Updated**: October 2, 2025  
**Status**: ✅ Phase 1 Complete - Ready for Testing
