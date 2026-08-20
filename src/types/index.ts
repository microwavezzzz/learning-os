/**
 * Core Domain Types for Learning OS
 */

export type UserRole = "student" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  dailyTargetMinutes: number;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  longBreakMinutes: number;
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export type PriorityLevel = "low" | "medium" | "high" | "critical";

export interface Subject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  colorCode: string;
  iconName: string;
  orderIndex: number;
  topicCount?: number;
  averageMastery?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  parentId?: string;
  title: string;
  description?: string;
  estimatedHours: number;
  priority: PriorityLevel;
  prerequisiteTopicIds: string[];
  masteryScore: number; // 0 to 100
  lastStudiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaterialParseStatus = "pending" | "processing" | "completed" | "failed";

export interface MaterialFile {
  id: string;
  userId: string;
  topicId?: string;
  googleDriveFileId: string;
  name: string;
  mimeType: string;
  fileSize: number;
  driveViewLink: string;
  driveThumbnailLink?: string;
  parseStatus: MaterialParseStatus;
  lastModifiedInDrive: string;
  createdAt: string;
}

export type StudyPlanStatus = "active" | "completed" | "paused" | "archived";
export type StudyPlanStrategy = "adaptive_spaced" | "linear_cram" | "exam_prep";

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  targetCompletionDate: string;
  allocatedMinutesPerDay: number;
  status: StudyPlanStatus;
  strategy: StudyPlanStrategy;
  totalTopics: number;
  completedTopics: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  topicId: string;
  topicTitle?: string;
  subjectTitle?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  technique: "pomodoro" | "deep_work" | "quick_review";
  notesMarkdown?: string;
  productivityRating: number; // 1-5
  comprehensionRating: number; // 1-5
}

export type QuestionType = "multiple_choice" | "cloze" | "short_answer" | "code_eval";

export interface Question {
  id: string;
  topicId: string;
  questionType: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
}

export type MistakeCategory =
  | "concept_confusion"
  | "formula_error"
  | "misread"
  | "lapsed_recall";

export interface MistakeLog {
  id: string;
  userId: string;
  questionId: string;
  questionPrompt: string;
  topicId: string;
  topicTitle: string;
  rootCauseCategory: MistakeCategory;
  userNotes?: string;
  resolved: boolean;
  repetitionCount: number;
  lastTestedAt: string;
  nextReviewScheduledAt: string;
}

export interface MasteryRecord {
  id: string;
  userId: string;
  topicId: string;
  topicTitle: string;
  stability: number; // in days
  difficulty: number; // 1-10
  retrievability: number; // 0.0 - 1.0
  reps: number;
  lapses: number;
  state: "learning" | "review" | "relearning";
  lastReviewDate: string;
  dueReviewDate: string;
  masteryPercentage: number;
}
