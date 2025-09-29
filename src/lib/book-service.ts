import connectToDatabase from '@/lib/mongodb';
import BookModel from '@/models/Book';
import ChapterModel from '@/models/Chapter';

export async function listPublishedBooks({
  language,
  genre,
  page = 1,
  limit = 20,
}: {
  language?: string;
  genre?: string;
  page?: number;
  limit?: number;
}) {
  await connectToDatabase();
  const filter: Record<string, unknown> = { visibility: 'public' };
  if (language) filter['language'] = language;
  if (genre) filter['genre'] = new RegExp(genre, 'i');

  const skip = (page - 1) * limit;

  const [books, total] = await Promise.all([
    BookModel.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BookModel.countDocuments(filter),
  ]);

  return {
    books,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getBookBySlug(slug: string) {
  await connectToDatabase();
  const book = await BookModel.findOne({ slug, visibility: 'public' }).lean();
  return book || null;
}

export async function listPublishedChapters(bookId: string) {
  await connectToDatabase();
  const chapters = await ChapterModel.find({ bookId })
    .sort({ orderIndex: 1 })
    .lean();
  return chapters.filter((c: any) => c.status === 'complete');
}

export async function getChapterBySlugs(bookSlug: string, chapterSlug: string) {
  await connectToDatabase();
  const book = await BookModel.findOne({
    slug: bookSlug,
    visibility: 'public',
  }).lean();
  if (!book) return null;
  // cast book to any to access _id safely from the lean() result
  const bookAny: any = book;
  const chapter = (await ChapterModel.findOne({
    bookId: bookAny._id,
    slug: chapterSlug,
  }).lean()) as any | null;
  if (!chapter || (chapter as any).status !== 'complete') return null;
  return { book, chapter };
}
