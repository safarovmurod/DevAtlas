'use client';
import { PageTransition } from '@/components/layout/page-transition';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function CallbackPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/home');
  }, [router]);
  return (
    <PageTransition>
      <p role="status">Вход выполнен. Открываем обучение…</p>
    </PageTransition>
  );
}
