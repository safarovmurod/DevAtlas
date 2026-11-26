'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Award, Copy, Flame, Play, RotateCcw, Share2, Swords, Trophy, Zap } from 'lucide-react';
import { useAccount } from '@/components/account/account-provider';
import { PageHeading } from '@/components/learning/page-heading';
import {
  computeArenaScore,
  decodeArenaChallenge,
  encodeArenaChallenge,
  selectArenaQuestions,
  type ArenaChallenge,
  type ArenaTrack,
} from '@/lib/arena/arena-engine';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

type LeaderboardRow = {
  id: string;
  displayName: string;
  track: string;
  score: number;
  correctCount: number;
};

const ARENA_COPY: Record<
  InterfaceLocale,
  {
    title: string;
    subtitle: string;
    startDuel: string;
    trackMixed: string;
    challengeBanner: (name: string, score: number) => string;
    timeLeft: string;
    questionOf: (cur: number, total: number) => string;
    yourScore: string;
    beatChallenge: string;
    almostChallenge: string;
    copyChallenge: string;
    copied: string;
    shareTelegram: string;
    playAgain: string;
    leaderboardTitle: string;
    leaderboardEmpty: string;
    leaderboardOffline: string;
    badgesTitle: string;
    badgeDuelist: string;
    badgeSharp: string;
    badgeSpeed: string;
  }
> = {
  tg: {
    title: 'Аренаи Ҷанги Код 1v1 ва Рейтинг',
    subtitle:
      'Дар 2 дақиқа ба 6 саволи техникӣ ҷавоб диҳед, хол ҷамъ кунед ва линки дуэлро ба дӯстонатон дар Telegram фиристед!',
    startDuel: 'Оғози мусобиқаи 2-дақиқаӣ',
    trackMixed: 'Омехта (Ҳама)',
    challengeBanner: (name, score) => `⚔️ Даъвати дуэл аз ${name}: метавонӣ аз ${score} хол зиёд гирӣ?`,
    timeLeft: 'Вақт',
    questionOf: (cur, total) => `Саволи ${cur} аз ${total}`,
    yourScore: 'Холи ниҳоии шумо',
    beatChallenge: '🏆 Табрик! Шумо рекорди дӯстатонро шикастед!',
    almostChallenge: '🔥 Хеле наздик! Бори дигар кӯшиш кунед ва рекордро шиканед.',
    copyChallenge: 'Нусхаи линки дуэл 1v1',
    copied: 'Нусхабардорӣ шуд!',
    shareTelegram: 'Дӯстатро ба Telegram даъват кун',
    playAgain: 'Бозии нав',
    leaderboardTitle: 'Рейтинги ҳафтаина (Топ-25)',
    leaderboardEmpty: 'Ҳоло ягон натиҷа дар рейтинги ҳафта нест — аввалин шавед!',
    leaderboardOffline: 'Рейтинги умумӣ пас аз пайвасти Supabase фаъол мешавад. Натиҷаи шумо дар ҳамин браузер нигоҳ дошта мешавад.',
    badgesTitle: 'Нишонҳои шумо (Badges)',
    badgeDuelist: 'Ҷанговари Арена',
    badgeSharp: 'Дақиқияти баланд (5+/6)',
    badgeSpeed: 'Суръати барқӣ (650+ хол)',
  },
  ru: {
    title: 'Арена 1v1 и недельный рейтинг',
    subtitle:
      'Ответьте на 6 технических вопросов за 2 минуты, наберите максимум очков и отправьте ссылку-вызов другу в Telegram!',
    startDuel: 'Начать дуэль (2 минуты)',
    trackMixed: 'Микс (Все)',
    challengeBanner: (name, score) => `⚔️ Вызов от ${name}: сможешь побить ${score} очков?`,
    timeLeft: 'Время',
    questionOf: (cur, total) => `Вопрос ${cur} из ${total}`,
    yourScore: 'Ваш итоговый счёт',
    beatChallenge: '🏆 Победа! Вы побили рекорд соперника!',
    almostChallenge: '🔥 Почти получилось! Попробуйте ещё раз.',
    copyChallenge: 'Скопировать ссылку-вызов 1v1',
    copied: 'Скопировано!',
    shareTelegram: 'Бросить вызов в Telegram',
    playAgain: 'Сыграть снова',
    leaderboardTitle: 'Недельный рейтинг (Топ-25)',
    leaderboardEmpty: 'На этой неделе результатов ещё нет — станьте первым!',
    leaderboardOffline: 'Глобальный рейтинг включается после подключения Supabase. Ваш лучший счёт сохранён локально.',
    badgesTitle: 'Ваши достижения (Badges)',
    badgeDuelist: 'Участник Арены',
    badgeSharp: 'Точный удар (5+/6)',
    badgeSpeed: 'Молния (650+ очков)',
  },
  en: {
    title: 'Code Duel Arena (1v1) & Weekly Leaderboard',
    subtitle:
      'Beat 6 technical questions in 2 minutes, earn speed bonuses, and send a 1v1 challenge link to friends on Telegram.',
    startDuel: 'Start 2-Minute Duel',
    trackMixed: 'Mixed (All)',
    challengeBanner: (name, score) => `⚔️ 1v1 Challenge from ${name}: Can you beat ${score} pts?`,
    timeLeft: 'Time',
    questionOf: (cur, total) => `Question ${cur} of ${total}`,
    yourScore: 'Final Score',
    beatChallenge: '🏆 Victory! You beat your friend’s score!',
    almostChallenge: '🔥 Close run! Play again to beat the target.',
    copyChallenge: 'Copy 1v1 Challenge Link',
    copied: 'Copied!',
    shareTelegram: 'Challenge a friend on Telegram',
    playAgain: 'Play Again',
    leaderboardTitle: 'Weekly Leaderboard (Top 25)',
    leaderboardEmpty: 'No weekly scores yet — claim #1 right now!',
    leaderboardOffline: 'Global leaderboard syncs once Supabase is configured. Your personal best stays saved locally.',
    badgesTitle: 'Your Badges',
    badgeDuelist: 'Arena Challenger',
    badgeSharp: 'Sharpshooter (5+/6)',
    badgeSpeed: 'Lightning Coder (650+ pts)',
  },
  es: {
    title: 'Arena 1v1 y Ranking Semanal',
    subtitle:
      'Responde 6 preguntas técnicas en 2 minutos y envía un enlace de duelo 1v1 a tus amigos por Telegram.',
    startDuel: 'Iniciar duelo (2 min)',
    trackMixed: 'Mixto (Todos)',
    challengeBanner: (name, score) => `⚔️ Reto de ${name}: ¿puedes superar ${score} puntos?`,
    timeLeft: 'Tiempo',
    questionOf: (cur, total) => `Pregunta ${cur} de ${total}`,
    yourScore: 'Puntuación final',
    beatChallenge: '🏆 ¡Victoria! Superaste el puntaje del reto.',
    almostChallenge: '🔥 ¡Muy cerca! Inténtalo de nuevo.',
    copyChallenge: 'Copiar enlace de duelo 1v1',
    copied: '¡Copiado!',
    shareTelegram: 'Retar en Telegram',
    playAgain: 'Jugar otra vez',
    leaderboardTitle: 'Ranking semanal (Top 25)',
    leaderboardEmpty: 'Aún no hay puntuaciones esta semana — ¡sé el primero!',
    leaderboardOffline: 'El ranking global se activa al conectar Supabase. Tu récord se guarda localmente.',
    badgesTitle: 'Tus insignias',
    badgeDuelist: 'Retador de Arena',
    badgeSharp: 'Puntería alta (5+/6)',
    badgeSpeed: 'Velocidad rayo (650+ pts)',
  },
};

export function ArenaScreen() {
  const locale = useLearningStore((s) => s.language);
  const account = useAccount();
  const copy = ARENA_COPY[locale];

  const [incomingChallenge, setIncomingChallenge] = useState<ArenaChallenge | null>(null);
  const [track, setTrack] = useState<ArenaTrack>('mixed');
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [copied, setCopied] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [boardConfigured, setBoardConfigured] = useState<boolean | null>(null);

  const playerName =
    account.profile?.displayName?.trim() || account.user?.email?.split('@')[0] || 'DevAtlas Player';

  const questions = useMemo(() => selectArenaQuestions(track, 6), [track]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const decoded = decodeArenaChallenge(params.get('challenge'));
      if (decoded) {
        queueMicrotask(() => {
          setIncomingChallenge(decoded);
          setTrack(decoded.track);
        });
      }
    } catch {
      // Ignore query parse failures.
    }

    fetch('/api/arena/leaderboard')
      .then((res) => res.json())
      .then((data: { configured?: boolean; entries?: LeaderboardRow[] }) => {
        setBoardConfigured(Boolean(data.configured));
        setLeaderboard(Array.isArray(data.entries) ? data.entries : []);
      })
      .catch(() => setBoardConfigured(false));
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPhase('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const finalScore = computeArenaScore({ correctCount, secondsLeft, bestStreak });

  function startDuel() {
    setIndex(0);
    setSecondsLeft(120);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setPhase('playing');
  }

  function submitScore(score: number, correct: number) {
    void fetch('/api/arena/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: playerName,
        track,
        score,
        correctCount: correct,
      }),
    })
      .then(() => fetch('/api/arena/leaderboard'))
      .then((res) => res.json())
      .then((data: { configured?: boolean; entries?: LeaderboardRow[] }) => {
        if (Array.isArray(data.entries)) setLeaderboard(data.entries);
      })
      .catch(() => undefined);
  }

  function chooseOption(optionIdx: number) {
    const q = questions[index];
    if (!q) return;
    const isRight = optionIdx === q.correctIndex;
    const nextCorrect = isRight ? correctCount + 1 : correctCount;
    const nextStreak = isRight ? streak + 1 : 0;
    const nextBest = Math.max(bestStreak, nextStreak);
    setCorrectCount(nextCorrect);
    setStreak(nextStreak);
    setBestStreak(nextBest);

    if (index + 1 >= questions.length) {
      const score = computeArenaScore({
        correctCount: nextCorrect,
        secondsLeft,
        bestStreak: nextBest,
      });
      setPhase('done');
      submitScore(score, nextCorrect);
    } else {
      setIndex((prev) => prev + 1);
    }
  }

  const challengeToken = encodeArenaChallenge({
    challenger: playerName,
    track,
    targetScore: finalScore,
    correctCount,
  });
  const challengePath = `/arena?challenge=${challengeToken}`;
  const challengeUrl =
    typeof window === 'undefined' ? challengePath : `${window.location.origin}${challengePath}`;

  async function copyChallengeLink() {
    try {
      await navigator.clipboard.writeText(challengeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard failures.
    }
  }

  const currentQuestion = questions[index];

  return (
    <section className="space-y-6">
      <PageHeading title={copy.title} subtitle={copy.subtitle} />

      {incomingChallenge && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm font-semibold text-foreground">
          <span>{copy.challengeBanner(incomingChallenge.challenger, incomingChallenge.targetScore)}</span>
          <Swords size={20} className="text-amber-500" aria-hidden="true" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Duel Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--depth-1)]">
          {phase === 'idle' && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'mixed', label: copy.trackMixed },
                    { id: 'frontend', label: 'Frontend' },
                    { id: 'backend', label: 'Backend' },
                    { id: 'python', label: 'Python' },
                    { id: 'ai', label: 'AI' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTrack(item.id)}
                    className={
                      'rounded-xl border px-3.5 py-2 text-xs font-semibold ' +
                      (track === item.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted/40 text-foreground')
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={startDuel}
                className="button primary inline-flex items-center gap-2"
              >
                <Play size={16} aria-hidden="true" />
                {copy.startDuel}
              </button>
            </div>
          )}

          {phase === 'playing' && currentQuestion && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>{copy.questionOf(index + 1, questions.length)}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 font-mono text-brand">
                  <Zap size={13} aria-hidden="true" />
                  {copy.timeLeft}: {secondsLeft}s
                </span>
              </div>
              <h2 className="m-0 text-lg font-bold text-foreground">
                {currentQuestion.prompt[locale]}
              </h2>
              <div className="grid gap-2.5">
                {currentQuestion.options[locale].map((option, optIdx) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => chooseOption(optIdx)}
                    className="rounded-xl border border-border bg-muted/30 px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary-soft/50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="m-0 text-xs text-muted-foreground">{copy.yourScore}</p>
                  <p className="m-0 mt-1 text-4xl font-bold tabular-nums text-foreground">
                    {finalScore}
                  </p>
                  <p className="m-0 mt-1 text-xs text-muted-foreground">
                    {correctCount} / {questions.length} · {secondsLeft}s left
                  </p>
                </div>
                <Trophy size={40} className="text-amber-500" aria-hidden="true" />
              </div>

              {incomingChallenge && (
                <p className="m-0 rounded-xl border border-border bg-muted/40 p-3 text-sm font-semibold text-foreground">
                  {finalScore > incomingChallenge.targetScore
                    ? copy.beatChallenge
                    : copy.almostChallenge}
                </p>
              )}

              <div className="space-y-2">
                <p className="m-0 text-xs font-semibold text-muted-foreground">{copy.badgesTitle}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-brand">
                    <Award size={13} aria-hidden="true" /> {copy.badgeDuelist}
                  </span>
                  {correctCount >= 5 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Flame size={13} aria-hidden="true" /> {copy.badgeSharp}
                    </span>
                  )}
                  {finalScore >= 650 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                      <Zap size={13} aria-hidden="true" /> {copy.badgeSpeed}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => void copyChallengeLink()}
                  className="button primary inline-flex items-center gap-2 text-xs"
                >
                  <Copy size={15} aria-hidden="true" />
                  {copied ? copy.copied : copy.copyChallenge}
                </button>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(challengeUrl)}&text=${encodeURIComponent(
                    `⚔️ DevAtlas Arena: ${playerName} scored ${finalScore} pts! Can you beat it?`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button subtle inline-flex items-center gap-2 text-xs no-underline"
                >
                  <Share2 size={15} aria-hidden="true" />
                  {copy.shareTelegram}
                </a>
                <button
                  type="button"
                  onClick={startDuel}
                  className="button subtle inline-flex items-center gap-1.5 text-xs"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  {copy.playAgain}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--depth-1)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="m-0 flex items-center gap-2 text-base font-semibold text-foreground">
              <Trophy size={18} className="text-amber-500" aria-hidden="true" />
              {copy.leaderboardTitle}
            </h2>
            <Link href="/courses" className="text-xs font-medium text-brand no-underline hover:underline">
              DevAtlas
            </Link>
          </div>
          {boardConfigured === false ? (
            <p className="mt-3 mb-0 text-xs leading-5 text-muted-foreground">
              {copy.leaderboardOffline}
            </p>
          ) : leaderboard.length === 0 ? (
            <p className="mt-3 mb-0 text-xs leading-5 text-muted-foreground">
              {copy.leaderboardEmpty}
            </p>
          ) : (
            <ol className="mt-4 mb-0 list-none space-y-2 p-0">
              {leaderboard.map((row, rank) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-brand">#{rank + 1}</span>
                    <span className="font-medium text-foreground">{row.displayName}</span>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                    {row.score} pts
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
