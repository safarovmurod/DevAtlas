import type { CourseId } from '@/lib/courses/ids';
import type { CourseCategoryId, ProgrammingSubtrackId } from '@/content/course-categories';
import { OTHER_COURSES } from './catalog-other';
import { PAID_COURSES } from './catalog-paid';
import { PROGRAMMING_COURSES } from './catalog-programming';

export interface CourseCatalogEntry {
  id: CourseId;
  name: string;
  symbol: string;
  ru: string;
  en: string;
  /** Legacy navigation hint; category/subtrack are authoritative for catalog grouping. */
  route: 'web' | 'tools' | 'systems';
  prerequisite: CourseId | null;
  category: CourseCategoryId;
  subtrack?: ProgrammingSubtrackId;
  editorLanguage?: string;
  /** Execution setup guidance, not a claim that the site executes this runtime. */
  runtime?: 'browser' | 'local';
  introductoryDays?: 2;
  accessTier?: 'starter' | 'pro' | 'expert';
  /** Number of real scheduled days; library-only reference lessons are not counted. */
  publishedDays?: number;
}

// The order of courses here is the order shown in the catalog.
export const COURSE_CATALOG: CourseCatalogEntry[] = [
  ...PROGRAMMING_COURSES,
  ...OTHER_COURSES,
  ...PAID_COURSES,
];
export function courseName(id: CourseId) {
  return COURSE_CATALOG.find((course) => course.id === id)!.name;
}
export function coursePublishedDays(id: CourseId) {
  return COURSE_CATALOG.find((course) => course.id === id)?.publishedDays ?? 0;
}

/* ============ Learning tracks ============
   A track is one discipline studied across three stages: Beginner (free),
   Pro and Expert (paid). Stage membership is derived from accessTier so a
   course can never claim a stage its access tier contradicts. Tracks with
   unpublished stages list only what actually exists — the UI renders missing
   stages as "not published yet", never as finished courses. */
export type LearningStage = 'beginner' | 'pro' | 'expert';
export interface TrackStageRef {
  stage: LearningStage;
  course: CourseId;
}
export interface LearningTrack {
  id: string;
  name: string;
  courses: TrackStageRef[];
}

const stageOf = (id: CourseId): LearningStage => {
  const tier = COURSE_CATALOG.find((course) => course.id === id)?.accessTier;
  return tier === 'pro' ? 'pro' : tier === 'expert' ? 'expert' : 'beginner';
};

function track(id: string, name: string, courses: CourseId[]): LearningTrack {
  return { id, name, courses: courses.map((course) => ({ stage: stageOf(course), course })) };
}

export const LEARNING_TRACKS: LearningTrack[] = [
  track('html', 'HTML + CSS', ['html']),
  track('css', 'CSS', ['css']),
  track('javascript', 'JavaScript', ['javascript-1', 'javascript-2', 'javascript-pro']),
  track('typescript', 'TypeScript', ['typescript']),
  track('react', 'React', ['react']),
  track('nextjs', 'Next.js', ['nextjs']),
  track('python', 'Python', ['python']),
  track('algorithms', 'Algorithms', ['algorithms']),
  track('cpp', 'C++', ['cpp']),
  track('java', 'Java', ['java']),
  track('csharp', 'C#', ['csharp']),
  track('go', 'Go', ['go']),
  track('rust', 'Rust', ['rust']),
  track('php', 'PHP', ['php']),
  track('ruby', 'Ruby', ['ruby']),
  track('backend', 'Backend', ['backend', 'backend-pro']),
  track('nodejs', 'Node.js', ['nodejs']),
  track('sql', 'SQL', ['sql']),
  track('mongodb', 'MongoDB', ['mongodb']),
  track('bash', 'Bash', ['bash']),
  track('git', 'Git / GitHub', ['git']),
  track('mobile', 'Mobile', ['mobile']),
  track('swift', 'Swift', ['swift']),
  track('kotlin', 'Kotlin', ['kotlin']),
  track('ai-fundamentals', 'AI Fundamentals', ['ai-fundamentals']),
  track('context-engineering', 'Context Engineering', ['context-engineering']),
  track('agent-harness', 'Agent Harness', ['agent-harness']),
  track('ux', 'UX/UI Design', ['ux-design', 'ux-pro']),
  track('digital-marketing', 'Digital Marketing', ['digital-marketing']),
  track('data-analytics', 'Data Analytics', ['data-analytics']),
  track('business', 'Business', ['business-foundations', 'business-pro']),
  track('management', 'Management', ['management-foundations']),
  track('communication', 'Communication', ['communication']),
  track('content-creation', 'Content Creation', ['content-creation']),
  track('english', 'English', ['english-foundations']),
  track('digital-literacy', 'Digital Literacy', ['digital-literacy']),
  track('personal-productivity', 'Personal Productivity', ['personal-productivity']),
  track('architecture', 'Software Architecture', ['architecture-expert']),
];

export function courseTrack(id: CourseId): LearningTrack | null {
  return LEARNING_TRACKS.find((item) => item.courses.some((entry) => entry.course === id)) ?? null;
}
