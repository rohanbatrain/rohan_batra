'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Experience } from '@/types/experience';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, GripVertical, Search, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableRow({ experience, onEdit, onDelete }: { experience: Experience; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: experience._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{experience.title}</TableCell>
      <TableCell>{experience.company}</TableCell>
      <TableCell>{experience.employmentType}</TableCell>
      <TableCell>{experience.dateRange}</TableCell>
      <TableCell>
        <Badge variant={experience.published ? 'default' : 'secondary'}>
          {experience.published ? 'Published' : 'Draft'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminExperienceListClient() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchExperiences();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [experiences, search, publishedFilter]);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/admin/experience?limit=100');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setExperiences(data.experiences || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...experiences];

    if (search) {
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(search.toLowerCase()) ||
          exp.company.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (publishedFilter !== 'all') {
      const isPublished = publishedFilter === 'published';
      filtered = filtered.filter((exp) => exp.published === isPublished);
    }

    setFilteredExperiences(filtered);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = filteredExperiences.findIndex((exp) => exp._id === active.id);
      const newIndex = filteredExperiences.findIndex((exp) => exp._id === over.id);

      const reordered = arrayMove(filteredExperiences, oldIndex, newIndex);
      setFilteredExperiences(reordered);

      // Update display order on server
      setSaving(true);
      try {
        const updates = reordered.map((exp, index) => ({
          id: exp._id,
          displayOrder: index,
        }));

        const response = await fetch('/api/admin/experience/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Failed to reorder');
      } catch (error) {
        console.error('Error reordering:', error);
        fetchExperiences(); // Revert on error
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      const response = await fetch(`/api/admin/experience/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Experiences</h1>
          <p className="mt-2 text-muted-foreground">
            Add and manage your professional experiences
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/experience/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={publishedFilter} onValueChange={setPublishedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {saving && (
        <div className="rounded-md bg-muted p-2 text-center text-sm">
          Saving new order...
        </div>
      )}

      {filteredExperiences.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {search || publishedFilter !== 'all'
              ? 'No experiences match your filters'
              : 'No experiences yet. Create your first one!'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={filteredExperiences.map((exp) => exp._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredExperiences.map((experience) => (
                    <SortableRow
                      key={experience._id}
                      experience={experience}
                      onEdit={() => router.push(`/admin/experience/${experience._id}/edit`)}
                      onDelete={() => handleDelete(experience._id)}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </div>
      )}
    </div>
  );
}
