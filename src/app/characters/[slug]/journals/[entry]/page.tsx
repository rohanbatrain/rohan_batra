import connectToDatabase from '@/lib/mongodb';
import Character from '@/models/Character';
import CharacterJournal from '@/models/CharacterJournal';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Params {
  params: Promise<{ slug: string; entry: string }>;
}

export default async function CharacterJournalEntryPage({ params }: Params) {
  const { slug, entry } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({ slug, visibility: 'public', deletedAt: { $exists: false } }).lean()) as any;
  if (!character) return notFound();
  const journal = (await CharacterJournal.findOne({ characterId: character._id, slug: entry, status: 'published', isPrivate: false, deletedAt: { $exists: false } }).lean()) as any;
  if (!journal) return notFound();

  return (
    <main className='container mx-auto px-4 py-10'>
      <div className='mb-6'>
        <a href={`/characters/${slug}`} className='text-sm text-blue-600 hover:underline'>&larr; Back to {character.name}</a>
      </div>
      <h1 className='text-3xl font-bold'>{journal.title}</h1>
      {journal.publishedAt && (
        <p className='text-sm text-muted-foreground mt-1'>{new Date(journal.publishedAt as any).toLocaleString()}</p>
      )}
      <article className='prose dark:prose-invert mt-8' dangerouslySetInnerHTML={{ __html: (journal as any).content || '' }} />
    </main>
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, entry } = await params;
  await connectToDatabase();
  const character = (await Character.findOne({ slug, visibility: 'public', deletedAt: { $exists: false } }).lean()) as any;
  if (!character) return { title: 'Journal — Not found' };
  const journal = (await CharacterJournal.findOne({ characterId: character._id, slug: entry, status: 'published', isPrivate: false, deletedAt: { $exists: false } }).lean()) as any;
  if (!journal) return { title: 'Journal — Not found' };
  const title = journal.seoTitle || `${journal.title} — ${character.name}`;
  const description = journal.seoDescription || (journal.content ? String(journal.content).replace(/<[^>]+>/g, '').slice(0, 160) : 'Character journal entry');
  return { title, description, alternates: { canonical: `/characters/${slug}/journals/${entry}` } };
}
