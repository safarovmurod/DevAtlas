import { gradeFirstSqlLesson } from './sqlite-grader';
declare const initSqlJs: typeof import('sql.js');
const scope = globalThis as unknown as {
  importScripts: (url: string) => void;
  postMessage: (value: unknown) => void;
  onmessage: ((event: MessageEvent) => void) | null;
};
async function start() {
  try {
    scope.importScripts('/sqlite/sql-wasm.js');
    const SQL = await initSqlJs({ locateFile: () => '/sqlite/sql-wasm.wasm' });
    scope.onmessage = (event) => {
      if (
        event.data?.type !== 'run' ||
        typeof event.data.code !== 'string' ||
        new TextEncoder().encode(event.data.code).byteLength > 32768
      ) {
        scope.postMessage({ type: 'error', error: 'Invalid SQL request' });
        return;
      }
      scope.postMessage({ type: 'result', result: gradeFirstSqlLesson(SQL, event.data.code) });
    };
    scope.postMessage({ type: 'ready' });
  } catch {
    scope.postMessage({ type: 'error', error: 'SQLite could not initialize' });
  }
}
void start();
