/**
 * Spaced Repetition Scheduling Algorithm
 * 
 * Implements SM-2 algorithm for flashcard review scheduling.
 * Based on SuperMemo-2 algorithm with modifications for better UX.
 * 
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export interface SchedulingData {
  interval: number;           // Days until next review
  repetitions: number;        // Number of successful reviews
  easeFactor: number;         // Difficulty multiplier (1.3 - 2.5)
  nextReviewAt: Date;        // When card should be reviewed next
  lastReviewedAt?: Date;     // When last reviewed
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

/**
 * Calculate next review schedule based on rating
 * 
 * @param rating User's self-assessment of difficulty
 * @param current Current scheduling data
 * @returns Updated scheduling data
 */
export function calculateNextReview(
  rating: ReviewRating,
  current: Partial<SchedulingData>
): SchedulingData {
  const now = new Date();
  
  // Initialize defaults for new cards
  const interval = current.interval || 0;
  const repetitions = current.repetitions || 0;
  const easeFactor = current.easeFactor || 2.5;

  let newInterval: number;
  let newRepetitions: number;
  let newEaseFactor: number;

  // Rating quality (0-5 scale for SM-2)
  const quality = ratingToQuality(rating);

  // Update ease factor (only if quality >= 3)
  if (quality >= 3) {
    newEaseFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  } else {
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  }

  // Calculate new interval based on rating
  if (quality < 3) {
    // Failed review - reset to beginning
    newInterval = 0;
    newRepetitions = 0;
  } else {
    // Successful review
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1; // Review in 1 day
    } else if (newRepetitions === 2) {
      newInterval = 6; // Review in 6 days
    } else {
      // Use ease factor for subsequent reviews
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  // Calculate next review date
  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    nextReviewAt,
    lastReviewedAt: now,
  };
}

/**
 * Convert user-friendly rating to SM-2 quality (0-5)
 * 
 * again (0) = Complete blackout
 * hard (3) = Correct response recalled with serious difficulty
 * good (4) = Correct response after hesitation
 * easy (5) = Perfect response
 */
function ratingToQuality(rating: ReviewRating): number {
  switch (rating) {
    case 'again':
      return 0; // Failed - need to review again
    case 'hard':
      return 3; // Passed but difficult
    case 'good':
      return 4; // Passed with normal effort
    case 'easy':
      return 5; // Passed easily
    default:
      return 4; // Default to good
  }
}

/**
 * Get suggested interval in days for each rating
 * Useful for showing users estimated next review time
 */
export function getIntervalPreview(
  current: Partial<SchedulingData>
): Record<ReviewRating, number> {
  return {
    again: 0, // Review immediately (same session or soon)
    hard: calculateNextReview('hard', current).interval,
    good: calculateNextReview('good', current).interval,
    easy: calculateNextReview('easy', current).interval,
  };
}

/**
 * Check if a card is due for review
 */
export function isCardDue(scheduling: Partial<SchedulingData>): boolean {
  if (!scheduling.nextReviewAt) return true; // New card
  return new Date(scheduling.nextReviewAt) <= new Date();
}

/**
 * Get human-readable interval description
 */
export function formatInterval(days: number): string {
  if (days === 0) return 'Soon';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  const months = Math.round(days / 30);
  return months === 1 ? '1 month' : `${months} months`;
}
