'use client';

import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import { useVisible } from '@/lib/use-visible';
import { canUse3D } from '@/lib/webgl-support';
import { ComputerScreen, type ComputerScreenData } from './computer-screen';
import type { ComputerVariant, ScenePointer } from './computer-scene';

// three.js loads only when the stage comes near the screen, after the first paint.
const ComputerScene = dynamic(() => import('./computer-scene'), {
  ssr: false,
  loading: () => null,
});

type Mode = 'pending' | '3d' | 'flat';

/**
 * The flat computer: the same app window in a CSS monitor. Used before the 3D scene is
 * ready, without WebGL, on weak devices and when WebGL is lost.
 */
function FlatComputer({ screen }: { screen: ComputerScreenData }) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const update = () => setScale(element.clientWidth / 1000);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center px-2">
      <div className="w-full max-w-[560px]">
        <div className="rounded-[22px] border border-white/15 bg-gradient-to-b from-[#262b45] to-[#161a2c] p-[3%] shadow-[0_30px_80px_-30px_rgba(124,108,255,0.55)]">
          <div ref={frame} className="relative aspect-[1000/625] overflow-hidden rounded-[10px]">
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{ transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}
            >
              <ComputerScreen data={screen} />
            </div>
          </div>
        </div>
        <div className="mx-auto h-10 w-[16%] bg-gradient-to-b from-[#2a3047] to-[#1b2033]" />
        <div className="mx-auto h-2 w-[42%] rounded-full bg-[#2a3047]" />
      </div>
    </div>
  );
}

/**
 * Hero and scroll story stage for the 3D computer. Rendering stops off screen
 * (IntersectionObserver → frameloop "never"), reduced motion gets a still frame,
 * and weak or WebGL-less devices keep the flat computer.
 */
export function ComputerStage({
  variant,
  screen,
  progress,
  className,
}: {
  variant: ComputerVariant;
  screen: ComputerScreenData;
  progress?: MutableRefObject<number>;
  className: string;
}) {
  const [stageRef, visible, ever] = useVisible<HTMLDivElement>('200px');
  const [mode, setMode] = useState<Mode>('pending');
  const [ready, setReady] = useState(false);
  const [motion, setMotion] = useState(true);
  const [compact, setCompact] = useState(false);
  const fixed = useRef(0);
  const pointer = useRef<ScenePointer>({ x: 0, y: 0 });
  const overlay = useRef<HTMLDivElement>(null);
  const placeScreen = useCallback((transform: string, opacity: number) => {
    const element = overlay.current;
    if (!element) return;
    element.style.transform = transform;
    element.style.opacity = String(opacity);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 767px)');
    const update = () => {
      setMotion(!reduce.matches);
      setCompact(small.matches);
    };
    update();
    // The WebGL probe runs once, after mount (the server cannot know the device).
    queueMicrotask(() => setMode(canUse3D() ? '3d' : 'flat'));
    reduce.addEventListener('change', update);
    small.addEventListener('change', update);
    return () => {
      reduce.removeEventListener('change', update);
      small.removeEventListener('change', update);
    };
  }, []);

  // Parallax from the mouse, or from tilting a phone. Values stay in a ref: no re-render.
  useEffect(() => {
    if (!motion || mode !== '3d') return;
    const onMove = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    };
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      pointer.current = {
        x: Math.max(-1, Math.min(1, event.gamma / 30)),
        y: Math.max(-1, Math.min(1, (event.beta - 45) / 30)),
      };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('deviceorientation', onTilt, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [motion, mode]);

  const show3d = mode === '3d' && ever;
  return (
    <div
      ref={stageRef}
      className={`relative isolate overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {!ready && (
        <div className="absolute inset-0">
          <FlatComputer screen={screen} />
        </div>
      )}
      {show3d && (
        <div
          className={`absolute inset-0 ${motion ? 'transition-opacity duration-700' : ''} ${ready ? 'opacity-100' : 'opacity-0'}`}
        >
          <ComputerScene
            variant={variant}
            placeScreen={placeScreen}
            progress={progress ?? fixed}
            pointer={pointer}
            motion={motion}
            visible={visible}
            compact={compact}
            onReady={() => setReady(true)}
            onFail={() => {
              setReady(false);
              setMode('flat');
            }}
          />
          {/* The real app window, glued onto the monitor glass by the scene every frame. */}
          <div
            ref={overlay}
            className="pointer-events-none absolute top-0 left-0 origin-top-left"
            style={{ transform: 'scale(0)', opacity: 0 }}
          >
            <ComputerScreen data={screen} />
          </div>
        </div>
      )}
    </div>
  );
}
