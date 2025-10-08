'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Folder, Link2 } from 'lucide-react';

export default function DeckCreateContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { isLoaded, isSignedIn } = useAuth();
  const [creating, setCreating] = useState(false);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<
    Array<{ id: string; title: string; level: number; path: string }>
  >([]);
  const [availableCourses, setAvailableCourses] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([]);
  const [availableModules, setAvailableModules] = useState<
    Array<{ id: string; title: string; order: number }>
  >([]);
  const [availableLessons, setAvailableLessons] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([]);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    coverImage: '',
    status: 'draft',
    visibility: 'public',
    isFeatured: false,
    tags: '',
    categories: '',
    estimatedReviewMinutes: '',
    parentDeckId: '__none__',
    // Link targets
    linkScope: 'standalone' as 'standalone' | 'course' | 'module' | 'lesson',
    linkCourseId: '',
    linkModuleId: '',
    linkLessonId: '',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  // Load available decks for parent selection
  useEffect(() => {
    // Don't fetch if auth is not loaded or user is not signed in
    if (!isLoaded || !isSignedIn) return;
    
    const loadDecks = async () => {
      try {
        setLoadingDecks(true);
        const res = await fetch('/api/admin/flashcards?tree=true');
        if (!res.ok) {
          // Silently fail - likely auth issue on page load
          if (res.status === 401 || res.status === 400) {
            return;
          }
          console.error('Failed to load decks:', res.status);
          return;
        }
        const data = await res.json();

        // Flatten tree for dropdown (exclude decks at max depth)
        const flatten = (nodes: any[], depth = 0): any[] => {
          const MAX_DEPTH = 6;
          return nodes.flatMap(node => {
            const items =
              node.level < MAX_DEPTH - 1
                ? [
                    {
                      id: node.id,
                      title: node.title,
                      level: node.level,
                      path: node.path,
                    },
                  ]
                : [];
            if (node.children && node.children.length > 0) {
              items.push(...flatten(node.children, depth + 1));
            }
            return items;
          });
        };

        setAvailableDecks(flatten(data.decks || []));
      } catch (err) {
        console.error('Failed to load decks:', err);
      } finally {
        setLoadingDecks(false);
      }
    };
    loadDecks();
  }, [isLoaded, isSignedIn]);

  // Load courses when link scope requires it
  useEffect(() => {
    // Don't fetch if auth is not loaded or user is not signed in
    if (!isLoaded || !isSignedIn) return;
    if (form.linkScope === 'standalone') return;
    
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await fetch('/api/admin/courses');
        if (!res.ok) return;
        const data = await res.json();
        setAvailableCourses(
          data.courses?.map((c: any) => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
          })) || []
        );
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, [form.linkScope, isLoaded, isSignedIn]);

  // Load modules when course is selected
  useEffect(() => {
    // Don't fetch if auth is not loaded or user is not signed in
    if (!isLoaded || !isSignedIn) return;
    if (!form.linkCourseId || (form.linkScope !== 'module' && form.linkScope !== 'lesson')) {
      setAvailableModules([]);
      return;
    }
    
    const loadModules = async () => {
      try {
        setLoadingModules(true);
        const res = await fetch(`/api/admin/courses/${form.linkCourseId}/modules`);
        if (!res.ok) return;
        const data = await res.json();
        setAvailableModules(
          data.modules?.map((m: any) => ({
            id: m.id,
            title: m.title,
            order: m.order,
          })) || []
        );
      } catch (err) {
        console.error('Failed to load modules:', err);
      } finally {
        setLoadingModules(false);
      }
    };
    loadModules();
  }, [form.linkCourseId, form.linkScope, isLoaded, isSignedIn]);

  // Load lessons when module is selected
  useEffect(() => {
    // Don't fetch if auth is not loaded or user is not signed in
    if (!isLoaded || !isSignedIn) return;
    if (!form.linkModuleId || form.linkScope !== 'lesson') {
      setAvailableLessons([]);
      return;
    }
    
    const loadLessons = async () => {
      try {
        setLoadingLessons(true);
        const res = await fetch(
          `/api/admin/courses/${form.linkCourseId}/modules/${form.linkModuleId}/lessons`
        );
        if (!res.ok) return;
        const data = await res.json();
        setAvailableLessons(
          data.lessons?.map((l: any) => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
          })) || []
        );
      } catch (err) {
        console.error('Failed to load lessons:', err);
      } finally {
        setLoadingLessons(false);
      }
    };
    loadLessons();
  }, [form.linkModuleId, form.linkCourseId, form.linkScope, isLoaded, isSignedIn]);

  const create = async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a deck title.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setCreating(true);
      const payload: Record<string, any> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        description: form.description.trim() || undefined,
        coverImage: form.coverImage.trim() || undefined,
        status: form.status,
        visibility: form.visibility,
        isFeatured: form.isFeatured,
        tags: form.tags
          ? form.tags
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
        categories: form.categories
          ? form.categories
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
        parentDeckId:
          form.parentDeckId === '__none__' ? undefined : form.parentDeckId,
      };
      
      if (form.estimatedReviewMinutes.trim()) {
        const m = Number(form.estimatedReviewMinutes);
        if (!Number.isNaN(m) && m >= 0) payload.estimatedReviewMinutes = m;
      }
      
      // Add linkTargets if not standalone
      if (form.linkScope !== 'standalone') {
        const linkTarget: any = { scope: form.linkScope };
        
        if (form.linkScope === 'course' && form.linkCourseId) {
          linkTarget.courseId = form.linkCourseId;
        } else if (form.linkScope === 'module' && form.linkCourseId && form.linkModuleId) {
          linkTarget.courseId = form.linkCourseId;
          linkTarget.moduleId = form.linkModuleId;
        } else if (form.linkScope === 'lesson' && form.linkCourseId && form.linkModuleId && form.linkLessonId) {
          linkTarget.courseId = form.linkCourseId;
          linkTarget.moduleId = form.linkModuleId;
          linkTarget.lessonId = form.linkLessonId;
        }
        
        // Only add linkTargets if we have valid IDs
        if (Object.keys(linkTarget).length > 1) {
          payload.linkTargets = [linkTarget];
        }
      }
      
      const res = await fetch('/api/admin/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        console.error('Deck creation failed:');
        console.error('Status:', res.status);
        console.error('Error response:', j);
        console.error('Payload sent:', payload);
        
        // If there are validation details, log them clearly
        if (j.details && Array.isArray(j.details)) {
          console.error('Validation errors:');
          j.details.forEach((detail: any) => {
            console.error(`  - Field: ${detail.path?.join('.') || 'unknown'}`);
            console.error(`    Code: ${detail.code}`);
            console.error(`    Message: ${detail.message}`);
          });
        }
        
        throw new Error(j.error || 'Failed to create deck');
      }
      const created: { id: string } = await res.json();
      toast({ title: 'Deck created', description: 'Redirecting…' });
      router.push(`/admin/flashcards/${created.id}`);
    } catch (err) {
      toast({
        title: 'Unable to create deck',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Create flashcard deck</h1>
          <p className='text-sm text-muted-foreground'>
            After creating, you can add cards and link content.
          </p>
        </div>
      </div>
      <div className='rounded-lg border p-4 dark:border-gray-800 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='subtitle'>Subtitle</Label>
            <Input
              id='subtitle'
              value={form.subtitle}
              onChange={e => set('subtitle', e.target.value)}
            />
          </div>
        </div>

        {/* Parent Deck Selector - NEW */}
        <div className='space-y-2'>
          <Label htmlFor='parentDeck' className='flex items-center gap-2'>
            <Folder className='h-4 w-4' />
            Parent Deck (Optional)
          </Label>
          <Select
            value={form.parentDeckId}
            onValueChange={v => set('parentDeckId', v)}
            disabled={loadingDecks}
          >
            <SelectTrigger id='parentDeck'>
              <SelectValue
                placeholder={
                  loadingDecks ? 'Loading decks...' : 'None (top-level deck)'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__none__'>None (top-level deck)</SelectItem>
              {availableDecks.map(deck => (
                <SelectItem key={deck.id} value={deck.id}>
                  <span style={{ paddingLeft: `${deck.level * 12}px` }}>
                    {deck.level > 0 && '└─ '}
                    {deck.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-xs text-muted-foreground'>
            Organize this deck under another deck (max 6 levels deep)
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            rows={4}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='draft'>Draft</SelectItem>
                <SelectItem value='published'>Published</SelectItem>
                <SelectItem value='archived'>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Visibility</Label>
            <Select
              value={form.visibility}
              onValueChange={v => set('visibility', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select visibility' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='public'>Public</SelectItem>
                <SelectItem value='unlisted'>Unlisted</SelectItem>
                <SelectItem value='private'>Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Toggle */}
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='isFeatured'
            checked={form.isFeatured}
            onCheckedChange={(checked) => setForm(prev => ({ ...prev, isFeatured: checked === true }))}
          />
          <Label htmlFor='isFeatured' className='cursor-pointer'>
            Mark as featured deck
          </Label>
        </div>

        {/* Link Targets Section */}
        <div className='space-y-4 rounded-lg border p-4 bg-muted/50'>
          <div className='flex items-center gap-2'>
            <Link2 className='h-4 w-4' />
            <div>
              <Label className='text-base font-semibold'>Link to Content (Optional)</Label>
              <p className='text-xs text-muted-foreground mt-1'>
                Associate this deck with a course, module, or lesson
              </p>
            </div>
          </div>
          
          <div className='space-y-2'>
            <Label>Link Scope</Label>
            <Select
              value={form.linkScope}
              onValueChange={v => setForm(prev => ({ 
                ...prev, 
                linkScope: v as typeof form.linkScope,
                linkCourseId: '',
                linkModuleId: '',
                linkLessonId: '',
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='standalone'>Standalone (No Link)</SelectItem>
                <SelectItem value='course'>Link to Course</SelectItem>
                <SelectItem value='module'>Link to Module</SelectItem>
                <SelectItem value='lesson'>Link to Lesson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.linkScope !== 'standalone' && (
            <div className='space-y-4 pl-4 border-l-2 border-primary/20'>
              <div className='space-y-2'>
                <Label htmlFor='linkCourseId'>Course</Label>
                <Select
                  value={form.linkCourseId}
                  onValueChange={v => setForm(prev => ({ 
                    ...prev, 
                    linkCourseId: v,
                    linkModuleId: '',
                    linkLessonId: '',
                  }))}
                  disabled={loadingCourses}
                >
                  <SelectTrigger id='linkCourseId'>
                    <SelectValue placeholder={loadingCourses ? 'Loading courses...' : 'Select a course'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                    {availableCourses.length === 0 && !loadingCourses && (
                      <SelectItem value='__none__' disabled>
                        No courses available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {(form.linkScope === 'module' || form.linkScope === 'lesson') && (
                <div className='space-y-2'>
                  <Label htmlFor='linkModuleId'>Module</Label>
                  <Select
                    value={form.linkModuleId}
                    onValueChange={v => setForm(prev => ({ 
                      ...prev, 
                      linkModuleId: v,
                      linkLessonId: '',
                    }))}
                    disabled={!form.linkCourseId || loadingModules}
                  >
                    <SelectTrigger id='linkModuleId'>
                      <SelectValue placeholder={
                        !form.linkCourseId 
                          ? 'Select a course first' 
                          : loadingModules 
                          ? 'Loading modules...' 
                          : 'Select a module'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModules.map(module => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.title}
                        </SelectItem>
                      ))}
                      {availableModules.length === 0 && !loadingModules && form.linkCourseId && (
                        <SelectItem value='__none__' disabled>
                          No modules in this course
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.linkScope === 'lesson' && (
                <div className='space-y-2'>
                  <Label htmlFor='linkLessonId'>Lesson</Label>
                  <Select
                    value={form.linkLessonId}
                    onValueChange={v => set('linkLessonId', v)}
                    disabled={!form.linkModuleId || loadingLessons}
                  >
                    <SelectTrigger id='linkLessonId'>
                      <SelectValue placeholder={
                        !form.linkModuleId 
                          ? 'Select a module first' 
                          : loadingLessons 
                          ? 'Loading lessons...' 
                          : 'Select a lesson'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLessons.map(lesson => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </SelectItem>
                      ))}
                      {availableLessons.length === 0 && !loadingLessons && form.linkModuleId && (
                        <SelectItem value='__none__' disabled>
                          No lessons in this module
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <p className='text-xs text-muted-foreground'>
                💡 Tip: Use the lesson flashcard API route instead for easier lesson linking
              </p>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='tags'>Tags</Label>
            <Input
              id='tags'
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder='Comma separated'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='categories'>Categories</Label>
            <Input
              id='categories'
              value={form.categories}
              onChange={e => set('categories', e.target.value)}
              placeholder='Comma separated'
            />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='minutes'>Est. minutes</Label>
            <Input
              id='minutes'
              type='number'
              min={0}
              value={form.estimatedReviewMinutes}
              onChange={e => set('estimatedReviewMinutes', e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='cover'>Cover image URL</Label>
            <Input
              id='cover'
              value={form.coverImage}
              onChange={e => set('coverImage', e.target.value)}
              placeholder='https://'
            />
          </div>
        </div>
        <div className='flex items-center justify-end gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/flashcards')}
          >
            Cancel
          </Button>
          <Button onClick={create} disabled={creating}>
            {creating ? 'Creating…' : 'Create deck'}
          </Button>
        </div>
      </div>
    </div>
  );
}
