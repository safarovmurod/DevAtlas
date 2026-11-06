import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// shadcn/ui Badge as a pill: neutral topic chip, orange active step, green success.
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        active: 'bg-primary-soft text-link',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        mono: 'bg-muted font-mono text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
