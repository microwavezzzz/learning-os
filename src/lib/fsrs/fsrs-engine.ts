/**
 * FSRS-4.5 (Free Spaced Repetition Scheduler) Engine
 * Implements modern memory stability, difficulty, and retrievability calculations.
 */

export type FSRSRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface FSRSState {
  stability: number; // S: days until retrievability drops to 90%
  difficulty: number; // D: 1.0 (easiest) to 10.0 (hardest)
  retrievability: number; // R: 0.0 to 1.0
  repetitions: number;
  lapses: number;
  state: "new" | "learning" | "review" | "relearning" | "mastered";
  lastReviewAt: string | null;
  nextReviewAt: string;
}

// FSRS standard default parameters (W matrix)
const DEFAULT_W = [
  0.4072, 1.1827, 3.1262, 15.4722, // Initial stabilities for ratings 1, 2, 3, 4
  7.2102, -0.5316, -0.2612, 0.0045, // Difficulty adjustments
  1.5458, 0.1544, -0.1684, 0.5878, // Stability increases on recall
  0.2289, 0.2879, // Recall stability decay
  0.6477, 0.0429, // Lapse recovery stability
  2.4188, 0.2458, // Relearning stability
  0.9, // Request retention target (90%)
];

export const fsrsEngine = {
  /**
   * Calculate current retrievability R based on elapsed days t and stability S
   * R(t, S) = (1 + factor * (t / S))^-0.5
   */
  calculateRetrievability(stability: number, elapsedDays: number): number {
    if (stability <= 0) return 0.1;
    if (elapsedDays <= 0) return 1.0;
    const factor = 19 / 81; // factor for 90% retention definition
    const r = Math.pow(1 + factor * (elapsedDays / stability), -0.5);
    return Math.min(1.0, Math.max(0.0, Number(r.toFixed(4))));
  },

  /**
   * Calculate recommended interval in days for target retention (default 90%)
   */
  calculateInterval(stability: number, targetRetention: number = 0.9): number {
    if (stability <= 0) return 1;
    const factor = 19 / 81;
    const intervalDays = (stability / factor) * (Math.pow(targetRetention, -2) - 1);
    return Math.max(1, Math.round(intervalDays));
  },

  /**
   * Process a review outcome and return the updated FSRS state
   */
  processReview(
    currentState: FSRSState | null,
    rating: FSRSRating,
    reviewDate: Date = new Date()
  ): FSRSState {
    const nowIso = reviewDate.toISOString();

    // 1. First review of a new item
    if (!currentState || !currentState.lastReviewAt || currentState.repetitions === 0) {
      const initialStability = DEFAULT_W[rating - 1];
      const initialDifficulty = Math.min(10.0, Math.max(1.0, DEFAULT_W[4] - Math.exp(DEFAULT_W[5] * (rating - 1))));
      const interval = this.calculateInterval(initialStability);
      const nextReview = new Date(reviewDate.getTime() + interval * 24 * 60 * 60 * 1000);

      return {
        stability: Number(initialStability.toFixed(2)),
        difficulty: Number(initialDifficulty.toFixed(2)),
        retrievability: 1.0,
        repetitions: 1,
        lapses: rating === 1 ? 1 : 0,
        state: rating === 1 ? "learning" : rating === 4 ? "mastered" : "review",
        lastReviewAt: nowIso,
        nextReviewAt: nextReview.toISOString(),
      };
    }

    // 2. Subsequent review
    const lastDate = new Date(currentState.lastReviewAt);
    const elapsedDays = Math.max(0.01, (reviewDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentR = this.calculateRetrievability(currentState.stability, elapsedDays);

    let newD = currentState.difficulty + DEFAULT_W[6] * (rating - 3);
    newD = Math.min(10.0, Math.max(1.0, newD));

    let newS = currentState.stability;
    let newLapses = currentState.lapses;
    let newState: FSRSState["state"] = currentState.state;

    if (rating === 1) {
      // Memory Lapse (Forgot)
      newLapses += 1;
      newState = "relearning";
      newS = Math.max(0.4, currentState.stability * DEFAULT_W[14] * Math.pow(newD, -DEFAULT_W[15]));
    } else {
      // Successful Recall (Rating 2, 3, or 4)
      const hardMultiplier = rating === 2 ? DEFAULT_W[16] : 1.0;
      const easyMultiplier = rating === 4 ? DEFAULT_W[17] : 1.0;
      const recallFactor = Math.exp(DEFAULT_W[8]) *
        (11 - newD) *
        Math.pow(currentState.stability, -DEFAULT_W[9]) *
        (Math.exp((1 - currentR) * DEFAULT_W[10]) - 1) *
        hardMultiplier *
        easyMultiplier;

      newS = currentState.stability * (1 + recallFactor);
      if (newS > 30 && rating === 4) {
        newState = "mastered";
      } else {
        newState = "review";
      }
    }

    const interval = this.calculateInterval(newS);
    const nextReview = new Date(reviewDate.getTime() + interval * 24 * 60 * 60 * 1000);

    return {
      stability: Number(newS.toFixed(2)),
      difficulty: Number(newD.toFixed(2)),
      retrievability: 1.0,
      repetitions: currentState.repetitions + 1,
      lapses: newLapses,
      state: newState,
      lastReviewAt: nowIso,
      nextReviewAt: nextReview.toISOString(),
    };
  },
};
