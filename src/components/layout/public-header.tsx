'use client';

import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Brand } from './brand';

type HeaderCopy={directions:string;how:string;plans:string;questions:string;signIn:string;openMenu:string;closeMenu:string;start:string;platform:string};

export function PublicHeader({copy}:{copy:HeaderCopy}) {
  const [open,setOpen]=useState(false);
  const container=useRef<HTMLElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const panel=useRef<HTMLDivElement>(null);
  const close=()=>{setOpen(false);trigger.current?.focus();};
  const links=[{href:'#directions',label:copy.directions},{href:'#how-it-works',label:copy.how},{href:'#plans',label:copy.plans},{href:'#faq',label:copy.questions}];

  useEffect(()=>{
    if(!open)return;
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    function dismiss(event:PointerEvent){if(event.target instanceof Node&&!container.current?.contains(event.target))setOpen(false);}
    document.addEventListener('pointerdown',dismiss);
    return ()=>document.removeEventListener('pointerdown',dismiss);
  },[open]);

  function handleKey(event:React.KeyboardEvent<HTMLDivElement>) {
    if(event.key==='Escape'){event.preventDefault();close();return;}
    if(event.key!=='Tab')return;
    const items=Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')||[]);
    if(!items.length)return;
    if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1)?.focus();}
    else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
  }

  return <header className="public-header" ref={container}>
    <Brand variant="public"/>
    <nav className="public-nav" aria-label={copy.platform}>{links.map(link=><Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
    <div className="public-header-actions"><Link href="/login" transitionTypes={['nav-forward']} className="public-sign-in">{copy.signIn}</Link><Link href="/login" transitionTypes={['nav-forward']} className="button primary public-start">{copy.start}<ArrowRight size={16}/></Link><button ref={trigger} type="button" className="icon-button public-menu-toggle" aria-label={copy.openMenu} aria-expanded={open} aria-controls="public-mobile-navigation" onClick={()=>setOpen(value=>!value)}><Menu size={20}/></button></div>
    {open&&<div className="public-mobile-panel" id="public-mobile-navigation" role="dialog" aria-label={copy.openMenu} ref={panel} onKeyDown={handleKey}><button type="button" className="icon-button public-menu-close" aria-label={copy.closeMenu} onClick={close}><X size={20}/></button><nav aria-label={copy.platform}>{links.map(link=><Link key={link.href} href={link.href} onClick={close}>{link.label}</Link>)}<Link href="/login" onClick={close}>{copy.signIn}</Link></nav></div>}
  </header>;
}
