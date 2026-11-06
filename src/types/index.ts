// ==============================================================================
// CORE TYPE DEFINITIONS FOR REACT MENTOR FULL-STACK
// ==============================================================================

export type DataMode = 'local' | 'global';
export type StateManagerType = 'react_local' | 'zustand' | 'redux_toolkit' | 'jotai';
export type PracticeLevel = 1 | 2 | 3 | 4; // 1: Сода, 2: Обычный, 3: Junior, 4: Production
export type VerdictType = 'correct' | 'partially_correct' | 'incorrect';

// --- AUTH & WORKSPACE ---
export interface DeviceInfo {
  id: string;
  workspaceId: string;
  userId: string;
  deviceFingerprint: string;
  name: string;
  platform: string;
  lastSeen: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  workspaceId: string;
  displayName: string;
  dailyTimeMinutes: number;
  diagnosticCompleted: boolean;
  overallLevel: string;
  jsScore: number;
  reactScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  dataMode: DataMode;
  strictInterview: boolean;
  strictPractice: boolean;
  codeStyleMode: 'standard' | 'my_style';
  defaultManager: StateManagerType;
  theme: 'dark' | 'light';
  dailyTimeMinutes: number;
}

export interface ResumeSession {
  lastRoute: string;
  lastTopicId?: string;
  lastLessonId?: string;
  lastTaskId?: string;
  lastManager: StateManagerType;
  lastLevel: PracticeLevel;
  lastMode: DataMode;
  updatedAt: string;
}

// --- EVENT LEDGER & PROGRESS ---
export type StudyEventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_answered'
  | 'practice_passed'
  | 'practice_failed'
  | 'interview_answered'
  | 'revision_completed'
  | 'note_created';

export interface StudyEvent {
  id: string;
  workspaceId: string;
  userId: string;
  deviceId?: string;
  sourceId?: string;
  topicId?: string;
  lessonId?: string;
  taskId?: string;
  eventType: StudyEventType;
  score?: number;
  correct?: boolean;
  durationSeconds: number;
  idempotencyKey: string;
  createdAt: string;
}

export interface TopicMastery {
  topicId: string;
  masteryScore: number; // 0 - 100
  practiceScore: number;
  quizScore: number;
  interviewScore: number;
  revisionScore: number;
  attemptsCount: number;
  isWeak: boolean; // mastery < 60
  lastMistakeText?: string;
  mistakesCount: number;
}

export interface CourseProgress {
  coveragePct: number; // % of required topics completed
  masteryPct: number; // weighted average of attempts
  totalProgressPct: number; // Coverage * 0.60 + Mastery * 0.40
  completedTopicsCount: number;
  totalTopicsCount: number;
}

export interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
  lastActiveDateKey: string; // YYYY-MM-DD
  activeToday: boolean;
  minutesToday: number;
}

export interface DailyPlan {
  dailyTimeMinutes: number;
  allocated: {
    revision: number;
    practice: number;
    lesson: number;
    interview: number;
  };
  recommendedTopicIds: string[];
  currentLessonId?: string;
  currentTaskId?: string;
  reason: string;
}

// --- CURRICULUM, LESSONS, TASKS ---
export interface Topic {
  id: string;
  title: string;
  category:
    | 'js'
    | 'react_basics'
    | 'hooks'
    | 'forms'
    | 'routing'
    | 'api'
    | 'state_mgmt'
    | 'typescript'
    | 'advanced';
  stage: number;
  description: string;
  weight: number;
}

export interface LessonContent {
  whyNeeded: string;
  meaning: string;
  whatDoesItDo: string;
  trigger: string;
  startLocation: string;
  callingFunction: string;
  whereDataGoes: string;
  whatRerenders: string;
  whatHappensIfDeleted: string;
  codeExample: string;
  flowSteps: string[];
  commonErrors: string[];
  interviewTip: string;
  microTerms: { term: string; explanation: string }[];
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  content: LessonContent;
  orderNum: number;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  type: 'multiple_choice' | 'true_false' | 'find_bug' | 'code_output';
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface PracticeTestCase {
  id: string;
  description: string;
  input?: any;
  expected?: any;
  expectedLength?: number;
  expectedAdded?: boolean;
}

export interface PracticeTask {
  id: string;
  topicId: string;
  operation:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
    | 'INFO'
    | 'SEARCH'
    | 'FILTER'
    | 'PAGINATION'
    | 'IMAGE_ADD'
    | 'FORM_SUBMIT';
  stateManager: StateManagerType;
  level: PracticeLevel;
  prompt: string;
  starterCode: string;
  solutionCode: string;
  miniHint: string;
  hints: string[];
  testCases: PracticeTestCase[];
  recommendedTimeMinutes: number;
}

export interface InterviewRubric {
  requiredConcepts: string[];
  forbiddenContradictions: string[];
  keyTerms: string[];
  goodAnswerSummary: string;
}

export interface InterviewQuestion {
  id: string;
  topicId: string;
  prompt: string;
  rubric: InterviewRubric;
  sampleGoodAnswer: string;
  samplePoorAnswer: string;
  category: string;
}

// --- CHECKER & GRADING ---
export interface TestRunResult {
  name: string;
  passed: boolean;
  message?: string;
}

export interface CodeCheckResult {
  verdict: VerdictType;
  score: number;
  syntaxValid: boolean;
  astChecksPassed: boolean;
  runtimePassed: boolean;
  behaviorPassed: boolean;
  exactError?: string;
  exactLine?: number;
  expectedBehavior?: string;
  actualBehavior?: string;
  minimalFixDirection?: string;
  feedbackText: string;
  testResults: TestRunResult[];
}

export interface InterviewGradeResult {
  verdict: VerdictType;
  score: number;
  feedback: string;
  correctParts: string[];
  missingParts: string[];
  wrongParts: string[];
  shortCorrection: string;
  deepExplanation?: string;
}

// --- SPACED REPETITION ---
export interface RevisionItem {
  id: string;
  workspaceId: string;
  userId: string;
  itemType: 'question' | 'practice' | 'topic';
  refId: string;
  topicId: string;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewedAt?: string;
}

// --- NOTES & SOURCES ---
export interface NoteItem {
  id: string;
  workspaceId: string;
  userId: string;
  topicId?: string;
  title: string;
  content: string;
  updatedAt: string;
  createdAt: string;
}

export interface StudySource {
  id: string;
  workspaceId: string;
  contentHash: string;
  title: string;
  fileType: string;
  sourceText: string;
  isActive: boolean;
  createdAt: string;
}

// --- CODING PROFILE ---
export interface CodingProfile {
  apiClient: 'axios' | 'fetch' | 'mixed';
  asyncStyle: 'async_await' | 'promises';
  namingStyle: 'camelCase' | 'snake_case';
  stateManagers: string[];
  errorHandling: 'try_catch' | 'none';
  confidence: 'Low' | 'Medium' | 'High';
  sampleFilesCount: number;
  patternsSummary: string[];
}

// --- TUTOR CHAT ---
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isDeep?: boolean;
}
