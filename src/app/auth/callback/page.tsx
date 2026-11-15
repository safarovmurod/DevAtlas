'use client';
import { PageTransition } from '@/components/layout/page-transition';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ACCOUNT_COPY } from '@/lib/account-copy';
import { useLearningStore } from '@/stores/learning-store';
export default function CallbackPage() {
  const router = useRouter();
  const copy = ACCOUNT_COPY[useLearningStore((state) => state.language)];
  useEffect(() => {
    router.replace('/home');
  }, [router]);
  return (
    <PageTransition>
      <p role="status">{copy.signedInOpening}</p>
    </PageTransition>
  );
}
