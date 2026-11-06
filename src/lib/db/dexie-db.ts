import Dexie, { type EntityTable } from 'dexie';
import type {
  UserProfile,
  UserSettings,
  ResumeSession,
  StudyEvent,
  NoteItem,
  StudySource,
  CodingProfile,
  PracticeLevel,
  StateManagerType,
  DataMode,
} from '@/types';

export interface LocalDraft {
  id: string; // `${taskId}_${manager}_${level}_${mode}`
  taskId: string;
  manager: StateManagerType;
  level: PracticeLevel;
  mode: DataMode;
  code: string;
  updatedAt: string;
}

export interface LocalTodo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  action: 'insert_event' | 'save_note' | 'update_resume' | 'save_profile';
  payload: any;
  createdAt: string;
  retryCount: number;
}

class ReactMentorDexie extends Dexie {
  profiles!: EntityTable<UserProfile, 'id'>;
  settings!: EntityTable<UserSettings & { id: string }, 'id'>;
  sessions!: EntityTable<ResumeSession & { id: string }, 'id'>;
  events!: EntityTable<StudyEvent, 'id'>;
  notes!: EntityTable<NoteItem, 'id'>;
  sources!: EntityTable<StudySource, 'id'>;
  drafts!: EntityTable<LocalDraft, 'id'>;
  todos!: EntityTable<LocalTodo, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;
  codingProfile!: EntityTable<CodingProfile & { id: string }, 'id'>;

  constructor() {
    super('ReactMentorLocalDB');
    this.version(1).stores({
      profiles: 'id, userId, workspaceId',
      settings: 'id, dataMode',
      sessions: 'id, lastRoute',
      events: 'id, eventType, topicId, taskId, idempotencyKey, createdAt',
      notes: 'id, topicId, updatedAt',
      sources: 'id, contentHash, isActive',
      drafts: 'id, taskId, manager, level, mode, updatedAt',
      todos: 'id, completed, createdAt',
      syncQueue: 'id, action, createdAt',
      codingProfile: 'id',
    });
  }
}

export const localDb = new ReactMentorDexie();
