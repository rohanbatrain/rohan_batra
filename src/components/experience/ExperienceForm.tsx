'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Experience, EmploymentType } from '@/types/experience';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ContentEditor from '@/components/admin/ContentEditor';
import { Loader2 } from 'lucide-react';

const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  company: z.string().min(1, 'Company is required').max(200),
  companyWebsite: z.string().url('Invalid URL').optional().or(z.literal('')),
  companyLogo: z.string().url('Invalid URL').optional().or(z.literal('')),
  employmentType: z.enum([
    'Full-time',
    'Part-time',
    'Self-employed',
    'Freelance',
    'Contract',
    'Internship',
    'Apprenticeship',
    'Seasonal',
  ]),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  location: z.string().min(1, 'Location is required').max(200),
  description: z.string().min(1, 'Description is required'),
  descriptionFormat: z.enum(['rich-text', 'markdown']).default('rich-text'),
  skills: z.string().optional(), // Comma-separated string
  displayOrder: z.number().int().min(0).optional(),
  published: z.boolean().default(false),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

interface ExperienceFormProps {
  experience?: Experience | null;
  mode: 'create' | 'edit';
}

export default function ExperienceForm({
  experience,
  mode,
}: ExperienceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorFormat, setEditorFormat] = useState<'rich-html' | 'mdx'>(
    experience?.descriptionFormat === 'markdown' ? 'mdx' : 'rich-html'
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema) as any,
    defaultValues: experience
      ? {
          ...experience,
          startDate: new Date(experience.startDate).toISOString().split('T')[0],
          endDate: experience.endDate
            ? new Date(experience.endDate).toISOString().split('T')[0]
            : '',
          skills: experience.skills.join(', '),
        }
      : {
          employmentType: 'Full-time',
          isCurrent: false,
          published: false,
          descriptionFormat: 'rich-text',
        },
  });

  const isCurrent = watch('isCurrent');

  const onSubmit = async (data: ExperienceFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Transform skills from comma-separated string to array
      const skillsArray = data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      // Map editor format to API format
      const descriptionFormat = editorFormat === 'mdx' ? 'markdown' : 'rich-text';

      const payload = {
        ...data,
        skills: skillsArray,
        endDate: data.isCurrent ? null : data.endDate || null,
        descriptionFormat,
      };

      const url =
        mode === 'create'
          ? '/api/admin/experience'
          : `/api/admin/experience/${experience?._id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save experience');
      }

      router.push('/admin/experience');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="e.g., Senior Software Engineer"
          className="mt-1"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Company */}
      <div>
        <Label htmlFor="company">Company *</Label>
        <Input
          id="company"
          {...register('company')}
          placeholder="e.g., Tech Corp"
          className="mt-1"
        />
        {errors.company && (
          <p className="mt-1 text-sm text-destructive">{errors.company.message}</p>
        )}
      </div>

      {/* Company Website */}
      <div>
        <Label htmlFor="companyWebsite">Company Website</Label>
        <Input
          id="companyWebsite"
          type="url"
          {...register('companyWebsite')}
          placeholder="https://company.com"
          className="mt-1"
        />
        {errors.companyWebsite && (
          <p className="mt-1 text-sm text-destructive">
            {errors.companyWebsite.message}
          </p>
        )}
      </div>

      {/* Company Logo URL */}
      <div>
        <Label htmlFor="companyLogo">Company Logo URL</Label>
        <Input
          id="companyLogo"
          type="url"
          {...register('companyLogo')}
          placeholder="https://example.com/logo.png"
          className="mt-1"
        />
        {errors.companyLogo && (
          <p className="mt-1 text-sm text-destructive">
            {errors.companyLogo.message}
          </p>
        )}
      </div>

      {/* Employment Type */}
      <div>
        <Label htmlFor="employmentType">Employment Type *</Label>
        <Select
          onValueChange={(value) =>
            setValue('employmentType', value as EmploymentType)
          }
          defaultValue={experience?.employmentType || 'Full-time'}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Self-employed">Self-employed</SelectItem>
            <SelectItem value="Freelance">Freelance</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
            <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
            <SelectItem value="Seasonal">Seasonal</SelectItem>
          </SelectContent>
        </Select>
        {errors.employmentType && (
          <p className="mt-1 text-sm text-destructive">
            {errors.employmentType.message}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          {...register('location')}
          placeholder="e.g., San Francisco, CA or Remote"
          className="mt-1"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-destructive">{errors.location.message}</p>
        )}
      </div>

      {/* Start Date */}
      <div>
        <Label htmlFor="startDate">Start Date *</Label>
        <Input
          id="startDate"
          type="date"
          {...register('startDate')}
          className="mt-1"
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-destructive">
            {errors.startDate.message}
          </p>
        )}
      </div>

      {/* Current Position Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isCurrent"
          checked={isCurrent}
          onCheckedChange={(checked) => setValue('isCurrent', !!checked)}
        />
        <Label htmlFor="isCurrent" className="cursor-pointer">
          I currently work here
        </Label>
      </div>

      {/* End Date (only if not current) */}
      {!isCurrent && (
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
            className="mt-1"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-destructive">
              {errors.endDate.message}
            </p>
          )}
        </div>
      )}

      {/* Description */}
      <div>
        <Label>Description *</Label>
        <div className="mt-1">
          <ContentEditor
            value={watch('description') || ''}
            onChange={(content: string) => setValue('description', content)}
            onFormatChange={setEditorFormat}
            editorType={editorFormat}
            showPreview={true}
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Skills */}
      <div>
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input
          id="skills"
          {...register('skills')}
          placeholder="TypeScript, React, Node.js"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Enter skills separated by commas
        </p>
      </div>

      {/* Display Order */}
      <div>
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input
          id="displayOrder"
          type="number"
          min="0"
          {...register('displayOrder', { valueAsNumber: true })}
          placeholder="0"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Lower numbers appear first. Leave empty for auto-assignment.
        </p>
      </div>

      {/* Published Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="published"
          defaultChecked={experience?.published || false}
          onCheckedChange={(checked) => setValue('published', !!checked)}
        />
        <Label htmlFor="published" className="cursor-pointer">
          Published (visible on public pages)
        </Label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Experience' : 'Update Experience'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
