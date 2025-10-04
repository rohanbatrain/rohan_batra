# Select Component Empty String Value Fix

## Issue
React Select components in Radix UI cannot have empty string (`''`) values in `<SelectItem>` components. This was causing console errors:

```
A <Select.Item /> must have a value prop that is not an empty string. 
This is because the Select value can be set to an empty string to clear 
the selection and show the placeholder.
```

## Root Cause
Multiple form components were using `<SelectItem value=''>None</SelectItem>` for the "no parent lesson" option, which violates the Select component's constraints.

## Solution
Replaced all empty string values with a special sentinel value `'__none__'` and updated the logic to handle this properly.

## Files Fixed

### 1. `/src/components/experience/ExperienceForm.tsx`
- **Issue**: Missing default value for `employmentType` when creating new experience
- **Fix**: Added `employmentType: 'Full-time'` to default form values

### 2. `/src/components/admin/courses/NewLessonForm.tsx`
- **Issue**: `<SelectItem value=''>None</SelectItem>` for parent lesson selection
- **Fixes**:
  - Changed default `parentLessonId` from `''` to `'__none__'`
  - Updated `<SelectItem value='__none__'>None</SelectItem>`
  - Modified `buildPayload()` to check `lessonForm.parentLessonId !== '__none__'` before including in payload

### 3. `/src/components/admin/courses/LessonForm.tsx`
- **Issue**: Same empty string issue for parent lesson selection
- **Fixes**:
  - Changed default `parentLessonId` from `''` to `'__none__'`
  - Updated `<SelectItem value='__none__'>None</SelectItem>`
  - Modified `buildPayload()` to check `form.parentLessonId !== '__none__'` before including in payload
  - Updated `useEffect` to convert `null` to `'__none__'` when loading existing lesson data

### 4. `/src/components/admin/courses/CourseManagerContent.tsx`
- **Issue**: Bulk parent assignment selector using empty string
- **Fixes**:
  - Changed default value from `bulkParentByModule[module.id] ?? ''` to `bulkParentByModule[module.id] ?? '__none__'`
  - Updated `<SelectItem value='__none__'>None</SelectItem>`
  - Modified `bulkAssignParent()` to convert `'__none__'` to `null` before API call

## Testing Checklist
- [ ] Create new experience - should not show console error
- [ ] Create new lesson in a course module - parent lesson dropdown should work
- [ ] Edit existing lesson - parent lesson dropdown should show correct value
- [ ] Bulk assign parent in course manager - should work with "None" option
- [ ] Changing parent from a lesson to "None" should clear the parent
- [ ] No console errors related to Select components

## Technical Details
The `'__none__'` sentinel value is:
- Used only in the UI layer (form state and Select components)
- Converted to `null` or excluded from the payload when sending to the API
- Converted from `null`/`undefined` to `'__none__'` when loading data from the API

This maintains backward compatibility with the API while fixing the UI component constraint violation.
