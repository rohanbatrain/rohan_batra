# Visual Guide: Nested Deck UI

## Form Layout - Create Deck

```
┌─────────────────────────────────────────────────────────────┐
│ Create flashcard deck                                       │
│ After creating, you can add cards and link content.        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌───────────────────────┬───────────────────────────────┐  │
│ │ Title                 │ Subtitle                      │  │
│ │ [                   ] │ [                          ]  │  │
│ └───────────────────────┴───────────────────────────────┘  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📁 Parent Deck (Optional)                               ││
│ │ ┌─────────────────────────────────────────────────────┐ ││
│ │ │ None (top-level deck)                        ▼     │ ││
│ │ └─────────────────────────────────────────────────────┘ ││
│ │ Organize this deck under another deck (max 6 levels)   ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Description                                             ││
│ │ [                                                     ] ││
│ │ [                                                     ] ││
│ │ [                                                     ] ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌───────────────────────┬───────────────────────────────┐  │
│ │ Status                │ Visibility                    │  │
│ │ [ Draft          ▼ ]  │ [ Public             ▼ ]     │  │
│ └───────────────────────┴───────────────────────────────┘  │
│                                                             │
│ ┌───────────────────────┬───────────────────────────────┐  │
│ │ Tags                  │ Categories                    │  │
│ │ [Comma separated]     │ [Comma separated]            │  │
│ └───────────────────────┴───────────────────────────────┘  │
│                                                             │
│ ┌───────────────────────┬───────────────────────────────┐  │
│ │ Est. minutes          │ Cover image URL               │  │
│ │ [0               ]    │ [https://                  ]  │  │
│ └───────────────────────┴───────────────────────────────┘  │
│                                                             │
│                          [ Cancel ]  [ Create deck ]        │
└─────────────────────────────────────────────────────────────┘
```

## Parent Deck Dropdown (Expanded)

### Example: Hierarchical Deck Structure

```
┌────────────────────────────────────────────────┐
│ 📁 Parent Deck (Optional)                      │
├────────────────────────────────────────────────┤
│ None (top-level deck)                    ◄ ┐   │
│ Programming                               │   │
│ └─ TypeScript                             │   │
│    └─ Basics                              │   │
│    └─ Advanced                            │   │
│ └─ React                                  │   │
│    └─ Hooks                               │   │
│       └─ useState                         │   │
│ Mathematics                               │   │
│ └─ Algebra                                │   │
│ └─ Calculus                               │   │
└────────────────────────────────────────────────┘
```

### Visual Indentation Pattern

- **Level 0** (Root): No indentation
- **Level 1**: `└─` + 12px padding
- **Level 2**: `   └─` + 24px padding
- **Level 3**: `      └─` + 36px padding
- **Level 4**: `         └─` + 48px padding
- **Level 5**: `            └─` + 60px padding
- **Level 6**: Not selectable as parent (would exceed max depth)

## Edit Form - Additional Context

When editing an existing deck, the form shows:

```
┌─────────────────────────────────────────────────────────────┐
│ Manage deck                                                 │
│ Editing: TypeScript Basics                                 │
├─────────────────────────────────────────────────────────────┤
│ LEFT COLUMN                    RIGHT COLUMN                 │
│ ─────────────────────          ─────────────                │
│ • Title                        • Status                     │
│ • Slug                         • Visibility                 │
│ • Subtitle                     • Tags                       │
│ • Description                  • Categories                 │
│ • 📁 Parent Deck ← NEW         • Est. minutes               │
│                                • Cover image                │
│                                • Featured toggle            │
└─────────────────────────────────────────────────────────────┘
```

## Real-World Example

### Before: Flat Structure
```
Decks:
- Programming
- TypeScript
- TypeScript Basics
- TypeScript Advanced  
- React
- React Hooks
```

### After: Nested Structure
```
Decks:
📁 Programming
   └─ 📁 TypeScript
      ├─ 📄 TypeScript Basics
      └─ 📄 TypeScript Advanced
   └─ 📁 React
      └─ 📄 React Hooks
```

## User Workflow

### Creating a Child Deck

1. **Click**: "New Deck" button
2. **Enter**: Title = "useState Hook"
3. **Select**: Parent Deck = "Programming > React > Hooks"
4. **Result**: Deck created at path `Programming/React/Hooks/useState Hook`

### Moving a Deck

1. **Navigate**: To existing deck edit page
2. **Change**: Parent Deck dropdown from "React" to "React > Hooks"
3. **Save**: Click "Save deck"
4. **Result**: 
   - Deck moved from `Programming/React/MyDeck` 
   - To `Programming/React/Hooks/MyDeck`
   - All children also moved automatically

## Validation Messages

### Success
```
✓ Deck created
  Redirecting…
```

### Errors
```
✗ Unable to create deck
  Cannot nest deck: would exceed maximum depth of 6 levels
```

```
✗ Unable to save deck
  Cannot move deck: would create circular reference
```

## Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Space**: Open dropdown
- **Arrow Keys**: Navigate dropdown options
- **Enter**: Select option
- **Escape**: Close dropdown

## Accessibility Features

- ✅ Proper ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ Loading states announced
- ✅ Error messages linked to inputs

## Mobile Responsive

### Desktop (2 columns)
```
┌─────────────┬─────────────┐
│ Title       │ Subtitle    │
└─────────────┴─────────────┘
```

### Mobile (1 column)
```
┌─────────────┐
│ Title       │
├─────────────┤
│ Subtitle    │
└─────────────┘
```

Parent Deck dropdown remains full-width on all screen sizes.

---

## Quick Reference

| Feature | Create Form | Edit Form |
|---------|-------------|-----------|
| Parent selector | ✅ Yes | ✅ Yes |
| Current parent shown | N/A | ✅ Yes |
| Exclude self | N/A | ✅ Yes |
| Exclude descendants | N/A | ✅ Yes |
| Max depth prevention | ✅ Yes | ✅ Yes |
| Visual hierarchy | ✅ Yes | ✅ Yes |
| Loading state | ✅ Yes | ✅ Yes |

---

*This UI enhancement is part of the nested flashcard decks feature (spec 013-add-a-nested)*
