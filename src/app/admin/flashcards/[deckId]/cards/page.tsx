import { Metadata } from 'next';
import CardListContent from '@/components/admin/flashcards/CardListContent';

export const metadata: Metadata = {
  title: 'Manage Cards | Admin Dashboard',
  description: 'View and manage flashcard cards.',
};

export default async function AdminCardListPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  return <CardListContent deckId={deckId} />;
}
