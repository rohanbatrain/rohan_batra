import { Metadata } from 'next';
import FlashcardsManagement from '@/components/admin/flashcards/FlashcardsManagement';

export const metadata: Metadata = {
  title: 'Flashcards | Admin Dashboard',
  description: 'Manage flashcard decks and keep study materials up to date.',
};

export default function AdminFlashcardsPage() {
  return <FlashcardsManagement />;
}
