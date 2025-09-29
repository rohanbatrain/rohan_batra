import connectToDatabase from '@/lib/mongodb';
import Character from '@/models/Character';
import JournalVolume from '@/models/JournalVolume';
import CharacterJournal from '@/models/CharacterJournal';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Params {
  params: Promise<{ slug: string; journal: string }>;
}

export default async function CharacterJournalVolumePage({ params }: Params) {
  const { slug, journal } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({
    slug,
    visibility: 'public',
    deletedAt: { $exists: false },
  }).lean()) as any;
  if (!character) return notFound();
  const vol = (await JournalVolume.findOne({
    characterId: character._id,
    slug: journal,
    status: 'published',
    isPrivate: false,
    deletedAt: { $exists: false },
  }).lean()) as any;
  if (!vol) return notFound();
  const entries = (await CharacterJournal.find({
    characterId: character._id,
    journalId: vol._id,
    status: 'published',
    isPrivate: false,
    deletedAt: { $exists: false },
  })
    .sort({ entryDate: -1, createdAt: -1 })
    .lean()) as any[];

  const grouped = entries.reduce((acc: Record<string, any[]>, j: any) => {
    const key = j.entryDate
      ? new Date(j.entryDate).toISOString().slice(0, 10)
      : 'No date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(j);
    return acc;
  }, {});
  const keys = Object.keys(grouped).sort((a, b) => {
    if (a === 'No date') return 1;
    if (b === 'No date') return -1;
    return a < b ? 1 : a > b ? -1 : 0;
  });

  return (
    <main className='container mx-auto px-4 py-10'>
      <div className='mb-6 flex items-center justify-between'>
        <a
          href={`/characters/${slug}`}
          className='text-sm text-blue-600 hover:underline'
        >
          &larr; Back to {character.name}
        </a>
      </div>
      <div className='flex gap-6'>
        {}
        {vol.coverImage ? (
          <img
            src={vol.coverImage}
            alt='Cover'
            className='w-40 h-56 object-cover rounded'
          />
        ) : null}
        <div>
          <h1 className='text-3xl font-bold'>{vol.title}</h1>
          {vol.description ? (
            <p className='text-sm text-muted-foreground mt-1'>
              {vol.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className='mt-8 space-y-6'>
        {keys.length === 0 ? (
          <p className='text-muted-foreground'>No published entries yet.</p>
        ) : (
          keys.map(k => (
            <section key={k}>
              <h2 className='text-sm uppercase tracking-wide text-muted-foreground'>
                {k === 'No date' ? 'No date' : new Date(k).toLocaleDateString()}
              </h2>
              <ul className='mt-3 space-y-2'>
                {grouped[k].map((e: any) => (
                  <li key={e._id.toString()}>
                    <Link
                      href={`/characters/${slug}/journals/${journal}/${e.slug}`}
                      className='text-blue-600 hover:underline'
                    >
                      {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
