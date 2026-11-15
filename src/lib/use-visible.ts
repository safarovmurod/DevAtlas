import { useEffect, useRef, useState } from 'react';

/**
 * True while the element is on screen. `ever` stays true after the first time,
 * so heavy content (a WebGL canvas) is created late and paused when scrolled away.
 */
export function useVisible<T extends HTMLElement>(margin = '200px') {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  const [ever, setEver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setEver(true);
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [margin]);

  return [ref, visible, ever] as const;
}
