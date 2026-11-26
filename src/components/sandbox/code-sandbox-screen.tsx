'use client';

import { useEffect, useState } from 'react';
import { Download, ExternalLink, Play, RotateCcw, Terminal } from 'lucide-react';
import type { SandboxLanguage } from '@/app/api/code-runner/route';
import { PageHeading } from '@/components/learning/page-heading';
import type { InterfaceLocale } from '@/lib/locale';
import {
  SANDBOX_TEMPLATES,
  createGitHubStarterZip,
  runJavaScriptLocally,
} from '@/lib/sandbox/sandbox-templates';
import { useLearningStore } from '@/stores/learning-store';

const SANDBOX_COPY: Record<
  InterfaceLocale,
  {
    title: string;
    subtitle: string;
    run: string;
    running: string;
    reset: string;
    downloadZip: string;
    openGithub: string;
    projectName: string;
    stdinLabel: string;
    outputLabel: string;
    emptyOutput: string;
    browserRunnerBadge: string;
    serverConnected: string;
    serverMissing: string;
  }
> = {
  tg: {
    title: 'Code Sandbox & Экспорт ба GitHub',
    subtitle:
      'Коди Python, JavaScript, TypeScript, C++, Java, Go, Rust, PHP, Ruby ва Bash-ро санҷед ва ҳамчун лоиҳаи тайёр барои GitHub зеркашӣ кунед.',
    run: 'Иҷро (Run)',
    running: 'Иҷро шуда истодааст…',
    reset: 'Аз нав',
    downloadZip: 'Зеркашии ZIP барои GitHub',
    openGithub: 'Кушодани GitHub Repo',
    projectName: 'Номи лоиҳа',
    stdinLabel: 'Вуруд (stdin — ихтиёрӣ)',
    outputLabel: 'Натиҷаи консоль',
    emptyOutput: 'Тугмаи «Иҷро (Run)»-ро пахш кунед, то натиҷа дар ин ҷо барояд.',
    browserRunnerBadge: 'JavaScript рост дар браузер кор мекунад',
    serverConnected: 'Сервери иҷрои 11 забон пайваст аст',
    serverMissing:
      'Барои Python/C++/Java/Go дар `.env.local` калиди `CODE_RUNNER_API_URL` (Piston API)-ро пайваст кунед. JavaScript ҳозир дар браузер кор мекунад.',
  },
  ru: {
    title: 'Code Sandbox и экспорт в GitHub',
    subtitle:
      'Пишите и запускайте код на Python, JavaScript, TypeScript, C++, Java, Go, Rust, PHP, Ruby и Bash, а затем экспортируйте готовый репозиторий для GitHub.',
    run: 'Запустить (Run)',
    running: 'Выполняется…',
    reset: 'Сбросить',
    downloadZip: 'Скачать GitHub ZIP',
    openGithub: 'Создать репо на GitHub',
    projectName: 'Имя проекта',
    stdinLabel: 'Входные данные (stdin — опционально)',
    outputLabel: 'Вывод консоли',
    emptyOutput: 'Нажмите «Запустить (Run)», чтобы увидеть вывод программы.',
    browserRunnerBadge: 'JavaScript запускается прямо в браузере',
    serverConnected: 'Серверный раннер для 11 языков подключён',
    serverMissing:
      'Для Python/C++/Java/Go задайте `CODE_RUNNER_API_URL` (Piston API) на сервере. JavaScript уже работает локально в браузере.',
  },
  en: {
    title: 'Multi-Language Code Sandbox & GitHub Export',
    subtitle:
      'Write and run Python, JavaScript, TypeScript, C++, Java, Go, Rust, PHP, Ruby, and Bash, then export a GitHub-ready repository bundle.',
    run: 'Run Code',
    running: 'Running…',
    reset: 'Reset',
    downloadZip: 'Download GitHub ZIP',
    openGithub: 'New GitHub Repo',
    projectName: 'Project name',
    stdinLabel: 'Standard input (stdin — optional)',
    outputLabel: 'Console Output',
    emptyOutput: 'Click Run Code to inspect stdout and stderr.',
    browserRunnerBadge: 'JavaScript executes natively in an isolated browser worker',
    serverConnected: 'Remote 11-language runner connected',
    serverMissing:
      'Set `CODE_RUNNER_API_URL` (Piston-compatible execute endpoint) on the server for Python/C++/Java/Go. JavaScript runs locally right now.',
  },
  es: {
    title: 'Sandbox Multilenguaje y Exportación GitHub',
    subtitle:
      'Prueba Python, JavaScript, TypeScript, C++, Java, Go, Rust, PHP, Ruby y Bash y descarga un paquete listo para GitHub.',
    run: 'Ejecutar',
    running: 'Ejecutando…',
    reset: 'Reiniciar',
    downloadZip: 'Descargar ZIP GitHub',
    openGithub: 'Nuevo repo GitHub',
    projectName: 'Nombre del proyecto',
    stdinLabel: 'Entrada estándar (stdin)',
    outputLabel: 'Salida de consola',
    emptyOutput: 'Pulsa Ejecutar para ver el resultado.',
    browserRunnerBadge: 'JavaScript se ejecuta directo en el navegador',
    serverConnected: 'Runner remoto conectado para 11 lenguajes',
    serverMissing:
      'Configura `CODE_RUNNER_API_URL` (Piston API) para Python/C++/Java/Go. JavaScript ya funciona localmente.',
  },
};

export function CodeSandboxScreen() {
  const locale = useLearningStore((s) => s.language);
  const copy = SANDBOX_COPY[locale];

  const [language, setLanguage] = useState<SandboxLanguage>('javascript');
  const [code, setCode] = useState(SANDBOX_TEMPLATES[0].starter);
  const [stdin, setStdin] = useState('');
  const [projectName, setProjectName] = useState('devatlas-starter');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [running, setRunning] = useState(false);
  const [serverConfigured, setServerConfigured] = useState<boolean | null>(null);

  const activeTemplate =
    SANDBOX_TEMPLATES.find((item) => item.id === language) ?? SANDBOX_TEMPLATES[0];

  useEffect(() => {
    fetch('/api/code-runner')
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => setServerConfigured(Boolean(data.configured)))
      .catch(() => setServerConfigured(false));
  }, []);

  function switchLanguage(next: SandboxLanguage) {
    const template = SANDBOX_TEMPLATES.find((item) => item.id === next) ?? SANDBOX_TEMPLATES[0];
    setLanguage(next);
    setCode(template.starter);
    setStdout('');
    setStderr('');
  }

  async function handleRun() {
    setRunning(true);
    setStdout('');
    setStderr('');
    try {
      if (language === 'javascript' && !serverConfigured) {
        const local = await runJavaScriptLocally(code);
        setStdout(local.stdout);
        setStderr(local.stderr);
        return;
      }
      const res = await fetch('/api/code-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, stdin }),
      });
      const data = (await res.json()) as { stdout?: string; stderr?: string; message?: string; error?: string };
      if (!res.ok) {
        if (language === 'javascript') {
          const local = await runJavaScriptLocally(code);
          setStdout(local.stdout);
          setStderr(local.stderr);
        } else {
          setStderr(data.message || data.error || 'Execution failed');
        }
        return;
      }
      setStdout(data.stdout || '');
      setStderr(data.stderr || '');
    } catch {
      setStderr('Network error while running code.');
    } finally {
      setRunning(false);
    }
  }

  async function handleExportZip() {
    const blob = await createGitHubStarterZip({
      projectName,
      language,
      filename: activeTemplate.filename,
      code,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.trim() || 'devatlas-project'}.zip`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="space-y-5">
      <PageHeading title={copy.title} subtitle={copy.subtitle} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--depth-1)]">
        <div className="flex flex-wrap gap-1.5">
          {SANDBOX_TEMPLATES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => switchLanguage(item.id)}
              className={
                'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ' +
                (language === item.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted/40 text-foreground hover:border-primary/40')
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {serverConfigured ? copy.serverConnected : copy.browserRunnerBadge}
        </span>
      </div>

      {serverConfigured === false && language !== 'javascript' && (
        <p className="m-0 rounded-xl border border-amber-400/35 bg-amber-500/10 p-3.5 text-xs leading-5 text-foreground">
          {copy.serverMissing}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--depth-1)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {activeTemplate.filename}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCode(activeTemplate.starter)}
                className="button subtle inline-flex items-center gap-1.5 text-xs"
              >
                <RotateCcw size={14} aria-hidden="true" />
                {copy.reset}
              </button>
              <button
                type="button"
                disabled={running || !code.trim()}
                onClick={() => void handleRun()}
                className="button primary inline-flex items-center gap-1.5 text-xs"
              >
                <Play size={14} aria-hidden="true" />
                {running ? copy.running : copy.run}
              </button>
            </div>
          </div>

          <textarea
            rows={14}
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-border bg-[#0b1020] p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-primary"
          />

          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            {copy.stdinLabel}
            <input
              type="text"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 rounded-2xl border border-border bg-[#0b1020] p-4 text-slate-100 shadow-[var(--depth-1)]">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2.5 text-xs font-semibold text-sky-300">
              <Terminal size={15} aria-hidden="true" />
              {copy.outputLabel}
            </div>
            <pre className="mt-3 mb-0 max-h-[280px] overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-emerald-300">
              {stdout || (!stderr ? copy.emptyOutput : '')}
            </pre>
            {stderr && (
              <pre className="mt-2 mb-0 max-h-[180px] overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-rose-300">
                {stderr}
              </pre>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--depth-1)]">
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              {copy.projectName}
              <input
                type="text"
                value={projectName}
                maxLength={60}
                onChange={(e) => setProjectName(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleExportZip()}
                className="button primary inline-flex items-center gap-1.5 text-xs"
              >
                <Download size={14} aria-hidden="true" />
                {copy.downloadZip}
              </button>
              <a
                href={`https://github.com/new?name=${encodeURIComponent(projectName.trim() || 'devatlas-project')}`}
                target="_blank"
                rel="noreferrer"
                className="button subtle inline-flex items-center gap-1.5 text-xs no-underline"
              >
                <ExternalLink size={14} aria-hidden="true" />
                {copy.openGithub}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
