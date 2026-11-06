import { CodingProfile } from '@/types';

export interface FileToAnalyze {
  name: string;
  content: string;
}

/**
 * Real client-side static code analyzer for user project files or uploaded ZIP
 */
export function analyzeProjectCode(files: FileToAnalyze[]): CodingProfile {
  // Filter out ignored directories and files
  const filtered = files.filter((f) => {
    const n = f.name.toLowerCase();
    if (
      n.includes('node_modules') ||
      n.includes('.git/') ||
      n.includes('.next/') ||
      n.includes('/dist/') ||
      n.includes('/build/') ||
      n.includes('.d.ts')
    ) {
      return false;
    }
    return n.endsWith('.ts') || n.endsWith('.tsx') || n.endsWith('.js') || n.endsWith('.jsx');
  });

  if (filtered.length === 0) {
    return {
      apiClient: 'axios',
      asyncStyle: 'async_await',
      namingStyle: 'camelCase',
      stateManagers: ['react_local'],
      errorHandling: 'try_catch',
      confidence: 'Low',
      sampleFilesCount: 0,
      patternsSummary: ['Ҳеҷ файли рамзӣ барои таҳлил ёфт нашуд.'],
    };
  }

  let axiosCount = 0;
  let fetchCount = 0;
  let asyncAwaitCount = 0;
  let promiseThenCount = 0;
  let tryCatchCount = 0;

  const foundManagers = new Set<string>();

  filtered.forEach((file) => {
    const text = file.content;

    // API client
    if (text.includes('axios') || text.includes('axios.')) axiosCount++;
    if (text.includes('fetch(')) fetchCount++;

    // Async style
    if (text.includes('async ') || text.includes('await ')) asyncAwaitCount++;
    if (text.includes('.then(') || text.includes('.catch(')) promiseThenCount++;

    // Error handling
    if (text.includes('try {') || text.includes('try{')) tryCatchCount++;

    // State managers
    if (text.includes("from 'zustand'") || text.includes('from "zustand"')) {
      foundManagers.add('zustand');
    }
    if (text.includes('@reduxjs/toolkit') || text.includes('react-redux')) {
      foundManagers.add('redux_toolkit');
    }
    if (text.includes("from 'jotai'") || text.includes('from "jotai"')) {
      foundManagers.add('jotai');
    }
    if (text.includes('useState(')) {
      foundManagers.add('react_local');
    }
  });

  const apiClient = axiosCount > fetchCount ? 'axios' : fetchCount > axiosCount ? 'fetch' : 'mixed';
  const asyncStyle = asyncAwaitCount >= promiseThenCount ? 'async_await' : 'promises';
  const errorHandling = tryCatchCount > 0 ? 'try_catch' : 'none';

  // Confidence calculation
  let confidence: 'Low' | 'Medium' | 'High' = 'Low';
  if (filtered.length >= 8) {
    confidence = 'High';
  } else if (filtered.length >= 3) {
    confidence = 'Medium';
  }

  const patternsSummary: string[] = [
    `Муштарии асосии API: ${apiClient === 'axios' ? 'Axios' : apiClient === 'fetch' ? 'Fetch API' : 'Омехта'}`,
    `Усули асинхронӣ: ${asyncStyle === 'async_await' ? 'async/await' : 'Promises (.then)'}`,
    `Назорати хатогиҳо: ${errorHandling === 'try_catch' ? 'try/catch блокҳо' : 'Ҳадди ақал'}`,
    `Менеҷерҳои ҳолат: ${Array.from(foundManagers).join(', ') || 'React Local'}`,
  ];

  return {
    apiClient,
    asyncStyle,
    namingStyle: 'camelCase',
    stateManagers:
      Array.from(foundManagers).length > 0 ? Array.from(foundManagers) : ['react_local'],
    errorHandling,
    confidence,
    sampleFilesCount: filtered.length,
    patternsSummary,
  };
}
