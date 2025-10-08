'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2 } from 'lucide-react';

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

interface FlashcardViewerProps {
  cards: Flashcard[];
  onReview: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => Promise<void>;
  onComplete: () => void;
}

export function FlashcardViewer({ cards, onReview, onComplete }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (reviewing) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          setIsFlipped(!isFlipped);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (isFlipped) handleNext();
          break;
        case '1':
          if (isFlipped) handleReview('again');
          break;
        case '2':
          if (isFlipped) handleReview('hard');
          break;
        case '3':
          if (isFlipped) handleReview('good');
          break;
        case '4':
          if (isFlipped) handleReview('easy');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentIndex, reviewing]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleReview = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!isFlipped || reviewing) return;

    setReviewing(true);
    try {
      await onReview(currentCard.id, rating);
      
      // Move to next card or complete
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('Failed to save review. Please try again.');
    } finally {
      setReviewing(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No cards to review</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative perspective-1000">
        <div
          className={`relative w-full min-h-[400px] transition-transform duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Front of card */}
          <div
            className={`absolute inset-0 bg-card border-2 border-border rounded-2xl shadow-xl p-8 backface-hidden ${
              isFlipped ? 'invisible' : 'visible'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  Question
                </span>
                {currentCard.tags.length > 0 && (
                  <div className="flex gap-1">
                    {currentCard.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-muted text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl md:text-3xl font-medium text-center">
                  {currentCard.prompt}
                </p>
              </div>

              {currentCard.hint && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 Hint: {currentCard.hint}
                  </p>
                </div>
              )}

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Click or press Space to flip
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div
            className={`absolute inset-0 bg-card border-2 border-primary rounded-2xl shadow-xl p-8 backface-hidden rotate-y-180 ${
              isFlipped ? 'visible' : 'invisible'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  Answer
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <p className="text-xl md:text-2xl font-medium text-center">
                  {currentCard.response}
                </p>

                {currentCard.explanation && (
                  <div className="w-full p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      📚 {currentCard.explanation}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-center text-sm font-medium">How well did you know this?</p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview('again');
                    }}
                    disabled={reviewing}
                    className="px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <div className="text-xs mb-1">1</div>
                    Again
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview('hard');
                    }}
                    disabled={reviewing}
                    className="px-4 py-3 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <div className="text-xs mb-1">2</div>
                    Hard
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview('good');
                    }}
                    disabled={reviewing}
                    className="px-4 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <div className="text-xs mb-1">3</div>
                    Good
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReview('easy');
                    }}
                    disabled={reviewing}
                    className="px-4 py-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <div className="text-xs mb-1">4</div>
                    Easy
                  </button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Use number keys 1-4 for quick review
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Restart
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1 || !isFlipped}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Shortcuts Helper */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm font-medium mb-2">Keyboard Shortcuts:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
          <div><kbd className="px-1.5 py-0.5 bg-background rounded">Space</kbd> Flip card</div>
          <div><kbd className="px-1.5 py-0.5 bg-background rounded">←</kbd> Previous</div>
          <div><kbd className="px-1.5 py-0.5 bg-background rounded">→</kbd> Next</div>
          <div><kbd className="px-1.5 py-0.5 bg-background rounded">1-4</kbd> Rate card</div>
        </div>
      </div>
    </div>
  );
}
