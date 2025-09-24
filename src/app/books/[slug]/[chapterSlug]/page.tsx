import { notFound } from 'next/navigation';
import { getChapterBySlugs } from '@/lib/book-service';

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; chapterSlug: string }> }) {
  const { slug, chapterSlug } = await params;
  const result = await getChapterBySlugs(slug, chapterSlug);
  if (!result) return notFound();
  const { book, chapter } = result as any;

  return (
    <main className="container mx-auto px-4 py-10">
      <nav className="mb-4 text-sm text-gray-500">
        <a className="hover:underline" href={`/books/${book.slug}`}>{book.title}</a> / {chapter.title}
      </nav>
      <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
      <article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: chapter.content }} />
    </main>
  );
}
