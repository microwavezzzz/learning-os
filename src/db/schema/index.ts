/**
 * Database Schema Architecture for Learning OS
 * Formatted for relational persistence (PostgreSQL / SQLite compatibility)
 */

export interface DbUser {
  id: string; // UUID primary key
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'student' | 'admin';
  preferencesJson: string; // Serialized JSON of UserPreferences
  createdAt: string;
  updatedAt: string;
}

export interface DbGoogleAccount {
  id: string;
  userId: string;
  googleId: string;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  tokenExpiry: string;
  scope: string;
  syncedFolderId?: string;
  lastSyncedAt?: string;
}

export interface DbSubject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  colorCode: string;
  iconName: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbTopic {
  id: string;
  subjectId: string;
  parentId?: string; // Subtopics support
  title: string;
  description?: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  prerequisitesJson: string; // JSON array of topic IDs
  masteryScore: number; // 0 to 100
  lastStudiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbMaterialFile {
  id: string;
  userId: string;
  topicId?: string;
  googleDriveFileId: string;
  name: string;
  mimeType: string;
  fileSize: number;
  driveViewLink: string;
  driveThumbnailLink?: string;
  parseStatus: 'pending' | 'processing' | 'completed' | 'failed';
  lastModifiedInDrive: string;
  createdAt: string;
}

export interface DbStudyPlan {
  id: string;
  userId: string;
  title: string;
  targetCompletionDate: string;
  allocatedMinutesPerDay: number;
  status: 'active' | 'completed' | 'paused' | 'archived';
  strategy: 'adaptive_spaced' | 'linear_cram' | 'exam_prep';
  createdAt: string;
  updatedAt: string;
}

export interface DbStudySession {
  id: string;
  userId: string;
  topicId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  technique: 'pomodoro' | 'deep_work' | 'quick_review';
  notesMarkdown?: string;
  productivityRating: number;
  comprehensionRating: number;
}

export interface DbQuestion {
  id: string;
  topicId: string;
  materialChunkId?: string;
  questionType: 'multiple_choice' | 'cloze' | 'short_answer' | 'code_eval';
  prompt: string;
  optionsJson?: string;
  correctAnswer: string;
  explanation: string;
  difficultyLevel: number;
}

export interface DbMistakeLog {
  id: string;
  userId: string;
  questionId: string;
  topicId: string;
  rootCauseCategory: 'concept_confusion' | 'formula_error' | 'misread' | 'lapsed_recall';
  userNotes?: string;
  resolved: boolean;
  repetitionCount: number;
  lastTestedAt: string;
  nextReviewScheduledAt: string;
}

export interface DbMasteryRecord {
  id: string;
  userId: string;
  topicId: string;
  stability: number;
  difficulty: number;
  retrievability: number;
  reps: number;
  lapses: number;
  state: 'learning' | 'review' | 'relearning';
  lastReviewDate: string;
  dueReviewDate: string;
  calculatedMasteryPercentage: number;
}
