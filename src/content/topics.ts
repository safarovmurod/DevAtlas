import { Topic } from '@/types';
import { BASIC_TOPICS } from './topics-basics';
import { ADVANCED_TOPICS } from './topics-advanced';

export const TOPICS: Topic[] = [...BASIC_TOPICS, ...ADVANCED_TOPICS];
