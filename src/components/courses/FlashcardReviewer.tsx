'use client';

import { useState, useEffect, useMemo } from 'react';

interface FlashcardData {
  id: string;
  type: 'basic' | 'cloze' | 'qa' | 'image';
  prompt: {
    text?: string | null;
    richText?: string | null;
    media?: {
      imageUrls?: string[];
      audioUrl?: string | null;
    };
  };
  response: {
    text?: string | null;
    richText?: string | null;
    media?: {
      imageUrls?: string[];
      audioUrl?: string | null;
    };
  };
  hint?: string;
  explanation?: string;
  tags?: string[];
}

interface FlashcardReviewerProps {
  deckId: string;
  deckTitle: string;
  cards: FlashcardData[];
}

type StudyMode = 'all' | 'difficult' | 'notReviewed';

export default function FlashcardReviewer({
  deckId,
  deckTitle,
  cards,
}: FlashcardReviewerProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());
  const [difficulty, setDifficulty] = useState<Record<number, 'easy' | 'medium' | 'hard'>>({});
  const [isShuffled, setIsShuffled] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Shuffle cards when needed
  const displayCards = useMemo(() => {
    let filtered = [...cards];

    // Filter by study mode
    if (studyMode === 'difficult') {
      filtered = filtered.filter((_, idx) => difficulty[idx] === 'hard' || difficulty[idx] === 'medium');
    } else if (studyMode === 'notReviewed') {
      filtered = filtered.filter((_, idx) => !reviewedCards.has(idx));
    }

    // Shuffle if enabled
    if (isShuffled) {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }

    return filtered;
  }, [cards, isShuffled, studyMode, difficulty, reviewedCards]);

  const currentCard = displayCards[currentCardIndex];
  const totalCards = displayCards.length;
  const progress = totalCards > 0 ? Math.round(((currentCardIndex + 1) / totalCards) * 100) : 0;

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((i) => i + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((i) => i - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setReviewedCards((prev) => new Set(prev).add(currentCardIndex));
    }
  };

  const handleDifficulty = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty((prev) => ({ ...prev, [currentCardIndex]: level }));
    if (autoAdvance) {
      setTimeout(handleNext, 300);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleReset = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setReviewedCards(new Set());
    setDifficulty({});
    setIsShuffled(false);
    setStudyMode('all');
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCardIndex, isFlipped]);

  if (reviewedCards.size === totalCards && isFlipped) {
    // Review complete
    return (
      <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <div className='text-center'>
          <div className='mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'>
            <svg className='h-10 w-10' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>

          <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
            Review Complete!
          </h2>

          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            You've reviewed all {totalCards} flashcards in this deck.
          </p>

          <div className='mb-6 flex items-center justify-center gap-6'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {Object.values(difficulty).filter((d) => d === 'easy').length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>Easy</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                {Object.values(difficulty).filter((d) => d === 'medium').length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>Medium</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                {Object.values(difficulty).filter((d) => d === 'hard').length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>Hard</div>
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={handleReset}
              className='rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
            >
              Review Again
            </button>
            {Object.values(difficulty).filter((d) => d === 'hard' || d === 'medium').length > 0 && (
              <button
                onClick={() => {
                  setStudyMode('difficult');
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setReviewedCards(new Set());
                }}
                className='rounded-lg border border-red-600 bg-white px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors'
              >
                Study Difficult Cards
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Settings Panel */}
      <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>Study Settings</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors'
          >
            <svg className={`h-5 w-5 transition-transform ${showSettings ? 'rotate-180' : ''}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </button>
        </div>

        {showSettings && (
          <div className='mt-4 space-y-4'>
            {/* Study Mode */}
            <div>
              <label className='mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300'>Study Mode</label>
              <div className='grid grid-cols-3 gap-2'>
                <button
                  onClick={() => {
                    setStudyMode('all');
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    studyMode === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  All Cards
                </button>
                <button
                  onClick={() => {
                    setStudyMode('difficult');
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    studyMode === 'difficult'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  disabled={!Object.values(difficulty).some(d => d === 'hard' || d === 'medium')}
                >
                  Difficult
                </button>
                <button
                  onClick={() => {
                    setStudyMode('notReviewed');
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    studyMode === 'notReviewed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Not Reviewed
                </button>
              </div>
            </div>

            {/* Options */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='shuffle'
                  checked={isShuffled}
                  onChange={toggleShuffle}
                  className='h-4 w-4 rounded text-blue-600 focus:ring-blue-500'
                />
                <label htmlFor='shuffle' className='text-xs text-gray-700 dark:text-gray-300'>
                  🔀 Shuffle cards
                </label>
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='autoAdvance'
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className='h-4 w-4 rounded text-blue-600 focus:ring-blue-500'
                />
                <label htmlFor='autoAdvance' className='text-xs text-gray-700 dark:text-gray-300'>
                  ⚡ Auto-advance
                </label>
              </div>

              <button
                onClick={handleReset}
                className='text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors'
              >
                🔄 Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div className='mb-2 flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2'>
            <span className='font-medium text-gray-700 dark:text-gray-300'>
              Card {currentCardIndex + 1} of {totalCards}
            </span>
            {studyMode !== 'all' && (
              <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                {studyMode === 'difficult' ? '🔥 Difficult' : '📝 Not Reviewed'}
              </span>
            )}
          </div>
          <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
            <span>{reviewedCards.size} reviewed</span>
            <span>•</span>
            <span>{progress}%</span>
          </div>
        </div>
        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className='h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className='group relative h-96 cursor-pointer'
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        {/* Flip hint */}
        {!isFlipped && (
          <div className='absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-blue-900/30 dark:text-blue-300'>
            <span>Click to flip</span>
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
            </svg>
          </div>
        )}

        <div
          className={`relative h-full w-full transition-all duration-500 ease-out`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of card */}
          <div
            className='absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50 p-8 shadow-xl dark:border-blue-800 dark:from-gray-800 dark:to-gray-900'
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className='mb-4 text-sm font-medium text-blue-600 dark:text-blue-400'>
              Question
            </div>

            {currentCard.prompt.media?.imageUrls?.[0] && (
              <img
                src={currentCard.prompt.media.imageUrls[0]}
                alt='Prompt'
                className='mb-4 max-h-48 rounded-lg object-contain'
              />
            )}

            <div className='text-center text-2xl font-semibold text-gray-900 dark:text-white'>
              {currentCard.prompt.text || currentCard.prompt.richText}
            </div>

            <div className='mt-8 text-sm text-gray-500 dark:text-gray-400'>
              Click to reveal answer
            </div>
          </div>

          {/* Back of card */}
          <div
            className='absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-8 shadow-xl dark:border-purple-800 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20'
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className='mb-4 text-sm font-medium text-purple-600 dark:text-purple-400'>
              Answer
            </div>

            {currentCard.response.media?.imageUrls?.[0] && (
              <img
                src={currentCard.response.media.imageUrls[0]}
                alt='Response'
                className='mb-4 max-h-48 rounded-lg object-contain'
              />
            )}

            <div className='text-center text-2xl font-semibold text-gray-900 dark:text-white'>
              {currentCard.response.text || currentCard.response.richText}
            </div>

            {currentCard.explanation && (
              <div className='mt-4 max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
                {currentCard.explanation}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hint */}
      {currentCard.hint && !isFlipped && (
        <div className='text-center'>
          {showHint ? (
            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'>
              💡 {currentCard.hint}
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHint(true);
              }}
              className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
            >
              Show Hint
            </button>
          )}
        </div>
      )}

      {/* Difficulty Rating (after flipping) */}
      {isFlipped && (
        <div className='rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300'>
            How well did you know this? {difficulty[currentCardIndex] && (
              <span className={`ml-2 text-xs ${
                difficulty[currentCardIndex] === 'easy'
                  ? 'text-green-600 dark:text-green-400'
                  : difficulty[currentCardIndex] === 'medium'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
              }`}>
                ({difficulty[currentCardIndex]})
              </span>
            )}
          </div>
          <div className='grid grid-cols-3 gap-2'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDifficulty('easy');
              }}
              className={`group rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                difficulty[currentCardIndex] === 'easy'
                  ? 'border-green-500 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'border-green-300 bg-white text-green-600 hover:bg-green-50 dark:border-green-700 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-green-900/20'
              }`}
            >
              <div className='mb-1 text-xl'>😊</div>
              <div>Easy</div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDifficulty('medium');
              }}
              className={`group rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                difficulty[currentCardIndex] === 'medium'
                  ? 'border-yellow-500 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'border-yellow-300 bg-white text-yellow-600 hover:bg-yellow-50 dark:border-yellow-700 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
              }`}
            >
              <div className='mb-1 text-xl'>😐</div>
              <div>Medium</div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDifficulty('hard');
              }}
              className={`group rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                difficulty[currentCardIndex] === 'hard'
                  ? 'border-red-500 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'border-red-300 bg-white text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20'
              }`}
            >
              <div className='mb-1 text-xl'>😰</div>
              <div>Hard</div>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className='flex items-center justify-between gap-4'>
        <button
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'
        >
          ← Previous
        </button>

        <div className='flex items-center gap-3'>
          <button
            onClick={handleFlip}
            className='flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
          >
            {isFlipped ? (
              <>
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                </svg>
                Show Question
              </>
            ) : (
              <>
                <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                </svg>
                Show Answer
              </>
            )}
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentCardIndex === totalCards - 1}
          className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'
        >
          Next →
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-xs dark:border-gray-700 dark:bg-gray-800/50'>
        <span className='mr-3 text-gray-600 dark:text-gray-400'>Keyboard Shortcuts:</span>
        <kbd className='mx-1 rounded border border-gray-300 bg-white px-2 py-1 font-mono dark:border-gray-600 dark:bg-gray-700'>←</kbd>{' '}
        <span className='text-gray-500 dark:text-gray-400'>Previous</span>
        <span className='mx-2 text-gray-300 dark:text-gray-600'>•</span>
        <kbd className='mx-1 rounded border border-gray-300 bg-white px-2 py-1 font-mono dark:border-gray-600 dark:bg-gray-700'>Space</kbd>{' '}
        <span className='text-gray-500 dark:text-gray-400'>Flip</span>
        <span className='mx-2 text-gray-300 dark:text-gray-600'>•</span>
        <kbd className='mx-1 rounded border border-gray-300 bg-white px-2 py-1 font-mono dark:border-gray-600 dark:bg-gray-700'>→</kbd>{' '}
        <span className='text-gray-500 dark:text-gray-400'>Next</span>
      </div>
    </div>
  );
}
