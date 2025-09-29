import connectToDatabase from '@/lib/mongodb';
import Character from '@/models/Character';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Characters',
  description: 'Explore public character profiles and their journals',
};

export default async function CharactersIndex({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const q = (sp.q as string) || '';
  await connectToDatabase();
  const filter: any = { visibility: 'public', deletedAt: { $exists: false } };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { fullName: { $regex: q, $options: 'i' } },
      { tags: { $in: [q] } },
    ];
  }
  const items = (await Character.find(filter)
    .sort({ featured: -1, createdAt: -1 })
    .select('name fullName slug role significance createdAt')
    .lean()) as any[];

  return (
    <main className='container mx-auto px-4 py-10'>
      <h1 className='text-3xl font-bold mb-6'>Characters</h1>
      <form action='/characters' method='GET' className='mb-6'>
        <input
          type='text'
          name='q'
          defaultValue={q}
          placeholder='Search characters...'
          className='w-full max-w-lg px-3 py-2 border rounded-md bg-white dark:bg-gray-900'
        />
      </form>
      {!items.length ? (
        <p className='text-muted-foreground'>No characters found.</p>
      ) : (
        <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {items.map(c => (
            <li
              key={c.slug}
              className='border rounded-lg p-4 hover:shadow-sm transition'
            >
              <a
                href={`/characters/${c.slug}`}
                className='text-lg font-semibold text-blue-600 hover:underline'
              >
                {c.name}
              </a>
              {c.fullName && (
                <p className='text-sm text-muted-foreground'>{c.fullName}</p>
              )}
              <p className='text-xs text-muted-foreground mt-1 capitalize'>
                {c.role} • {c.significance}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
