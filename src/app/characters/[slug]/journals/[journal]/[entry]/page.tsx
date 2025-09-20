import connectToDatabase from '@/lib/mongodb';
import Character from '@/models/Character';
import JournalVolume from '@/models/JournalVolume';
import CharacterJournal from '@/models/CharacterJournal';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Params { params: Promise<{ slug: string; journal: string; entry: string }>; }

export default async function CharacterJournalEntryPage({ params }: Params) {
  const { slug, journal, entry } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({ slug, visibility: 'public', deletedAt: { $exists: false } }).lean()) as any;
  if (!character) return notFound();
  const vol = (await JournalVolume.findOne({ characterId: character._id, slug: journal, status: 'published', isPrivate: false, deletedAt: { $exists: false } }).lean()) as any;
  if (!vol) return notFound();
  const doc = (await CharacterJournal.findOne({ characterId: character._id, journalId: vol._id, slug: entry, status: 'published', isPrivate: false, deletedAt: { $exists: false } }).lean()) as any;
  if (!doc) return notFound();

  return (
    <main className='container mx-auto px-4 py-10'>
      <div className='mb-6'>
        <a href={`/characters/${slug}/journals/${journal}`} className='text-sm text-blue-600 hover:underline'>&larr; Back to {vol.title}</a>
      </div>
      <h1 className='text-3xl font-bold'>{doc.title}</h1>
      {doc.publishedAt && (
        <p className='text-sm text-muted-foreground mt-1'>{new Date(doc.publishedAt as any).toLocaleString()}</p>
      )}
      <article className='prose dark:prose-invert mt-8' dangerouslySetInnerHTML={{ __html: (doc as any).content || '' }} />
    </main>
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, journal, entry } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({ slug, visibility: 'public', deletedAt: { $exists: false } }).lean()) as any;
  if (!character) return { title: 'Journal — Not found' };
  const vol = (await JournalVolume.findOne({ characterId: character._id, slug: journal, status: 'published', isPrivate: false, deletedAt: { $exists: false } }).lean()) as any;
  if (!vol) return { title: 'Journal — Not found' };
  const doc = (await CharacterJournal.findOne({ characterId: character._id, journalId: vol._id, slug: entry, status: 'published', isPrivate: false, deletedAt: { $exists: false } }).lean()) as any;
  if (!doc) return { title: 'Journal — Not found' };
  const title = doc.seoTitle || `${doc.title} — ${character.name}`;
  const description = doc.seoDescription || (doc.content ? String(doc.content).replace(/<[^>]+>/g, '').slice(0, 160) : 'Character journal entry');
  return { title, description, alternates: { canonical: `/characters/${slug}/journals/${journal}/${entry}` } };
}
