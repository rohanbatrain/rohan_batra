import { Metadata } from 'next';
import CardCreateContent from '@/components/admin/flashcards/CardCreateContent';

export const metadata: Metadata = {
  title: 'Create Card | Admin Dashboard',
  description: 'Create a new flashcard card.',
};

export default async function AdminCardCreatePage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  return <CardCreateContent deckId={deckId} />;
}
