import { redirect } from 'next/navigation';

/** Weak topics and revision are one page now. Old links open it. */
export default function Page() {
  redirect('/revision');
}
