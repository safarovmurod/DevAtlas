'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Bot, X, Send, Volume2, VolumeX, Trash2, Mic, MicOff } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { siteGuideAnswer, guideContext, agentGreeting, agentQuickPrompts } from '@/lib/agent/site-agent';
import {useAccount} from '@/components/account/account-provider';
import {agentStorageKey,readAgentHistory,saveAgentHistory,agentMaterialLink,type AgentMessage as AgentMsg} from '@/lib/agent/private-history';
import type { InterfaceLocale } from '@/lib/locale';
import {LEARNING_UI_COPY,tutorErrorKey} from '@/lib/learning-ui-copy';

function speak(text: string, language: InterfaceLocale) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, '').slice(0, 600));
  const locale = language === 'ru' ? 'ru-RU' : language === 'tg' ? 'tg-TJ' : language === 'uk' ? 'uk-UA' : language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : 'en-US';
  utterance.lang = locale;
  const voice = window.speechSynthesis.getVoices().find(candidate => candidate.lang.toLowerCase().startsWith(locale.slice(0, 2)));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

/** Browser speech-to-text. Chrome/Edge/Safari support it; Firefox does not, so the mic is hidden there. */
type Recognition = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null };
function recognitionConstructor(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}
const noSubscription = () => () => undefined;
const SPEECH_LOCALE: Record<InterfaceLocale, string> = { ru: 'ru-RU', tg: 'tg-TJ', uk: 'uk-UA', ja: 'ja-JP', ko: 'ko-KR', en: 'en-US' };
const MIC_COPY: Record<InterfaceLocale, { start: string; stop: string; listening: string; unsupported: string; denied: string }> = {
  ru: { start: 'Сказать голосом', stop: 'Остановить запись', listening: 'Слушаю… говорите вопрос.', unsupported: 'Браузер не распознаёт этот язык. Переключите язык интерфейса на русский или английский или напишите текстом.', denied: 'Нет доступа к микрофону. Разрешите его в настройках браузера.' },
  tg: { start: 'Бо овоз гуфтан', stop: 'Қатъи сабт', listening: 'Гӯш мекунам… саволро гӯед.', unsupported: 'Браузер забони тоҷикиро бо овоз намешиносад. Саволро бо русӣ ё англисӣ гӯед (забони интерфейсро иваз кунед) ё нависед.', denied: 'Ба микрофон иҷозат нест. Онро дар танзимоти браузер фаъол кунед.' },
  en: { start: 'Ask by voice', stop: 'Stop recording', listening: 'Listening… say your question.', unsupported: 'Your browser cannot recognise this language. Switch the interface to English or Russian, or type instead.', denied: 'Microphone access is blocked. Allow it in your browser settings.' },
  uk: { start: 'Сказати голосом', stop: 'Зупинити запис', listening: 'Слухаю… скажіть запитання.', unsupported: 'Браузер не розпізнає цю мову. Перемкніть інтерфейс на англійську чи російську або напишіть текстом.', denied: 'Немає доступу до мікрофона. Дозвольте його в налаштуваннях браузера.' },
  ja: { start: '音声で質問', stop: '録音を停止', listening: '聞いています… 質問をどうぞ。', unsupported: 'このブラウザーはこの言語を認識できません。文字で入力してください。', denied: 'マイクへのアクセスがブロックされています。ブラウザーの設定で許可してください。' },
  ko: { start: '음성으로 질문', stop: '녹음 중지', listening: '듣고 있어요… 질문을 말하세요.', unsupported: '브라우저가 이 언어를 인식하지 못합니다. 텍스트로 입력하세요.', denied: '마이크 접근이 차단되었습니다. 브라우저 설정에서 허용하세요.' },
};

export function SiteAgent() {
  const {user}=useAccount();
  return <SiteAgentSession key={user?.id??'guest'} owner={user?.id??null}/>;
}
function SiteAgentSession({owner}:{owner:string|null}) {
  const language = useLearningStore(state => state.language);
  const uiLanguage = useLearningStore(state => state.language);
  const courseId = useLearningStore(state => state.selectedCourse);
  const progress = useLearningStore(state => courseId==='react' ? undefined : state.courses[courseId]);
  const tutorOpen = useAppStore(state => state.tutorDrawerOpen);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(()=>{
    try{return typeof window!=='undefined'&&localStorage.getItem(agentStorageKey(owner,'voice'))==='on';}catch{return false;}
  });
  const [messages, setMessages] = useState<AgentMsg[] | null>(null);
  const [listening, setListening] = useState(false);
  const [micNotice, setMicNotice] = useState('');
  const micSupported = useSyncExternalStore(noSubscription, () => recognitionConstructor() !== null, () => false);
  const recognition = useRef<Recognition | null>(null);
  useEffect(() => () => recognition.current?.stop(), []);
  const sending = useRef(false);
  const pending = useRef<AbortController|null>(null);
  const list = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Render-phase restore from localStorage (React's adjust-state pattern, as in
  // AccountShell): the first client render hydrates the saved chat or greets.
  if (messages === null) {
    let restored: AgentMsg[] | null = null;
    if (typeof window !== 'undefined') {
      try {
        restored = readAgentHistory(localStorage,owner);
      } catch { /* corrupted history falls back to the greeting */ }
    }
    setMessages(restored ?? [{ id: 'greeting', sender: 'assistant', kind: 'guide', text: agentGreeting(language) }]);
  }

  useEffect(() => {
    if (!messages) return;
    try { saveAgentHistory(localStorage,owner,messages); } catch { /* storage denied — memory only */ }
  }, [messages,owner]);

  useEffect(()=>()=>{pending.current?.abort();if('speechSynthesis' in window)window.speechSynthesis.cancel();},[]);
  useEffect(()=>{
    if(!open||tutorOpen)return;
    const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const previousOverflow=document.body.style.overflow;
    const media=window.matchMedia?.('(max-width: 560px)');
    const apply=()=>{const modal=media?.matches??false;panel.current?.setAttribute('aria-modal',String(modal));document.body.style.overflow=modal?'hidden':previousOverflow;};
    apply();inputRef.current?.focus();media?.addEventListener('change',apply);
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setOpen(false);return;}
      if(event.key!=='Tab'||!media?.matches)return;
      const controls=panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],textarea:not([disabled])');
      if(!controls?.length)return;
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',onKey);
    return()=>{media?.removeEventListener('change',apply);document.removeEventListener('keydown',onKey);document.body.style.overflow=previousOverflow;if(previousFocus?.isConnected)previousFocus.focus();};
  },[open,tutorOpen]);
  if(tutorOpen&&open)setOpen(false);

  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [messages, loading, open]);

  function toggleVoice() {
    const next = !voice;
    setVoice(next);
    try { localStorage.setItem(agentStorageKey(owner,'voice'), next ? 'on' : 'off'); } catch { /* preference is cosmetic */ }
    if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function toggleMic() {
    const mic = MIC_COPY[uiLanguage];
    if (listening) { recognition.current?.stop(); return; }
    const Constructor = recognitionConstructor();
    if (!Constructor) return;
    const next = new Constructor();
    next.lang = SPEECH_LOCALE[uiLanguage];
    next.interimResults = true;
    next.continuous = false;
    // The transcript lands in the input for review instead of being sent blindly.
    next.onresult = event => setInput(Array.from(event.results).map(result => result[0]?.transcript ?? '').join(' ').slice(0, 800));
    next.onerror = event => setMicNotice(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? mic.denied : event.error === 'language-not-supported' ? mic.unsupported : '');
    next.onend = () => { setListening(false); inputRef.current?.focus(); };
    recognition.current = next;
    setMicNotice('');
    try { next.start(); setListening(true); } catch { setListening(false); }
  }

  function push(message: AgentMsg) {
    setMessages(previous => {
      const next = [...(previous ?? []), message];
      return next.length > 40 ? next.slice(next.length - 40) : next;
    });
    if (message.sender === 'assistant' && voice && message.kind !== 'error') speak(message.text, uiLanguage);
  }

  function cancel() {
    pending.current?.abort();pending.current=null;sending.current=false;setLoading(false);
  }
  function clear() {
    cancel();setMessages([{id:crypto.randomUUID(),sender:'assistant',kind:'guide',text:agentGreeting(uiLanguage)}]);
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
    // Ownership is bound before awaiting auth; a cleared/unmounted chat must
    // never accept a late response, even if the transport ignores cancellation.
    const request=new AbortController();pending.current=request;
    void (async () => {
      try {
        const session = await getSupabaseBrowserClient()?.auth.getSession();
        if(request.signal.aborted)return;
        const activeSession=session?.data.session;
        if((activeSession?.user?.id??null)!==owner)throw new Error('Account changed');
        const token = activeSession?.access_token;
        const response = await fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
          body: JSON.stringify({ action: 'ask', courseId, userText: text.trim(), isDeep: false,
            history:(messages??[]).filter(message=>message.id!=='greeting' && message.kind!=='error' && message.kind!=='notice')
              .slice(-4).map(message=>({role:message.sender==='assistant'?'assistant':'user',content:message.text.slice(0,600)})),
            language: uiLanguage === 'uk' ? 'ru' : uiLanguage === 'ja' || uiLanguage === 'ko' ? 'en' : uiLanguage }),
          signal: AbortSignal.any([request.signal,AbortSignal.timeout(50000)]),
        });
        const data = await response.json();
        if(request.signal.aborted)return;
        if(!response.ok){
          push({id:crypto.randomUUID(),sender:'assistant',kind:'error',text:LEARNING_UI_COPY[uiLanguage][tutorErrorKey(response.status,data.error)]});return;
        }
        if(typeof data.reply!=='string'||!data.reply.trim()){
          push({id:crypto.randomUUID(),sender:'assistant',kind:'error',text:LEARNING_UI_COPY[uiLanguage].tutorEmpty});return;
        }
        const source=agentMaterialLink(data.source);
        push({
          id: crypto.randomUUID(), sender:'assistant',kind:data.mode==='online'?'online':source?'materials':'notice',text:data.reply,
          links:source?[source]:[],
        });
      } catch {
        if(request.signal.aborted)return;
        push({ id: crypto.randomUUID(), sender: 'assistant', kind: 'error', text: language === 'ru'
          ? 'Сервис ответов сейчас недоступен. Руководство по платформе я по-прежнему подскажу: спросите «что дальше?», «где практи‑ка», «как считается мастерство».'
          : language === 'tg'
            ? 'Хидмати ҷавобҳо ҳоло дастрас нест. Роҳнамоии платформаро мегӯям: «чи дарозтар?», «машқ дар куҷо?», «мастерство чӣ тавр?».'
            : 'The answer service is unavailable right now. I can still guide the platform: ask “what next?”, “where is practice”, “how does mastery work”.', links: [] });
      } finally {
        if(pending.current===request){
          pending.current=null;sending.current=false;setLoading(false);inputRef.current?.focus();
        }
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
    {open && !tutorOpen && <aside ref={panel} className="agent-panel" role="dialog" aria-label={bubbleLabel}>
      <header className="agent-heading">
        <div><h2><Bot size={18}/>{bubbleLabel}</h2><p>{uiLanguage === 'ru' ? 'Навигация и ответы из материалов курса' : uiLanguage === 'tg' ? 'Роҳнамоии платформа + ҷавобҳо аз материалҳо' : 'Platform guide + answers from course materials'}</p></div>
        <div className="agent-tools">
          <button type="button" className={'icon-button' + (voice ? ' is-active' : '')} onClick={toggleVoice} aria-pressed={voice} aria-label={voice ? (uiLanguage === 'ru' ? 'Выключить голос' : uiLanguage === 'tg' ? 'Овозро хомӯш кун' : 'Turn voice off') : uiLanguage === 'ru' ? 'Включить голос' : uiLanguage === 'tg' ? 'Овозро фаъол кун' : 'Turn voice on'} title={voice ? (uiLanguage === 'ru' ? 'Голос включён' : 'Voice on') : uiLanguage === 'ru' ? 'Голос выключен' : 'Voice off'}>
            {voice ? <Volume2 size={17}/> : <VolumeX size={17}/>}
          </button>
          <button type="button" className="icon-button" onClick={clear} aria-label={uiLanguage === 'ru' ? 'Очистить чат' : uiLanguage === 'tg' ? 'Чатро тоза кардан' : 'Clear chat'} title={uiLanguage === 'ru' ? 'Очистить чат' : 'Clear chat'}><Trash2 size={16}/></button>
          <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label={uiLanguage === 'ru' ? 'Закрыть' : uiLanguage === 'tg' ? 'Пӯшидан' : 'Close'}><X size={18}/></button>
        </div>
      </header>
      <div className="agent-messages" aria-live="polite" ref={list}>
        {(messages ?? []).map(message => <div key={message.id} className={'agent-message ' + message.sender}>
          {message.kind && message.sender === 'assistant' && <span className="agent-kind">{message.kind === 'guide' ? (uiLanguage === 'ru' ? 'Гид по платформе' : uiLanguage === 'tg' ? 'Роҳнамо' : 'Platform guide') : message.kind === 'materials' ? (uiLanguage === 'ru' ? 'Из материалов курса' : uiLanguage === 'tg' ? 'Аз материалҳои курс' : 'From course materials') : message.kind==='online'?'AI · AnyModel':message.kind==='notice'?LEARNING_UI_COPY[uiLanguage].tutorLocal:(uiLanguage === 'ru' ? 'Не нашёл' : uiLanguage === 'tg' ? 'Наёфтам' : 'No match')}</span>}
          <p>{message.text}</p>
          {message.links?.length ? <div className="agent-links">{message.links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}</div> : null}
        </div>)}
        {loading && <button type="button" className="button subtle" onClick={cancel}>{uiLanguage==='ru'?'Остановить':uiLanguage==='tg'?'Қатъ кардан':uiLanguage==='uk'?'Зупинити':uiLanguage==='ja'?'停止':uiLanguage==='ko'?'중지':'Stop'}</button>}
        {loading && <p role="status" className="agent-loading">{uiLanguage === 'ru' ? 'Думаю…' : uiLanguage === 'tg' ? 'Фикр мекунам…' : 'Thinking…'}</p>}
      </div>
      <div className="agent-composer">
        <p className="agent-footnote">{{ru:'История разделена по аккаунтам и хранится только в этом браузере. Серверная история пока недоступна.',tg:'Таърих барои ҳар ҳисоб ҷудо буда, танҳо дар ҳамин браузер нигоҳ дошта мешавад. Таърихи серверӣ ҳоло дастрас нест.',en:'History is separated by account and stored only in this browser. Server history is not available yet.',uk:'Історія розділена за обліковими записами й зберігається лише в цьому браузері. Серверна історія поки недоступна.',ja:'履歴はアカウントごとに分かれ、このブラウザーにのみ保存されます。サーバー履歴はまだ利用できません。',ko:'기록은 계정별로 분리되어 이 브라우저에만 저장됩니다. 서버 기록은 아직 제공되지 않습니다.'}[uiLanguage]}</p>
        <div className="agent-chips">{chips.map(chip => <button key={chip} type="button" disabled={loading} onClick={() => ask(chip)}>{chip}</button>)}</div>
        <form onSubmit={event => { event.preventDefault(); void ask(input); }}>
          <label className="sr-only" htmlFor="agent-input">{uiLanguage === 'ru' ? 'Вопрос ассистенту' : uiLanguage === 'tg' ? 'Савол ба ёрдамчӣ' : 'Ask the assistant'}</label>
          <textarea id="agent-input" ref={inputRef} value={input} rows={2} maxLength={800} disabled={loading}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void ask(input); } }}
            placeholder={uiLanguage === 'ru' ? 'Спросите про платформу или тему урока…' : uiLanguage === 'tg' ? 'Дар бораи платформа ё мавзӯъ пурсед…' : 'Ask about the platform or a lesson topic…'}/>
          {micSupported && <button type="button" className={'icon-button' + (listening ? ' is-active' : '')} onClick={toggleMic} disabled={loading} aria-pressed={listening} aria-label={listening ? MIC_COPY[uiLanguage].stop : MIC_COPY[uiLanguage].start} title={listening ? MIC_COPY[uiLanguage].stop : MIC_COPY[uiLanguage].start}>{listening ? <MicOff size={17}/> : <Mic size={17}/>}</button>}
          <button className="button primary" type="submit" disabled={loading || !input.trim()} aria-label={uiLanguage === 'ru' ? 'Отправить' : uiLanguage === 'tg' ? 'Фиристодан' : 'Send'}><Send size={16}/></button>
        </form>
        {(listening || micNotice) && <p className={'agent-footnote' + (micNotice ? ' warning-text' : '')} role="status">{micNotice || MIC_COPY[uiLanguage].listening}</p>}
        <p className="agent-footnote">{uiLanguage === 'ru' ? 'Гид отвечает по устройству платформы; вопросы по урокам — из проверенных материалов курса. Без выдумок.' : uiLanguage === 'tg' ? 'Роҳнамо сохтори платформаро мефаҳмонад; саволҳои дарсӣ аз материалҳои санҷидашуда. Бе дурӯғ.' : 'The guide explains the platform; lesson questions come from reviewed course materials. No inventions.'}</p>
      </div>
    </aside>}
  </>;
}
