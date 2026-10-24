'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, X, Send, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { siteGuideAnswer, guideContext, agentGreeting, agentQuickPrompts } from '@/lib/agent/site-agent';
import type { SiteGuideLink } from '@/lib/agent/site-agent';
import type { InterfaceLocale } from '@/lib/locale';

interface AgentMsg {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  kind?: 'guide' | 'materials' | 'error';
  links?: SiteGuideLink[];
}

const CHAT_KEY = 'devatlas-agent-chat-v1';
const VOICE_KEY = 'devatlas-agent-voice-v1';

function speak(text: string, language: InterfaceLocale) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, '').slice(0, 600));
  const locale = language === 'ru' ? 'ru-RU' : language === 'tg' ? 'tg-TG' : language === 'uk' ? 'uk-UA' : language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : 'en-US';
  utterance.lang = locale;
  const voice = window.speechSynthesis.getVoices().find(candidate => candidate.lang.toLowerCase().startsWith(locale.slice(0, 2)));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function SiteAgent() {
  const language = useLearningStore(state => state.language);
  const uiLanguage = useLearningStore(state => state.language);
  const courseId = useLearningStore(state => state.selectedCourse);
  const progress = useLearningStore(state => courseId==='react' ? undefined : state.courses[courseId]);
  const tutorOpen = useAppStore(state => state.tutorDrawerOpen);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(false);
  const [messages, setMessages] = useState<AgentMsg[] | null>(null);
  const sending = useRef(false);
  const list = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Render-phase restore from localStorage (React's adjust-state pattern, as in
  // AccountShell): the first client render hydrates the saved chat or greets.
  if (messages === null) {
    let restored: AgentMsg[] | null = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(CHAT_KEY);
        if (raw) restored = JSON.parse(raw) as AgentMsg[];
      } catch { /* corrupted history falls back to the greeting */ }
    }
    setMessages(restored ?? [{ id: 'greeting', sender: 'assistant', kind: 'guide', text: agentGreeting(language) }]);
  }
  if (typeof window !== 'undefined' && localStorage.getItem(VOICE_KEY) === 'on' && !voice) {
    // One-time render-phase read; the toggle keeps working from here on.
    setVoice(true);
  }

  useEffect(() => {
    if (!messages) return;
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-40))); } catch { /* storage full — chat still works in memory */ }
  }, [messages]);

  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [messages, loading, open]);

  function toggleVoice() {
    const next = !voice;
    setVoice(next);
    try { localStorage.setItem(VOICE_KEY, next ? 'on' : 'off'); } catch { /* preference is cosmetic */ }
    if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function push(message: AgentMsg) {
    setMessages(previous => {
      const next = [...(previous ?? []), message];
      return next.length > 40 ? next.slice(next.length - 40) : next;
    });
    if (message.sender === 'assistant' && voice && message.kind !== 'error') speak(message.text, uiLanguage);
  }

  function ask(text: string) {
    if (sending.current || !text.trim()) return;
    sending.current = true;
    setLoading(true);
    push({ id: crypto.randomUUID(), sender: 'user', text: text.trim() });
    setInput('');
    const context = guideContext({
      language: uiLanguage,
      selectedCourse: courseId,
      progress: progress ?? { completedTopics: [], completedPractice: [], confirmedDays: [], masteredQuestions: [] },
    });
    const guide = siteGuideAnswer(text, context);
    if (guide) {
      const linksLine = guide.links.map(link => link.label).join(' · ');
      push({ id: crypto.randomUUID(), sender: 'assistant', kind: 'guide', text: guide.reply + (linksLine ? '\n\n' + linksLine : ''), links: guide.links });
      setLoading(false);
      sending.current = false;
      inputRef.current?.focus();
      return;
    }
    // Lesson-content question: forward to the reviewed course answer library.
    void (async () => {
      try {
        const session = await getSupabaseBrowserClient()?.auth.getSession();
        const token = session?.data.session?.access_token;
        const response = await fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
          body: JSON.stringify({ action: 'ask', courseId, userText: text.trim(), isDeep: false, language: uiLanguage === 'uk' ? 'ru' : uiLanguage === 'ja' || uiLanguage === 'ko' ? 'en' : uiLanguage }),
          signal: AbortSignal.timeout(50000),
        });
        const data = await response.json();
        if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
          push({ id: crypto.randomUUID(), sender: 'assistant', kind: 'error', text: language === 'ru'
            ? 'В библиотеке ответов курса на это точного ответа нет. Попробуйте спросить иначе — например, название темы из плана, — или откройте раздел «Ответы» курса.'
            : language === 'tg'
              ? 'Дар китобхонаи ҷавобҳо ҷавоби дақиқ нест. Дигар пурсед — масалан, номи мавзӯъ аз нақша — ё бахши «Ҷавобҳо»-и курсро кушоед.'
              : 'The course answer library has no exact match. Try rephrasing — for example a topic name from the plan — or open the course’s Answers section.', links: [] });
          return;
        }
        const source = data.source as { title?: string; href?: string } | undefined;
        push({
          id: crypto.randomUUID(), sender: 'assistant', kind: 'materials', text: data.reply,
          links: source?.href ? [{ href: source.href, label: source.title ?? '' }] : [],
        });
      } catch {
        push({ id: crypto.randomUUID(), sender: 'assistant', kind: 'error', text: language === 'ru'
          ? 'Сервис ответов сейчас недоступен. Руководство по платформе я по-прежнему подскажу: спросите «что дальше?», «где практи‑ка», «как считается мастерство».'
          : language === 'tg'
            ? 'Хидмати ҷавобҳо ҳоло дастрас нест. Роҳнамоии платформаро мегӯям: «чи дарозтар?», «машқ дар куҷо?», «мастерство чӣ тавр?».'
            : 'The answer service is unavailable right now. I can still guide the platform: ask “what next?”, “where is practice”, “how does mastery work”.', links: [] });
      } finally {
        sending.current = false;
        setLoading(false);
        inputRef.current?.focus();
      }
    })();
  }

  const chips = agentQuickPrompts(uiLanguage);
  const bubbleLabel = uiLanguage === 'ru' ? 'Ассистент DevAtlas' : uiLanguage === 'tg' ? 'Ёрдамчии DevAtlas' : 'DevAtlas assistant';

  return <>
    {!tutorOpen && <button
      type="button"
      className={'agent-bubble' + (open ? ' is-open' : '')}
      aria-expanded={open}
      aria-label={bubbleLabel}
      title={bubbleLabel}
      onClick={() => setOpen(value => !value)}
    ><Bot size={24}/><span className="agent-pulse" aria-hidden="true"/></button>}
    {open && <aside className="agent-panel" role="dialog" aria-label={bubbleLabel}>
      <header className="agent-heading">
        <div><h2><Bot size={18}/>{bubbleLabel}</h2><p>{uiLanguage === 'ru' ? 'Роҳнамоӣ дар платформа + ҷавобҳо аз материалҳо' : uiLanguage === 'tg' ? 'Роҳнамоии платформа + ҷавобҳо аз материалҳо' : 'Platform guide + answers from course materials'}</p></div>
        <div className="agent-tools">
          <button type="button" className={'icon-button' + (voice ? ' is-active' : '')} onClick={toggleVoice} aria-pressed={voice} aria-label={voice ? (uiLanguage === 'ru' ? 'Выключить голос' : uiLanguage === 'tg' ? 'Овозро хомӯш кун' : 'Turn voice off') : uiLanguage === 'ru' ? 'Включить голос' : uiLanguage === 'tg' ? 'Овозро фаъол кун' : 'Turn voice on'} title={voice ? (uiLanguage === 'ru' ? 'Голос включён' : 'Voice on') : uiLanguage === 'ru' ? 'Голос выключен' : 'Voice off'}>
            {voice ? <Volume2 size={17}/> : <VolumeX size={17}/>}
          </button>
          <button type="button" className="icon-button" onClick={() => { setMessages([{ id: crypto.randomUUID(), sender: 'assistant', kind: 'guide', text: agentGreeting(uiLanguage) }]); }} aria-label={uiLanguage === 'ru' ? 'Очистить чат' : uiLanguage === 'tg' ? 'Чатро тоза кардан' : 'Clear chat'} title={uiLanguage === 'ru' ? 'Очистить чат' : 'Clear chat'}><Trash2 size={16}/></button>
          <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label={uiLanguage === 'ru' ? 'Закрыть' : uiLanguage === 'tg' ? 'Пӯшидан' : 'Close'}><X size={18}/></button>
        </div>
      </header>
      <div className="agent-messages" aria-live="polite" ref={list}>
        {(messages ?? []).map(message => <div key={message.id} className={'agent-message ' + message.sender}>
          {message.kind && message.sender === 'assistant' && <span className="agent-kind">{message.kind === 'guide' ? (uiLanguage === 'ru' ? 'Гид по платформе' : uiLanguage === 'tg' ? 'Роҳнамо' : 'Platform guide') : message.kind === 'materials' ? (uiLanguage === 'ru' ? 'Из материалов курса' : uiLanguage === 'tg' ? 'Аз материалҳои курс' : 'From course materials') : (uiLanguage === 'ru' ? 'Не нашёл' : uiLanguage === 'tg' ? 'Наёфтам' : 'No match')}</span>}
          <p>{message.text}</p>
          {message.links?.length ? <div className="agent-links">{message.links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}</div> : null}
        </div>)}
        {loading && <p role="status" className="agent-loading">{uiLanguage === 'ru' ? 'Думаю…' : uiLanguage === 'tg' ? 'Фикр мекунам…' : 'Thinking…'}</p>}
      </div>
      <div className="agent-composer">
        <div className="agent-chips">{chips.map(chip => <button key={chip} type="button" disabled={loading} onClick={() => ask(chip)}>{chip}</button>)}</div>
        <form onSubmit={event => { event.preventDefault(); void ask(input); }}>
          <label className="sr-only" htmlFor="agent-input">{uiLanguage === 'ru' ? 'Вопрос ассистенту' : uiLanguage === 'tg' ? 'Савол ба ёрдамчӣ' : 'Ask the assistant'}</label>
          <textarea id="agent-input" ref={inputRef} value={input} rows={2} maxLength={800} disabled={loading}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void ask(input); } }}
            placeholder={uiLanguage === 'ru' ? 'Спросите про платформу или тему урока…' : uiLanguage === 'tg' ? 'Дар бораи платформа ё мавзӯъ пурсед…' : 'Ask about the platform or a lesson topic…'}/>
          <button className="button primary" type="submit" disabled={loading || !input.trim()} aria-label={uiLanguage === 'ru' ? 'Отправить' : uiLanguage === 'tg' ? 'Фиристодан' : 'Send'}><Send size={16}/></button>
        </form>
        <p className="agent-footnote">{uiLanguage === 'ru' ? 'Гид отвечает по устройству платформы; вопросы по урокам — из проверенных материалов курса. Без выдумок.' : uiLanguage === 'tg' ? 'Роҳнамо сохтори платформаро мефаҳмонад; саволҳои дарсӣ аз материалҳои санҷидашуда. Бе дурӯғ.' : 'The guide explains the platform; lesson questions come from reviewed course materials. No inventions.'}</p>
      </div>
    </aside>}
  </>;
}
