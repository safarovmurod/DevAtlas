'use client';

import { useEffect, useRef, useState } from 'react';
import { COPY } from '@/lib/i18n';
import { INTERFACE_LANGUAGE_NAMES, INTERFACE_LOCALES } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

export function LanguageMenu() {
  const language=useLearningStore(state=>state.language);
  const setPreferences=useLearningStore(state=>state.setPreferences);
  const [open,setOpen]=useState(false);
  const container=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const menu=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(!open)return;
    menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    function dismiss(event:PointerEvent) {
      if(event.target instanceof Node && !container.current?.contains(event.target))setOpen(false);
    }
    document.addEventListener('pointerdown',dismiss);
    return ()=>document.removeEventListener('pointerdown',dismiss);
  },[open]);

  function handleKey(event:React.KeyboardEvent<HTMLDivElement>) {
    if(event.key==='Escape') {
      event.preventDefault();setOpen(false);trigger.current?.focus();return;
    }
    const items=Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button')||[]);
    if(!items.length)return;
    const index=items.indexOf(document.activeElement as HTMLButtonElement);
    if(event.key==='Tab') {
      if(event.shiftKey&&index===0){event.preventDefault();items.at(-1)?.focus();}
      else if(!event.shiftKey&&index===items.length-1){event.preventDefault();items[0].focus();}
    } else if(event.key==='ArrowDown'||event.key==='ArrowUp'||event.key==='Home'||event.key==='End') {
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
      items[next].focus();
    }
  }

  return <div className="language-menu" ref={container}>
    <button ref={trigger} type="button" className="language-link" aria-label={COPY[language].interfaceLanguage} aria-haspopup="menu" aria-expanded={open} aria-controls="language-menu-options" onClick={()=>setOpen(value=>!value)}>{language.toUpperCase()}</button>
    {open&&<div id="language-menu-options" className="header-popover" role="menu" aria-label={COPY[language].interfaceLanguage} ref={menu} onKeyDown={handleKey}>
      {INTERFACE_LOCALES.map(locale=><button type="button" role="menuitemradio" aria-checked={locale===language} key={locale} onClick={()=>{setPreferences({language:locale});setOpen(false);trigger.current?.focus();}}>{INTERFACE_LANGUAGE_NAMES[locale]} <span>{locale.toUpperCase()}</span></button>)}
    </div>}
  </div>;
}
