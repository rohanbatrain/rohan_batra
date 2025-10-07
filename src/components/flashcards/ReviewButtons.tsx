/**
 * Spaced Repetition Review Buttons
 * SM-2 algorithm ease level buttons for flashcard review
 *
 * Displays: Again, Hard, Good, Easy
 * Shows: Predicted next review intervals
 */

'use client';

import React from 'react';
import { Clock, XCircle, AlertCircle, CheckCircle, Zap } from 'lucide-react';

export type EaseLevel = 'again' | 'hard' | 'good' | 'easy';

interface ReviewButtonsProps {
  onReview: (easeLevel: EaseLevel) => void;
  intervals?: {
    again: string;
    hard: string;
    good: string;
    easy: string;
  };
  disabled?: boolean;
  showKeyboardHints?: boolean;
}

/**
 * Format interval for display
 */
function formatInterval(days: number): string {
  if (days < 1) return '<1 day';
  if (days === 1) return '1 day';
  if (days < 30) return `${Math.round(days)} days`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  const years = Math.round(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}

/**
 * Calculate predicted intervals (simplified for display)
 */
function calculateDisplayIntervals(
  currentInterval?: number,
  easeFactor: number = 2.5
): {
  again: string;
  hard: string;
  good: string;
  easy: string;
} {
  const current = currentInterval || 1;

  return {
    again: '1 day',
    hard: formatInterval(current * 1.2),
    good: formatInterval(current * easeFactor),
    easy: formatInterval(current * easeFactor * 1.3),
  };
}

export function ReviewButtons({
  onReview,
  intervals,
  disabled = false,
  showKeyboardHints = true,
}: ReviewButtonsProps) {
  const displayIntervals = intervals || calculateDisplayIntervals();

  // Keyboard shortcuts
  React.useEffect(() => {
    if (disabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case '1':
          onReview('again');
          break;
        case '2':
          onReview('hard');
          break;
        case '3':
          onReview('good');
          break;
        case '4':
          onReview('easy');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onReview, disabled]);

  return (
    <div className='review-buttons'>
      <div className='buttons-grid'>
        {/* Again Button */}
        <button
          type='button'
          className='review-button again'
          onClick={() => onReview('again')}
          disabled={disabled}
          aria-label='Again - Review soon'
        >
          <div className='button-content'>
            <XCircle className='button-icon' />
            <span className='button-label'>Again</span>
            <span className='button-interval'>{displayIntervals.again}</span>
            {showKeyboardHints && <span className='keyboard-hint'>1</span>}
          </div>
        </button>

        {/* Hard Button */}
        <button
          type='button'
          className='review-button hard'
          onClick={() => onReview('hard')}
          disabled={disabled}
          aria-label='Hard - Review sooner'
        >
          <div className='button-content'>
            <AlertCircle className='button-icon' />
            <span className='button-label'>Hard</span>
            <span className='button-interval'>{displayIntervals.hard}</span>
            {showKeyboardHints && <span className='keyboard-hint'>2</span>}
          </div>
        </button>

        {/* Good Button */}
        <button
          type='button'
          className='review-button good'
          onClick={() => onReview('good')}
          disabled={disabled}
          aria-label='Good - Standard interval'
        >
          <div className='button-content'>
            <CheckCircle className='button-icon' />
            <span className='button-label'>Good</span>
            <span className='button-interval'>{displayIntervals.good}</span>
            {showKeyboardHints && <span className='keyboard-hint'>3</span>}
          </div>
        </button>

        {/* Easy Button */}
        <button
          type='button'
          className='review-button easy'
          onClick={() => onReview('easy')}
          disabled={disabled}
          aria-label='Easy - Review much later'
        >
          <div className='button-content'>
            <Zap className='button-icon' />
            <span className='button-label'>Easy</span>
            <span className='button-interval'>{displayIntervals.easy}</span>
            {showKeyboardHints && <span className='keyboard-hint'>4</span>}
          </div>
        </button>
      </div>

      {showKeyboardHints && (
        <p className='keyboard-hint-text'>
          <Clock className='w-3 h-3' />
          Press 1-4 for quick review
        </p>
      )}

      <style jsx>{`
        .review-buttons {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .buttons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        .review-button {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .review-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .review-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .review-button.again {
          border-color: #ef4444;
        }

        .review-button.again:hover:not(:disabled) {
          background-color: #fef2f2;
          border-color: #dc2626;
        }

        .review-button.hard {
          border-color: #f59e0b;
        }

        .review-button.hard:hover:not(:disabled) {
          background-color: #fffbeb;
          border-color: #d97706;
        }

        .review-button.good {
          border-color: #10b981;
        }

        .review-button.good:hover:not(:disabled) {
          background-color: #ecfdf5;
          border-color: #059669;
        }

        .review-button.easy {
          border-color: #3b82f6;
        }

        .review-button.easy:hover:not(:disabled) {
          background-color: #eff6ff;
          border-color: #2563eb;
        }

        .button-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .button-icon {
          width: 24px;
          height: 24px;
        }

        .review-button.again .button-icon {
          color: #ef4444;
        }

        .review-button.hard .button-icon {
          color: #f59e0b;
        }

        .review-button.good .button-icon {
          color: #10b981;
        }

        .review-button.easy .button-icon {
          color: #3b82f6;
        }

        .button-label {
          font-weight: 600;
          font-size: 16px;
          color: #111827;
        }

        .button-interval {
          font-size: 13px;
          color: #6b7280;
        }

        .keyboard-hint {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background-color: #f3f4f6;
          color: #6b7280;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .keyboard-hint-text {
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        @media (max-width: 640px) {
          .buttons-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Review Progress Component
 * Shows progress through review session
 */
interface ReviewProgressProps {
  current: number;
  total: number;
  dueCount?: number;
}

export function ReviewProgress({
  current,
  total,
  dueCount,
}: ReviewProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className='review-progress'>
      <div className='progress-header'>
        <span className='progress-text'>
          {current} / {total} cards reviewed
        </span>
        {dueCount !== undefined && dueCount > 0 && (
          <span className='due-text'>{dueCount} due</span>
        )}
      </div>
      <div className='progress-bar'>
        <div
          className='progress-fill'
          style={{ width: `${percentage}%` }}
          role='progressbar'
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>

      <style jsx>{`
        .review-progress {
          margin-bottom: 24px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-text {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .due-text {
          font-size: 13px;
          color: #f59e0b;
          font-weight: 500;
        }

        .progress-bar {
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}
