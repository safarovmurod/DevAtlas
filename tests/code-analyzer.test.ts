import { describe, it, expect } from 'vitest';
import { analyzeProjectCode } from '@/lib/project-analyzer/code-analyzer';

describe('Project Static Code Analyzer', () => {
  it('detects Axios, async/await, try/catch, and Zustand from source files', () => {
    const files = [
      {
        name: 'src/api/users.ts',
        content: `
          import axios from 'axios';
          export async function fetchUsers() {
            try {
              const res = await axios.get('/api/users');
              return res.data;
            } catch (err) {
              console.error(err);
            }
          }
        `,
      },
      {
        name: 'src/store/useStore.ts',
        content: `
          import { create } from 'zustand';
          export const useStore = create((set) => ({ count: 0 }));
        `,
      },
      {
        name: 'src/components/UserList.tsx',
        content: `
          import React from 'react';
          export function UserList() { return <div>Users</div>; }
        `,
      },
    ];

    const profile = analyzeProjectCode(files);

    expect(profile.apiClient).toBe('axios');
    expect(profile.asyncStyle).toBe('async_await');
    expect(profile.errorHandling).toBe('try_catch');
    expect(profile.stateManagers).toContain('zustand');
    expect(profile.confidence).toBe('Medium');
  });

  it('ignores files inside node_modules and .git', () => {
    const files = [
      {
        name: 'node_modules/fake/index.js',
        content: `import fetch from 'fetch';`,
      },
    ];

    const profile = analyzeProjectCode(files);
    expect(profile.sampleFilesCount).toBe(0);
    expect(profile.confidence).toBe('Low');
  });
});
