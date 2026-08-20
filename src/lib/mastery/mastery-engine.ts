import { fsrsEngine } from "../fsrs/fsrs-engine";

export interface MasteryInput {
  quizAccuracy: number; // 0 to 100
  quizAttemptsCount: number;
  totalStudyMinutes: number;
  confidenceAverage: number; // 1 to 5
  unresolvedMistakesCount: number;
  totalMistakesLogged: number;
  fsrsStability: number; // days
  lastStudiedAt: string | null;
}

export interface MasteryResult {
  score: number; // 0 to 100
  level: "novice" | "competent" | "proficient" | "mastered";
  decayRisk: "none" | "low" | "moderate" | "critical";
  currentRetrievability: number; // 0.0 to 1.0
  breakdown: {
    quizWeightScore: number;
    memoryStabilityScore: number;
    studyVolumeScore: number;
    mistakeHealthScore: number;
    confidenceScore: number;
  };
}

export const masteryEngine = {
  /**
   * Deterministically calculate multi-factor cognitive mastery (0-100%)
   */
  calculateMastery(input: MasteryInput): MasteryResult {
    const now = new Date();
    let elapsedDays = 0;
    if (input.lastStudiedAt) {
      const last = new Date(input.lastStudiedAt);
      elapsedDays = Math.max(0, (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    }

    // 1. Current Retrievability via FSRS
    const currentRetrievability = fsrsEngine.calculateRetrievability(
      input.fsrsStability || 2.0,
      elapsedDays
    );

    // 2. Quiz Performance Component (Max 35 points)
    // If no quiz attempts yet, baseline on study volume
    const quizWeight = input.quizAttemptsCount > 0
      ? (input.quizAccuracy / 100) * 35
      : Math.min(20, (input.totalStudyMinutes / 60) * 10);

    // 3. FSRS Memory Stability Component (Max 25 points)
    // S >= 30 days yields max memory score scaled by retrievability
    const stabilityFactor = Math.min(1.0, (input.fsrsStability || 1.0) / 30);
    const memoryScore = (stabilityFactor * 0.5 + currentRetrievability * 0.5) * 25;

    // 4. Study History Volume Component (Max 20 points)
    // 120 minutes of active focused study yields full volume points
    const studyScore = Math.min(20, (input.totalStudyMinutes / 120) * 20);

    // 5. Mistake Bank Health Component (Max 10 points)
    // Penalize unresolved conceptual mistakes
    let mistakeScore = 10;
    if (input.unresolvedMistakesCount > 0) {
      mistakeScore = Math.max(0, 10 - input.unresolvedMistakesCount * 3);
    }

    // 6. Self-Reported Confidence Component (Max 10 points)
    const confidenceScore = ((input.confidenceAverage || 3) / 5) * 10;

    // Aggregate Weighted Score (0 - 100)
    let rawScore = quizWeight + memoryScore + studyScore + mistakeScore + confidenceScore;

    // Apply memory decay dampener if user has been inactive for a prolonged duration
    if (currentRetrievability < 0.6) {
      rawScore *= Math.max(0.65, currentRetrievability);
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Determine Mastery Level
    let level: MasteryResult["level"] = "novice";
    if (finalScore >= 85) level = "mastered";
    else if (finalScore >= 70) level = "proficient";
    else if (finalScore >= 45) level = "competent";

    // Determine Retention Decay Risk
    let decayRisk: MasteryResult["decayRisk"] = "none";
    if (currentRetrievability < 0.5) decayRisk = "critical";
    else if (currentRetrievability < 0.7) decayRisk = "moderate";
    else if (currentRetrievability < 0.85) decayRisk = "low";

    return {
      score: finalScore,
      level,
      decayRisk,
      currentRetrievability,
      breakdown: {
        quizWeightScore: Number(quizWeight.toFixed(1)),
        memoryStabilityScore: Number(memoryScore.toFixed(1)),
        studyVolumeScore: Number(studyScore.toFixed(1)),
        mistakeHealthScore: Number(mistakeScore.toFixed(1)),
        confidenceScore: Number(confidenceScore.toFixed(1)),
      },
    };
  },
};
