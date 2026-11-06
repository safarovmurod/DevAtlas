import Link from 'next/link';
import { Code } from 'lucide-react';
import { BRAND_NAME } from '@/lib/brand';

export function Brand({ variant = 'app' }: { variant?: 'app' | 'public' | 'auth' }) {
  const className =
    variant === 'app' ? 'brand' : variant === 'public' ? 'public-brand' : 'auth-brand';
  return (
    <Link
      href={variant === 'app' ? '/courses' : '/'}
      transitionTypes={variant === 'app' ? ['nav-fade'] : undefined}
      className={className}
      aria-label={BRAND_NAME}
    >
      <span className="brand-icon">
        <Code size={variant === 'public' ? 22 : 20} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span>
        Dev<span className="brand-light">Atlas</span>
      </span>
    </Link>
  );
}
