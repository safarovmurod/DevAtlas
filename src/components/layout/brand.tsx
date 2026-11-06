import Link from 'next/link';
import { Compass } from 'lucide-react';
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
        <Compass size={variant === 'public' ? 24 : 23} />
      </span>
      <span>
        Dev<span className="brand-light">Atlas</span>
      </span>
    </Link>
  );
}
