import * as React from 'react';
import { cn } from '@/lib/utils';

// shadcn/ui Input: well background, white on focus, ink-blue focus ring, 44px tall.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'min-h-11 w-full min-w-0 rounded-md border border-input bg-muted px-3.5 py-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
