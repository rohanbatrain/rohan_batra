// Example: How to update Character Form to use ContentEditor

// BEFORE (current implementation):
import { Textarea } from '@/components/ui/textarea';

<div className='space-y-1'>
  <Label>Description (Rich HTML)</Label>
  <Textarea rows={5} {...register('description')} />
</div>

<div className='space-y-1'>
  <Label>Personality (Rich HTML)</Label>
  <Textarea rows={5} {...register('personality')} />
</div>

<div className='space-y-1'>
  <Label>Background (Rich HTML)</Label>
  <Textarea rows={5} {...register('background')} />
</div>


// AFTER (with ContentEditor):
import ContentEditor from '@/components/admin/ContentEditor';
import { Controller } from 'react-hook-form';

<Controller
  name="description"
  control={control}
  render={({ field }) => (
    <ContentEditor
      value={field.value || ''}
      onChange={field.onChange}
      label="Description"
      placeholder="Describe your character..."
      rows={8}
      showPreview={true}
    />
  )}
/>

<Controller
  name="personality"
  control={control}
  render={({ field }) => (
    <ContentEditor
      value={field.value || ''}
      onChange={field.onChange}
      label="Personality"
      placeholder="Describe their personality traits..."
      rows={8}
      showPreview={true}
    />
  )}
/>

<Controller
  name="background"
  control={control}
  render={({ field }) => (
    <ContentEditor
      value={field.value || ''}
      onChange={field.onChange}
      label="Background"
      placeholder="Describe their history and background..."
      rows={8}
      showPreview={true}
    />
  )}
/>


// Alternative (if not using react-hook-form Controller):
const [form, setForm] = useState({
  description: '',
  personality: '',
  background: '',
});

<ContentEditor
  value={form.description}
  onChange={(value) => setForm({ ...form, description: value })}
  label="Description"
  rows={8}
  showPreview={true}
/>

<ContentEditor
  value={form.personality}
  onChange={(value) => setForm({ ...form, personality: value })}
  label="Personality"
  rows={8}
  showPreview={true}
/>

<ContentEditor
  value={form.background}
  onChange={(value) => setForm({ ...form, background: value })}
  label="Background"
  rows={8}
  showPreview={true}
/>


// Benefits of this change:
// 1. Auto-adapts to user's editor preference (HTML or MDX)
// 2. Shows Edit/Preview tabs for better UX
// 3. Displays badge indicating current editor type
// 4. Provides link to change editor in settings
// 5. No breaking changes - all existing content still works
