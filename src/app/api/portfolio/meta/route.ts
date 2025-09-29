import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ProjectModel from '@/models/Project';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const baseMatch = category
      ? { status: 'published', $or: [{ category }, { categories: category }] }
      : { status: 'published' };
    const [categoriesPrimary, categoriesExtra, technologies, tags] =
      await Promise.all([
        ProjectModel.distinct('category', { status: 'published' }) as Promise<
          string[]
        >,
        ProjectModel.distinct('categories', { status: 'published' }) as Promise<
          string[]
        >,
        ProjectModel.distinct('technologies', baseMatch) as Promise<string[]>,
        ProjectModel.distinct('tags', baseMatch) as Promise<string[]>,
      ]);

    const clean = (arr: string[]) =>
      Array.from(new Set((arr || []).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      );

    return NextResponse.json({
      success: true,
      data: {
        categories: clean([
          ...(categoriesPrimary || []),
          ...(categoriesExtra || []),
        ]),
        technologies: clean(technologies),
        tags: clean(tags),
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio meta:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio meta' },
      { status: 500 }
    );
  }
}
