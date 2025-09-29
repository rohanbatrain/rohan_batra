import connectToDatabase from '@/lib/mongodb';
import Character from '@/models/Character';
import JournalVolume from '@/models/JournalVolume';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function CharacterPublicPage({ params }: Params) {
  const { slug } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({
    slug,
    visibility: 'public',
    deletedAt: { $exists: false },
  }).lean()) as any;
  if (!character) return notFound();
  const volumes = (await JournalVolume.find({
    characterId: character._id,
    status: 'published',
    isPrivate: false,
    deletedAt: { $exists: false },
  })
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean()) as any[];

  return (
    <main className='container mx-auto px-4 py-10'>
      <h1 className='text-3xl font-bold'>{character.name}</h1>
      {character.fullName && (
        <p className='text-muted-foreground'>{character.fullName}</p>
      )}
      {character.age != null && <p className='mt-2'>Age: {character.age}</p>}
      <section
        className='prose dark:prose-invert mt-6'
        dangerouslySetInnerHTML={{ __html: character.description || '' }}
      />
      <section
        className='prose dark:prose-invert mt-6'
        dangerouslySetInnerHTML={{ __html: character.personality || '' }}
      />
      <section
        className='prose dark:prose-invert mt-6'
        dangerouslySetInnerHTML={{ __html: character.background || '' }}
      />

      <h2 className='text-2xl font-semibold mt-10 mb-4'>Journals</h2>
      {volumes.length === 0 ? (
        <p className='text-muted-foreground'>No journals published yet.</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {volumes.map(vol => (
            <a
              key={String(vol._id)}
              href={`/characters/${slug}/journals/${vol.slug}`}
              className='border rounded-md overflow-hidden hover:shadow transition'
            >
              {}
              {vol.coverImage ? (
                <img
                  src={vol.coverImage}
                  alt='Cover'
                  className='w-full h-40 object-cover'
                />
              ) : (
                <div className='w-full h-40 bg-gray-100 dark:bg-gray-800' />
              )}
              <div className='p-3'>
                <div className='font-medium'>{vol.title}</div>
                {vol.description && (
                  <div className='text-xs text-muted-foreground line-clamp-2'>
                    {vol.description}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({
    slug,
    visibility: 'public',
    deletedAt: { $exists: false },
  }).lean()) as any;
  if (!character) return { title: 'Character not found' };
  const title = character.seoTitle || `${character.name} — Character Profile`;
  const description =
    character.seoDescription ||
    (character.description
      ? String(character.description)
          .replace(/<[^>]+>/g, '')
          .slice(0, 160)
      : 'Character profile and journals');
  return {
    title,
    description,
    alternates: { canonical: `/characters/${slug}` },
  };
}
