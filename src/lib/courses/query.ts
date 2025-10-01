import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import { FilterQuery } from 'mongoose';

export type CourseIndexQuery = {
  page?: number;
  limit?: number;
  q?: string;
  difficulty?: string | string[];
  tags?: string | string[];
  sort?: 'newest' | 'az';
};

export function parseCourseIndexQuery(
  sp: Record<string, string | string[] | undefined>
): CourseIndexQuery {
  const page = sp.page ? Math.max(parseInt(String(sp.page), 10) || 1, 1) : 1;
  const limitRaw = sp.limit ? parseInt(String(sp.limit), 10) || 24 : 24;
  const limit = Math.min(Math.max(limitRaw, 1), 48);
  const q = typeof sp.q === 'string' ? sp.q.trim() : undefined;
  const sort = sp.sort === 'az' ? 'az' : 'newest';

  const difficulty = sp.difficulty
    ? Array.isArray(sp.difficulty)
      ? sp.difficulty
      : String(sp.difficulty)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
    : undefined;
  const tags = sp.tags
    ? Array.isArray(sp.tags)
      ? sp.tags
      : String(sp.tags)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
    : undefined;

  return { page, limit, q, sort, difficulty, tags };
}

export async function listPublicCourses(params: CourseIndexQuery) {
  await connectToDatabase();

  const filter: FilterQuery<any> = {
    status: 'published',
    visibility: 'public',
  };
  if (params.q) {
    const regex = new RegExp(params.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: regex }, { summary: regex }, { subtitle: regex }];
  }
  if (params.difficulty && (params.difficulty as string[]).length) {
    filter.difficulty = { $in: params.difficulty } as any;
  }
  if (params.tags && (params.tags as string[]).length) {
    filter.tags = { $in: params.tags } as any;
  }

  const sortStr = params.sort === 'az' ? 'title' : '-publishedAt';
  const page = params.page || 1;
  const limit = params.limit || 24;
  const skip = (page - 1) * limit;

  const projection =
    'slug title subtitle summary heroImage difficulty tags estimatedDurationMinutes lessonCount updatedAt publishedAt';

  const [items, total] = await Promise.all([
    Course.find(filter)
      .select(projection)
      .sort(sortStr)
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
