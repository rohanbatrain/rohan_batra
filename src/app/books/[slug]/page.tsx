import { notFound } from 'next/navigation';
import { getBookBySlug, listPublishedChapters } from '@/lib/book-service';
import connectToDatabase from '@/lib/mongodb';
import Character from '@/models/Character';

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return notFound();

  const chapters = await listPublishedChapters(String((book as any)._id));

  await connectToDatabase();
  const characters = await Character.find({ bookId: (book as any)._id, visibility: 'public', deletedAt: { $exists: false } })
    .select('name slug role significance')
    .sort({ role: 1, name: 1 })
    .lean();

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{(book as any).title}</h1>
      {(book as any).description && <p className="text-gray-700 mb-6">{(book as any).description}</p>}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Chapters</h2>
        {chapters.length === 0 ? (
          <p className="text-gray-600">No published chapters yet.</p>
        ) : (
          <ol className="list-decimal pl-6 space-y-2">
            {chapters.map((c: any) => (
              <li key={c._id}>
                <a className="hover:underline" href={`/books/${(book as any).slug}/${c.slug}`}>{c.title}</a>
              </li>
            ))}
          </ol>
        )}
      </section>

      {characters.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Characters</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {characters.map((ch: any) => (
              <li key={ch._id} className="border rounded p-3">
                <a className="hover:underline" href={`/characters/${ch.slug}`}>{ch.name}</a>
                {ch.role && <div className="text-xs text-gray-500">{ch.role}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
