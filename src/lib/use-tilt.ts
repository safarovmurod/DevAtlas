import { useRef, type PointerEvent } from 'react';

/**
 * 3D tilt that follows the mouse. The transform is written straight to the
 * element, so moving the pointer never re-renders React. Touch pointers and
 * `prefers-reduced-motion` are ignored.
 */
export function useTilt<T extends HTMLElement>(strength = 8) {
  const ref = useRef<T>(null);

  function onPointerMove(event: PointerEvent<T>) {
    const element = ref.current;
    if (!element || event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `perspective(900px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength * 1.25).toFixed(2)}deg) translateY(-4px)`;
  }

  function onPointerLeave() {
    if (ref.current) ref.current.style.transform = '';
  }

  return { ref, onPointerMove, onPointerLeave };
}
