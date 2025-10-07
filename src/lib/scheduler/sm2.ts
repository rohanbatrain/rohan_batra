/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo-2 algorithm
 * 
 * Ease levels:
 * - Again: 0 (Forgot/Failed)
 * - Hard: 1 (Difficult)
 * - Good: 2 (Normal)
 * - Easy: 3 (Easy)
 */

export interface SchedulingData {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastReviewedAt?: Date | null;
  nextReviewAt?: Date | null;
}

export type EaseLevel = 'again' | 'hard' | 'good' | 'easy';

const EASE_LEVEL_TO_QUALITY: Record<EaseLevel, number> = {
  again: 0,
  hard: 1,
  good: 2,
  easy: 3,
};

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 36500; // ~100 years

/**
 * Calculate next review schedule using SM-2 algorithm
 * @param currentSchedule - Current scheduling data
 * @param easeLevel - User's ease rating for the review
 * @returns Updated scheduling data
 */
export function calculateNextReview(
  currentSchedule: SchedulingData,
  easeLevel: EaseLevel
): SchedulingData {
  const quality = EASE_LEVEL_TO_QUALITY[easeLevel];
  const now = new Date();

  let { intervalDays, easeFactor, repetitions } = currentSchedule;

  // If quality < 2 (Again or Hard with Again behavior), restart
  if (quality < 2) {
    intervalDays = MIN_INTERVAL_DAYS;
    repetitions = 0;
  } else {
    // Update ease factor using SM-2 formula
    // EF' = EF + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
    
    // Clamp ease factor
    if (easeFactor < MIN_EASE_FACTOR) {
      easeFactor = MIN_EASE_FACTOR;
    }

    // Calculate next interval
    if (repetitions === 0) {
      intervalDays = MIN_INTERVAL_DAYS;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }

    // Apply ease level modifiers
    if (easeLevel === 'hard') {
      intervalDays = Math.round(intervalDays * 1.2); // 20% more than minimum
    } else if (easeLevel === 'easy') {
      intervalDays = Math.round(intervalDays * 1.3); // 30% bonus for easy
    }

    repetitions += 1;
  }

  // Clamp interval to reasonable bounds
  intervalDays = Math.max(MIN_INTERVAL_DAYS, Math.min(MAX_INTERVAL_DAYS, intervalDays));

  // Calculate next review date
  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return {
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100, // Round to 2 decimals
    repetitions,
    lastReviewedAt: now,
    nextReviewAt,
  };
}

/**
 * Initialize scheduling data for a new card
 */
export function initializeScheduling(): SchedulingData {
  return {
    intervalDays: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  };
}

/**
 * Check if a card is due for review
 */
export function isCardDue(scheduling: SchedulingData): boolean {
  if (!scheduling.nextReviewAt) {
    return true; // Never reviewed before
  }
  return new Date() >= new Date(scheduling.nextReviewAt);
}

/**
 * Get cards due for review count
 */
export function getDueCardsCount(cards: Array<{ scheduling?: SchedulingData }>): number {
  return cards.filter(card => {
    if (!card.scheduling) return true;
    return isCardDue(card.scheduling);
  }).length;
}
