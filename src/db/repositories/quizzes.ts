import { db } from "../sqlite";
import { aiGateway, SemanticEvaluation } from "@/lib/ai/ai-gateway";
import { fsrsEngine, FSRSRating } from "@/lib/fsrs/fsrs-engine";
import { masteryEngine } from "@/lib/mastery/mastery-engine";

export interface QuestionRecord {
  id: string;
  topicId: string;
  topicTitle?: string;
  conceptId: string | null;
  materialChunkId: string | null;
  type: "multiple_choice" | "cloze" | "short_answer";
  difficulty: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceReference: string | null;
  createdAt: string;
}

export interface QuizAttemptRecord {
  id: string;
  userId: string;
  quizSetId: string | null;
  topicId: string | null;
  scorePercentage: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  answers: {
    questionId: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    semanticEval?: SemanticEvaluation;
  }[];
  createdAt: string;
}

export const quizzesRepo = {
  getQuestionsByTopic(topicId?: string, limit: number = 10): QuestionRecord[] {
    let query = `
      SELECT q.*, tp.title as topic_title
      FROM questions q
      JOIN topics tp ON tp.id = q.topic_id
    `;
    const params: any[] = [];
    if (topicId) {
      query += ` WHERE q.topic_id = ?`;
      params.push(topicId);
    }
    query += ` ORDER BY RANDOM() LIMIT ?`;
    params.push(limit);

    const rows = db.prepare(query).all(...params) as any[];

    return rows.map((r) => {
      let options = [];
      try {
        options = JSON.parse(r.options_json || "[]");
      } catch (e) {
        options = [];
      }
      return {
        id: r.id,
        topicId: r.topic_id,
        topicTitle: r.topic_title,
        conceptId: r.concept_id,
        materialChunkId: r.material_chunk_id,
        type: r.type,
        difficulty: Number(r.difficulty) || 3,
        prompt: r.prompt,
        options,
        correctAnswer: r.correct_answer,
        explanation: r.explanation,
        sourceReference: r.source_reference,
        createdAt: r.created_at,
      };
    });
  },

  getAttempts(userId: string = "demo-user-1"): QuizAttemptRecord[] {
    const rows = db.prepare(`
      SELECT * FROM quiz_attempts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId) as any[];

    return rows.map((r) => {
      let answers = [];
      try {
        answers = JSON.parse(r.answers_json || "[]");
      } catch (e) {
        answers = [];
      }
      return {
        id: r.id,
        userId: r.user_id,
        quizSetId: r.quiz_set_id,
        topicId: r.topic_id,
        scorePercentage: Number(r.score_percentage) || 0,
        totalQuestions: Number(r.total_questions) || 0,
        correctCount: Number(r.correct_count) || 0,
        timeSpentSeconds: Number(r.time_spent_seconds) || 0,
        answers,
        createdAt: r.created_at,
      };
    });
  },

  async submitAttempt(data: {
    userId?: string;
    topicId: string;
    timeSpentSeconds: number;
    userSubmissions: { questionId: string; answer: string }[];
  }): Promise<QuizAttemptRecord> {
    const id = "att-" + Math.random().toString(36).substring(2, 9);
    const userId = data.userId || "demo-user-1";
    const now = new Date().toISOString();
    const evaluatedAnswers: QuizAttemptRecord["answers"] = [];

    let correctCount = 0;

    for (const sub of data.userSubmissions) {
      const qRow = db.prepare(`SELECT * FROM questions WHERE id = ?`).get(sub.questionId) as any;
      if (!qRow) continue;

      let isCorrect = false;
      let semanticEval: SemanticEvaluation | undefined = undefined;

      if (qRow.type === "short_answer") {
        semanticEval = await aiGateway.evaluateAnswer(qRow.prompt, qRow.correct_answer, sub.answer);
        isCorrect = semanticEval.isCorrect;
      } else {
        isCorrect = sub.answer.trim().toLowerCase() === qRow.correct_answer.trim().toLowerCase();
      }

      if (isCorrect) {
        correctCount++;
      } else {
        // Automatically Log Mistake in Mistake Bank!
        const diagnosis = await aiGateway.diagnoseMistake(qRow.prompt, sub.answer, qRow.correct_answer);
        const mistakeId = "mstk-" + Math.random().toString(36).substring(2, 9);
        const nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        db.prepare(`
          INSERT INTO mistake_logs (
            id, user_id, question_id, topic_id, user_answer, correct_answer,
            root_cause, diagnosis, suggested_remedy, repetition_count, is_resolved, next_review_date, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          mistakeId,
          userId,
          qRow.id,
          qRow.topic_id,
          sub.answer,
          qRow.correct_answer,
          diagnosis.rootCause,
          diagnosis.explanation,
          diagnosis.suggestedRemedy,
          1,
          0,
          nextReview,
          now,
          now
        );
      }

      evaluatedAnswers.push({
        questionId: qRow.id,
        prompt: qRow.prompt,
        userAnswer: sub.answer,
        correctAnswer: qRow.correct_answer,
        isCorrect,
        semanticEval,
      });
    }

    const totalQuestions = evaluatedAnswers.length || 1;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Persist attempt
    db.prepare(`
      INSERT INTO quiz_attempts (
        id, user_id, topic_id, score_percentage, total_questions, correct_count,
        time_spent_seconds, answers_json, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      data.topicId,
      scorePercentage,
      totalQuestions,
      correctCount,
      data.timeSpentSeconds,
      JSON.stringify(evaluatedAnswers),
      now
    );

    // Update FSRS & Mastery Engine states for topic
    const rating: FSRSRating = scorePercentage >= 90 ? 4 : scorePercentage >= 70 ? 3 : scorePercentage >= 40 ? 2 : 1;
    const currentMasteryRow = db.prepare(`SELECT * FROM mastery_records WHERE topic_id = ? AND user_id = ?`).get(data.topicId, userId) as any;

    const fsrsState = fsrsEngine.processReview(
      currentMasteryRow ? {
        stability: Number(currentMasteryRow.stability),
        difficulty: Number(currentMasteryRow.difficulty),
        retrievability: Number(currentMasteryRow.retrievability),
        repetitions: Number(currentMasteryRow.repetitions),
        lapses: Number(currentMasteryRow.lapses),
        state: currentMasteryRow.state,
        lastReviewAt: currentMasteryRow.last_review_at,
        nextReviewAt: currentMasteryRow.next_review_at,
      } : null,
      rating
    );

    const masteryResult = masteryEngine.calculateMastery({
      quizAccuracy: scorePercentage,
      quizAttemptsCount: 1,
      totalStudyMinutes: 45,
      confidenceAverage: scorePercentage >= 70 ? 4 : 2,
      unresolvedMistakesCount: totalQuestions - correctCount,
      totalMistakesLogged: totalQuestions - correctCount,
      fsrsStability: fsrsState.stability,
      lastStudiedAt: now,
    });

    if (currentMasteryRow) {
      db.prepare(`
        UPDATE mastery_records
        SET stability = ?, difficulty = ?, retrievability = ?, repetitions = ?, lapses = ?,
            state = ?, last_review_at = ?, next_review_at = ?, calculated_mastery = ?, decay_risk = ?, updated_at = ?
        WHERE id = ?
      `).run(
        fsrsState.stability,
        fsrsState.difficulty,
        fsrsState.retrievability,
        fsrsState.repetitions,
        fsrsState.lapses,
        fsrsState.state,
        now,
        fsrsState.nextReviewAt,
        masteryResult.score,
        masteryResult.decayRisk,
        now,
        currentMasteryRow.id
      );
    } else {
      db.prepare(`
        INSERT INTO mastery_records (
          id, user_id, topic_id, stability, difficulty, retrievability, repetitions, lapses,
          state, last_review_at, next_review_at, calculated_mastery, decay_risk, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        "mst-" + Math.random().toString(36).substring(2, 9),
        userId,
        data.topicId,
        fsrsState.stability,
        fsrsState.difficulty,
        fsrsState.retrievability,
        fsrsState.repetitions,
        fsrsState.lapses,
        fsrsState.state,
        now,
        fsrsState.nextReviewAt,
        masteryResult.score,
        masteryResult.decayRisk,
        now
      );
    }

    // Also update topics table mastery rating
    db.prepare(`
      UPDATE topics
      SET mastery = ?, last_studied_at = ?, updated_at = ?
      WHERE id = ?
    `).run(masteryResult.score, now, now, data.topicId);

    return {
      id,
      userId,
      quizSetId: null,
      topicId: data.topicId,
      scorePercentage,
      totalQuestions,
      correctCount,
      timeSpentSeconds: data.timeSpentSeconds,
      answers: evaluatedAnswers,
      createdAt: now,
    };
  },
};
