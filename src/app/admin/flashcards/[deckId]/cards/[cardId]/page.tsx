import { Metadata } from 'next';
import CardEditContent from '@/components/admin/flashcards/CardEditContent';

export const metadata: Metadata = {
  title: 'Edit Card | Admin Dashboard',
  description: 'Edit flashcard card details.',
};

export default async function AdminCardEditPage({
  params,
}: {
  params: Promise<{ deckId: string; cardId: string }>;
}) {
  const { deckId, cardId } = await params;
  return <CardEditContent deckId={deckId} cardId={cardId} />;
}
