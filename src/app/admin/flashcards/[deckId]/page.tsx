import { Metadata } from 'next';
import DeckManagerContent from '@/components/admin/flashcards/DeckManagerContent';

export const metadata: Metadata = {
  title: 'Manage Deck | Admin Dashboard',
  description: 'Edit flashcard deck details and cards.',
};

export default async function AdminDeckManagerPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  return <DeckManagerContent deckId={deckId} />;
}
