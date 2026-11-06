import { Lesson } from '@/types';
import { HOOK_LESSONS } from './lessons-hooks';
import { STATE_LESSONS } from './lessons-state';

export const LESSONS: Lesson[] = [...HOOK_LESSONS, ...STATE_LESSONS];
