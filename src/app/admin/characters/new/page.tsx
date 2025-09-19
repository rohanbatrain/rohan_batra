'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function NewCharacterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [form, setForm] = useState({
    name: '',
    fullName: '',
    slug: '',
    visibility: 'private',
    role: 'supporting',
    significance: 'minor',
    age: '' as string | number,
    birthdate: '' as string,
    tags: '' as string,
    description: '<p></p>',
    personality: '<p></p>',
    background: '<p></p>',
    physicalDescription: '',
    goals: '',
    conflicts: '',
    avatar: '',
  });

  function validate(f = form) {
    const e: { [k: string]: string } = {};
    if (!f.name.trim()) e.name = 'Name is required';
    if (f.slug) {
      const ok = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug);
      if (!ok) e.slug = 'Slug must be lowercase letters, numbers and dashes';
    }
    if (f.age !== '' && Number(f.age) < 0) e.age = 'Age must be 0 or greater';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const isValid = useMemo(() => {
    if (!form.name.trim()) return false;
    if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) return false;
    if (form.age !== '' && Number(form.age) < 0) return false;
    return true;
  }, [form]);

  function computeAgeFromBirthdate(dateStr: string): number | '' {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }

  async function submit() {
  if (!validate()) return;
    setSubmitting(true);
    const payload: any = {
      name: form.name.trim(),
      fullName: form.fullName || undefined,
      slug: form.slug || undefined,
      visibility: form.visibility,
      role: form.role,
      significance: form.significance,
      age: form.age ? Number(form.age) : undefined,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      description: form.description,
      personality: form.personality,
      background: form.background,
      physicalDescription: form.physicalDescription || undefined,
      goals: form.goals || undefined,
      conflicts: form.conflicts || undefined,
      avatar: form.avatar || undefined,
    };
    const res = await fetch('/api/admin/characters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSubmitting(false);
    if (res.ok) {
      toast({ title: 'Created', description: 'Character created successfully' });
      const json = await res.json();
      const id = json?.character?.id || json?.character?._id || json?.character?._doc?._id;
      router.push(`/admin/characters/${id}`);
    } else {
      let message = 'Failed to create character';
      try {
        const err = await res.json();
        message = err?.error || err?.details?.[0]?.message || message;
        if (Array.isArray(err?.details)) {
          const mapped: Record<string, string> = {};
          for (const issue of err.details) {
            const path = Array.isArray(issue.path) && issue.path.length ? String(issue.path[0]) : undefined;
            if (path) mapped[path] = issue.message || 'Invalid value';
          }
          setErrors(prev => ({ ...prev, ...mapped }));
        }
      } catch {}
      toast({ title: 'Error', description: message || 'Fix highlighted fields', variant: 'destructive' });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Character</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push('/admin/characters')}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || !isValid}>Create</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 space-y-3">
          <h2 className="font-medium">Basics</h2>
          <Input placeholder="Name" value={form.name} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, name: v })); setErrors(prev => ({ ...prev, name: v.trim() ? '' : 'Name is required' })); }} />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          <Input placeholder="Full Name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
          <Input placeholder="Slug (optional)" value={form.slug} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, slug: v })); if (v && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) setErrors(prev => ({ ...prev, slug: 'Slug must be lowercase letters, numbers and dashes' })); else setErrors(prev => ({ ...prev, slug: '' })); }} />
          {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
          <div className="flex gap-3">
            <Select value={form.visibility} onValueChange={v => setForm(f => ({ ...f, visibility: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="protagonist">Protagonist</SelectItem>
                <SelectItem value="antagonist">Antagonist</SelectItem>
                <SelectItem value="supporting">Supporting</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={form.significance} onValueChange={v => setForm(f => ({ ...f, significance: v }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Significance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="background">Background</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" placeholder="Birthdate" value={form.birthdate} onChange={e => {
            const v = e.target.value;
            const derived = computeAgeFromBirthdate(v);
            setForm(f => ({ ...f, birthdate: v, age: derived }));
            setErrors(prev => ({ ...prev, age: '' }));
          }} />
          <p className="text-xs text-muted-foreground">Age is derived from birthdate if provided.</p>
          <Input type="number" placeholder="Age" value={form.age} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, age: v })); setErrors(prev => ({ ...prev, age: v !== '' && Number(v) < 0 ? 'Age must be 0 or greater' : '' })); }} />
          {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
          <Input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="font-medium">Details</h2>
          <Textarea placeholder="Description (Rich HTML)" rows={5} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Textarea placeholder="Personality (Rich HTML)" rows={5} value={form.personality} onChange={e => setForm(f => ({ ...f, personality: e.target.value }))} />
          <Textarea placeholder="Background (Rich HTML)" rows={5} value={form.background} onChange={e => setForm(f => ({ ...f, background: e.target.value }))} />
          <Textarea placeholder="Physical Description" rows={3} value={form.physicalDescription} onChange={e => setForm(f => ({ ...f, physicalDescription: e.target.value }))} />
          <Textarea placeholder="Goals" rows={3} value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))} />
          <Textarea placeholder="Conflicts" rows={3} value={form.conflicts} onChange={e => setForm(f => ({ ...f, conflicts: e.target.value }))} />
          <Input placeholder="Avatar URL" value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} />
        </Card>
      </div>
    </div>
  );
}
