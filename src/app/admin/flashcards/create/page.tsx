import { Metadata } from 'next';
import DeckCreateContent from '@/components/admin/flashcards/DeckCreateContent';

export const metadata: Metadata = {
  title: 'Create Deck | Admin',
  description: 'Create a new flashcard deck and then add cards.',
};

export default function CreateDeckPage() {
  return <DeckCreateContent />;
}
