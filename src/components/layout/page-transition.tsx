import * as React from 'react';

const transitions = {
  'nav-fade': 'nav-fade',
  'nav-forward': 'nav-forward',
  'nav-back': 'nav-back',
  default: 'none',
} as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
  // Next supplies its React build with ViewTransition. Other renderers, such
  // as the unit-test runtime, can render the same pages without animation.
  const Transition = React.ViewTransition;
  const content = <div className="page-transition">{children}</div>;
  if (!Transition) return content;
  return (
    <Transition enter={transitions} exit={transitions} default="none">
      {content}
    </Transition>
  );
}
