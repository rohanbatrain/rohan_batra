import { Metadata } from 'next';
import DeckManagerContent from '@/components/admin/flashcards/DeckManagerContent';

export const metadata: Metadata = {
  title: 'Manage Deck | Admin Dashboard',
  description: 'Edit flashcard deck details and cards.',
};

export default function AdminDeckManagerPage({
  params,
}: {
  params: { deckId: string };
}) {
  return <DeckManagerContent deckId={params.deckId} />;
}
