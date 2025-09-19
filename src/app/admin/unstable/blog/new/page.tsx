'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichEditor from '@/components/admin/RichEditor';

export default function NovelCreateBlog() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [content, setContent] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content) return;
    setSubmitting(true);

    const payload = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      excerpt: excerpt || title,
      content, // store HTML to match current renderer
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status,
      featured: false,
    };

    const res = await fetch('/api/admin/blog-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/blog`);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || 'Failed to create post');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Blog (Novel)</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={submitting} onClick={handleSubmit}>
          {submitting ? 'Saving…' : 'Save Post'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <input className="w-full border rounded px-3 py-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <RichEditor onChange={setContent} />
        </div>
        <div className="space-y-4">
          <input className="w-full border rounded px-3 py-2" placeholder="Excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="tag1, tag2" value={tags} onChange={e => setTags(e.target.value)} />
          <select className="w-full border rounded px-3 py-2" value={status} onChange={e => setStatus(e.target.value as any)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </div>
  );
}
