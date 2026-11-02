'use client';
import { PageTransition } from '@/components/layout/page-transition';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {const router=useRouter();useEffect(()=>{router.replace('/home');},[router]);return <PageTransition><p role="status">Открываем обучение…</p></PageTransition>;}
