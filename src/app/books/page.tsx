import { Metadata } from 'next';
import { listPublishedBooks } from '@/lib/book-service';

export const metadata: Metadata = {
  title: 'Books',
  description: 'Published books and stories',
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams?: { genre?: string; page?: string };
}) {
  const genre = searchParams?.genre;
  const page = Number(searchParams?.page || 1);
  const { books, pagination } = await listPublishedBooks({
    genre,
    page,
    limit: 20,
  });

  return (
    <main className='container mx-auto px-4 py-10'>
      <h1 className='text-3xl font-bold mb-6'>Books</h1>
      {books.length === 0 ? (
        <p className='text-gray-600'>No published books yet.</p>
      ) : (
        <ul className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {books.map((b: any) => (
            <li key={b._id} className='border rounded-lg p-4'>
              <a className='block hover:underline' href={`/books/${b.slug}`}>
                {b.title}
              </a>
              {b.description && (
                <p className='text-sm text-gray-600 mt-2 line-clamp-3'>
                  {b.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className='mt-6 text-sm text-gray-500'>
        Page {pagination.page} of {pagination.totalPages}
      </div>
    </main>
  );
}
