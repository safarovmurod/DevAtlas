import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/page-transition';
import { AdminUsers } from '@/components/admin/admin-users';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <PageTransition>
      <AdminUsers />
    </PageTransition>
  );
}
