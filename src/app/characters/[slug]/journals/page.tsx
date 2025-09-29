import connectToDatabase from '@/lib/mongodb';
import Character from '@/models/Character';
import JournalVolume from '@/models/JournalVolume';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CharacterJournalsIndex({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({
    slug,
    visibility: 'public',
    deletedAt: { $exists: false },
  }).lean()) as any;
  if (!character) return notFound();
  const journals = (await JournalVolume.find({
    characterId: character._id,
    status: 'published',
    isPrivate: false,
    deletedAt: { $exists: false },
  })
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean()) as any[];

  return (
    <main className='container mx-auto px-4 py-10'>
      <div className='mb-6'>
        <a
          href={`/characters/${slug}`}
          className='text-sm text-blue-600 hover:underline'
        >
          &larr; Back to {character.name}
        </a>
      </div>
      <h1 className='text-3xl font-bold'>Journals</h1>
      {!journals.length ? (
        <p className='mt-6 text-muted-foreground'>No journals published yet.</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
          {journals.map((j: any) => (
            <Link
              key={j._id.toString()}
              href={`/characters/${slug}/journals/${j.slug}`}
              className='border rounded-md overflow-hidden hover:shadow transition'
            >
              {}
              {j.coverImage ? (
                <img
                  src={j.coverImage}
                  alt='Cover'
                  className='w-full h-40 object-cover'
                />
              ) : (
                <div className='w-full h-40 bg-gray-100 dark:bg-gray-800' />
              )}
              <div className='p-3'>
                <div className='font-medium'>{j.title}</div>
                <div className='text-xs text-muted-foreground'>
                  {j.description || '—'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
