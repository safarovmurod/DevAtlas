import * as React from 'react';
import { cn } from '@/lib/utils';

// shadcn/ui Label without Radix: a plain accessible <label>.
function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn('flex flex-col gap-1.5 text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}

export { Label };
