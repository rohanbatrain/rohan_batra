import connectToDatabase from '@/lib/mongodb';
import Character from '@/models/Character';
import CharacterJournal from '@/models/CharacterJournal';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function CharacterPublicPage({ params }: Params) {
  const { slug } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({ slug, visibility: 'public', deletedAt: { $exists: false } }).lean()) as any;
  if (!character) return notFound();
  const journals = (await CharacterJournal.find({ characterId: character._id, status: 'published', isPrivate: false, deletedAt: { $exists: false } })
    .sort({ publishedAt: -1 })
    .lean()) as any[];

  return (
    <main className='container mx-auto px-4 py-10'>
      <h1 className='text-3xl font-bold'>{character.name}</h1>
      {character.fullName && <p className='text-muted-foreground'>{character.fullName}</p>}
      {character.age != null && <p className='mt-2'>Age: {character.age}</p>}
      <section className='prose dark:prose-invert mt-6' dangerouslySetInnerHTML={{ __html: character.description || '' }} />
      <section className='prose dark:prose-invert mt-6' dangerouslySetInnerHTML={{ __html: character.personality || '' }} />
      <section className='prose dark:prose-invert mt-6' dangerouslySetInnerHTML={{ __html: character.background || '' }} />

      <h2 className='text-2xl font-semibold mt-10 mb-4'>Journals</h2>
      {!journals.length ? (
        <p className='text-muted-foreground'>No public journal entries yet.</p>
      ) : (
        <ul className='space-y-3'>
          {journals.map(j => (
            <li key={(j._id as any).toString()}>
              <a className='text-blue-600 hover:underline' href={`/characters/${slug}/journals/${j.slug}`}>{j.title}</a>
              {j.publishedAt && (
                <span className='text-sm text-muted-foreground ml-2'>
                  {new Date(j.publishedAt).toLocaleDateString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({ slug, visibility: 'public', deletedAt: { $exists: false } }).lean()) as any;
  if (!character) return { title: 'Character not found' };
  const title = character.seoTitle || `${character.name} — Character Profile`;
  const description = character.seoDescription || (character.description ? String(character.description).replace(/<[^>]+>/g, '').slice(0, 160) : 'Character profile and journals');
  return { title, description, alternates: { canonical: `/characters/${slug}` } };
}
