'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface FlashcardScheduling {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
}

interface Flashcard {
  id: string;
  deckId: string;
  type: 'standard' | 'cloze' | 'image';
  prompt: string;
  response: string;
  hint?: string;
  explanation?: string;
  tags: string[];
  scheduling: FlashcardScheduling;
}

interface StudySession {
  deck: {
    id: string;
    title: string;
    subtitle?: string;
    cardCount: number;
  };
  scope: string;
  totalCards: number;
  dueCards: number;
  cards: Flashcard[];
}

export default function StudyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const scope = (searchParams?.get('scope') as 'course' | 'module' | 'lesson') || null;
  const courseId = searchParams?.get('courseId') || null;
  const moduleId = searchParams?.get('moduleId') || null;
  const lessonId = searchParams?.get('lessonId') || null;

  const [session, setSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Fetch cards on mount
  useEffect(() => {
    fetchCards();
  }, [scope, courseId, moduleId, lessonId]);

  const fetchCards = async () => {
    if (!scope || !courseId) {
      setError('Invalid study session parameters');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        scope,
        courseId,
        ...(moduleId && { moduleId }),
        ...(lessonId && { lessonId }),
      });

      const response = await fetch(`/api/flashcards/study?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cards');
      }

      const data: StudySession = await response.json();
      
      if (data.cards.length === 0) {
        setError('No cards available for review at this time. Great job staying on top of your reviews!');
      } else {
        setSession(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch cards:', err);
      setError(err.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    try {
      const response = await fetch(`/api/flashcards/cards/${cardId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save review');
      }

      const result = await response.json();
      console.log(`Card reviewed: ${result.message}`);
      
      setReviewedCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to save review:', err);
      throw err;
    }
  };

  const handleComplete = () => {
    setCompleted(true);
  };

  const getBackLink = () => {
    if (lessonId) {
      return `/courses/${courseId}/lesson/${lessonId}`;
    }
    if (moduleId) {
      return `/courses/${courseId}/module/${moduleId}`;
    }
    return `/courses/${courseId}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-xl shadow-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold">Unable to Load Cards</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchCards}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <Link
              href={getBackLink()}
              className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Completion state
  if (completed || (session && reviewedCount >= session.cards.length)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-xl shadow-lg p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Study Session Complete!</h2>
            <p className="text-muted-foreground">
              You reviewed <strong>{reviewedCount}</strong> card{reviewedCount !== 1 ? 's' : ''}
            </p>
          </div>

          {session && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{session.totalCards}</div>
                <div className="text-xs text-muted-foreground">Total Cards</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{reviewedCount}</div>
                <div className="text-xs text-muted-foreground">Reviewed</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                setCompleted(false);
                setReviewedCount(0);
                fetchCards();
              }}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Study Again
            </button>
            <Link
              href={getBackLink()}
              className="w-full px-6 py-3 border rounded-lg hover:bg-muted transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lesson
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Study session active
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={getBackLink()}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">{session.deck.title}</h1>
                {session.deck.subtitle && (
                  <p className="text-sm text-muted-foreground">{session.deck.subtitle}</p>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{session.dueCards}</span> due / {session.totalCards} total
            </div>
          </div>
        </div>
      </header>

      {/* Flashcard Viewer */}
      <main className="container mx-auto px-4 py-8">
        <FlashcardViewer
          cards={session.cards}
          onReview={handleReview}
          onComplete={handleComplete}
        />
      </main>

      {/* Footer hint */}
      <footer className="border-t bg-card/50 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Reviews are saved automatically. You can safely close this page at any time.</p>
        </div>
      </footer>
    </div>
  );
}
