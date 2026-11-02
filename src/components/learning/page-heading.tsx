'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';

export function PageHeading({title,subtitle,back='/home',children}:{title:string;subtitle?:string;back?:string;children?:React.ReactNode}) {
  const language = useLearningStore(state=>state.language);
  return <><Link className="back-link" href={back} transitionTypes={['nav-back']}><ArrowLeft size={16}/>{COPY[language].back}</Link><div className="page-heading"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{children}</div></>;
}
