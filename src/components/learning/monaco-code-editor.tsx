'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { loader, type BeforeMount, type OnMount, type Monaco } from '@monaco-editor/react';
import type { CodeEditorProps } from './code-editor';
import { useLearningStore } from '@/stores/learning-store';
import { EDITOR_COPY, PRACTICE_PASTE_LIMIT } from '@/lib/editor-copy';

type EditorWindow = Window & {
  DevAtlasMonaco?: Monaco;
  monaco?: Monaco;
  MonacoEnvironment?: { getWorkerUrl: (_module: string, label: string) => string };
};
let localEditor: Promise<void> | undefined;

/** The ESM-derived bundle replaces Monaco's vendored sanitizer at build time.
 * Do not fall back to the AMD distribution: it contains the vulnerable copy.
 */
function loadLocalEditor() {
  if (localEditor) return localEditor;
  localEditor = new Promise<void>((resolve, reject) => {
    const scope = window as EditorWindow;
    const workers: Record<string, string> = {
      json: 'json',
      css: 'css',
      scss: 'css',
      less: 'css',
      html: 'html',
      handlebars: 'html',
      razor: 'html',
      typescript: 'typescript',
      javascript: 'typescript',
    };
    scope.MonacoEnvironment = {
      getWorkerUrl: (_module, label) => '/monaco/' + (workers[label] ?? 'editor') + '.worker.js',
    };
    function ready() {
      if (!scope.DevAtlasMonaco) {
        reject(new Error('Local editor did not initialize.'));
        return;
      }
      // Monaco 0.57's ESM entry exports language defaults at the top level;
      // preserve the conventional API used by existing editor integrations.
      const api = scope.DevAtlasMonaco as Monaco & {
        typescript?: Monaco['languages']['typescript'];
      };
      if (api.typescript) Object.assign(api.languages, { typescript: api.typescript });
      scope.monaco = scope.DevAtlasMonaco;
      // Configure before mounting @monaco-editor/react, so it never downloads AMD.
      loader.config({ monaco: scope.DevAtlasMonaco });
      resolve();
    }
    if (scope.DevAtlasMonaco) {
      ready();
      return;
    }
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/monaco/editor.css';
    stylesheet.onerror = () => reject(new Error('Local editor styles unavailable.'));
    document.head.appendChild(stylesheet);
    const script = document.createElement('script');
    script.src = '/monaco/editor.js';
    script.async = true;
    script.onload = ready;
    script.onerror = () => reject(new Error('Local editor bundle unavailable.'));
    document.head.appendChild(script);
  });
  return localEditor;
}

export function editorLanguage(path = '', explicit?: string) {
  if (explicit) return explicit;
  if (/\.html?$/i.test(path)) return 'html';
  if (/\.(css|scss)$/i.test(path)) return 'css';
  if (/\.(js|jsx|mjs)$/i.test(path)) return 'javascript';
  if (/\.py$/i.test(path)) return 'python';
  if (/\.(cpp|cc|cxx|hpp)$/i.test(path)) return 'cpp';
  if (/\.json$/i.test(path)) return 'json';
  return 'typescript';
}

const configure: BeforeMount = (monaco) => {
  const defaults = monaco.languages.typescript;
  for (const target of [defaults.typescriptDefaults, defaults.javascriptDefaults]) {
    target.setCompilerOptions({
      target: defaults.ScriptTarget.ES2022,
      allowNonTsExtensions: true,
      allowJs: true,
      jsx: defaults.JsxEmit.Preserve,
      moduleResolution: defaults.ModuleResolutionKind.NodeJs,
      noEmit: true,
      strict: false,
    });
    // Real syntax/type checks remain enabled. Package resolution is not a learner
    // error in single-file React examples, which do not include node_modules.
    target.setDiagnosticsOptions({
      noSyntaxValidation: false,
      noSemanticValidation: false,
      diagnosticCodesToIgnore: [2307, 2792, 2875],
    });
  }
};

export default function MonacoCodeEditor({
  value,
  onChange,
  path = 'solution.ts',
  language,
  label,
  height = 380,
  pasteGuard = false,
  emmet,
}: CodeEditorProps) {
  const copy = EDITOR_COPY[useLearningStore((state) => state.language)];
  const [status, setStatus] = useState<'loading' | 'initialized' | 'ready' | 'failed'>('loading');
  const [pasteNotice, setPasteNotice] = useState(false);
  const cleanup = useRef<Array<() => void>>([]);
  useEffect(
    () => () => {
      cleanup.current.forEach((dispose) => dispose());
      cleanup.current = [];
    },
    [],
  );
  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      if (active) setStatus((previous) => (previous === 'ready' ? previous : 'failed'));
    }, 12000);
    loadLocalEditor()
      .then(() => {
        if (active) setStatus((previous) => (previous === 'failed' ? previous : 'initialized'));
      })
      .catch(() => {
        if (active) setStatus('failed');
      });
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);
  const mount: OnMount = (editor, monaco) => {
    setStatus('ready');
    editor.updateOptions({ ariaLabel: label });
    if (pasteGuard) {
      // Practice is typed by hand: a large paste is undone, short snippets stay.
      const listener = editor.onDidPaste((event) => {
        const pasted = editor.getModel()?.getValueInRange(event.range) ?? '';
        if (pasted.replace(/\s/g, '').length <= PRACTICE_PASTE_LIMIT) return;
        editor.trigger('practice-paste-guard', 'undo', null);
        setPasteNotice(true);
      });
      cleanup.current.push(() => listener.dispose());
    }
    const lang = editorLanguage(path, language);
    if (emmet && (lang === 'html' || lang === 'css')) {
      import('emmet-monaco-es')
        .then((module) => {
          const dispose =
            lang === 'html' ? module.emmetHTML(monaco, ['html']) : module.emmetCSS(monaco, ['css']);
          cleanup.current.push(dispose);
        })
        .catch(() => undefined);
    }
  };
  if (status === 'failed')
    return (
      <div className="editor-fallback">
        <p role="status">{copy.unavailable}</p>
        <textarea
          className="code-editor"
          aria-label={label}
          value={value}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  if (status === 'loading')
    return (
      <div className="code-editor-loading" role="status">
        {copy.loading}
      </div>
    );
  const lang = editorLanguage(path, language);
  const emmetNotice =
    emmet === undefined || (lang !== 'html' && lang !== 'css') ? null : (
      <p className="small muted editor-notice">{emmet ? copy.emmetOn : copy.emmetOff}</p>
    );
  return (
    <>
      {emmetNotice}
      {pasteNotice && (
        <p className="warning-text small editor-notice" role="status">
          {copy.pasteBlocked}
        </p>
      )}
      <Editor
        height={height}
        path={path}
        language={editorLanguage(path, language)}
        value={value}
        theme="vs-dark"
        beforeMount={configure}
        onMount={mount}
        onChange={(next) => onChange(next ?? '')}
        loading={
          <div className="code-editor-loading" role="status">
            {copy.loading}
          </div>
        }
        options={{
          ariaLabel: label,
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 23,
          tabSize: 2,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          formatOnPaste: true,
          renderValidationDecorations: 'on',
          accessibilitySupport: 'on',
          bracketPairColorization: { enabled: true },
        }}
      />
    </>
  );
}
