'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '@/components/account/account-provider';
import { AccountAvatar } from '@/components/account/account-avatar';
import { ACCOUNT_COPY } from '@/lib/account-copy';
import { COPY } from '@/lib/i18n';
import { useLearningStore } from '@/stores/learning-store';

export function AccountMenu() {
  const account=useAccount();
  const language=useLearningStore(state=>state.language);
  const copy=ACCOUNT_COPY[language];
  const [open,setOpen]=useState(false);
  const container=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const menu=useRef<HTMLDivElement>(null);
  const profileLabel=copy.profile;
  const close=()=>{setOpen(false);trigger.current?.focus();};

  useEffect(()=>{
    if(!open)return;
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    function dismiss(event:PointerEvent) {
      if(event.target instanceof Node && !container.current?.contains(event.target))setOpen(false);
    }
    document.addEventListener('pointerdown',dismiss);
    return ()=>document.removeEventListener('pointerdown',dismiss);
  },[open]);

  function handleKey(event:React.KeyboardEvent<HTMLDivElement>) {
    if(event.key==='Escape'){event.preventDefault();close();return;}
    const items=Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')||[]);
    if(!items.length)return;
    const index=items.indexOf(document.activeElement as HTMLElement);
    if(event.key==='Tab') {
      if(event.shiftKey&&index===0){event.preventDefault();items.at(-1)?.focus();}
      else if(!event.shiftKey&&index===items.length-1){event.preventDefault();items[0].focus();}
    } else if(event.key==='ArrowDown'||event.key==='ArrowUp'||event.key==='Home'||event.key==='End') {
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
      items[next].focus();
    }
  }

  return <div className="account-menu" ref={container}>
    <button ref={trigger} type="button" className="header-profile" aria-label={profileLabel} aria-haspopup="menu" aria-expanded={open} aria-controls="account-menu-options" onClick={()=>setOpen(value=>!value)}><AccountAvatar/></button>
    {open&&<div id="account-menu-options" className="header-popover" role="menu" aria-label={profileLabel} ref={menu} onKeyDown={handleKey}>
      <Link role="menuitem" href="/settings#account-profile" onClick={close}>{copy.profile}</Link>
      <Link role="menuitem" href="/settings" onClick={close}>{COPY[language].settings}</Link>
      {account.user?<button type="button" role="menuitem" onClick={()=>{close();void account.signOut();}}>{copy.logoutAccount}</button>:<Link role="menuitem" href="/login" onClick={close}>{copy.guestLogin}</Link>}
    </div>}
  </div>;
}
