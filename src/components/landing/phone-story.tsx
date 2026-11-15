'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Sparkles } from '@react-three/drei';
import type { Group, MeshStandardMaterial } from 'three';
import { useVisible } from '@/lib/use-visible';

type Step = { title: string; description: string };

// One colored tile on the phone screen per step; the active step's tile glows.
const TILE_COLORS = ['#7c6cff', '#34d399', '#f59e0b', '#38bdf8'];

type Refs = {
  progress: MutableRefObject<number>;
  active: MutableRefObject<number>;
  motion: MutableRefObject<boolean>;
};

function Phone({ progress, active, motion }: Refs) {
  const body = useRef<Group>(null);
  const rings = useRef<Group>(null);
  const tiles = useRef<Array<MeshStandardMaterial | null>>([]);

  useFrame((state, delta) => {
    const group = body.current;
    if (!group) return;
    const time = state.clock.elapsedTime;
    const ease = Math.min(1, delta * 5);

    // Scroll turns the phone left to right, but the screen always faces the viewer (±40°).
    const targetY = motion.current ? (progress.current * 2 - 1) * 0.7 : 0;
    const targetX = motion.current ? Math.sin(time * 0.6) * 0.05 : 0;
    group.rotation.y += (targetY - group.rotation.y) * ease;
    group.rotation.x += (targetX - group.rotation.x) * ease;
    group.position.y = motion.current ? Math.sin(time * 0.9) * 0.06 : 0;

    if (rings.current && motion.current) rings.current.rotation.z += delta * 0.12;

    tiles.current.forEach((material, index) => {
      if (!material) return;
      const goal = index === active.current ? 1.4 : 0.25;
      material.emissiveIntensity += (goal - material.emissiveIntensity) * ease;
    });
  });

  return (
    <>
      <group ref={body} scale={1.1}>
        <RoundedBox args={[1.6, 3.2, 0.2]} radius={0.22} smoothness={8}>
          <meshStandardMaterial color="#2c3150" metalness={0.65} roughness={0.28} />
        </RoundedBox>
        <RoundedBox args={[1.46, 3.06, 0.02]} position={[0, 0, 0.11]} radius={0.14} smoothness={6}>
          <meshStandardMaterial color="#151833" emissive="#2a2160" emissiveIntensity={0.6} />
        </RoundedBox>
        {/* status pill and home bar */}
        <RoundedBox args={[0.5, 0.07, 0.03]} position={[0, 1.38, 0.13]} radius={0.03}>
          <meshStandardMaterial color="#586088" />
        </RoundedBox>
        <RoundedBox args={[0.7, 0.06, 0.03]} position={[0, -1.4, 0.13]} radius={0.03}>
          <meshStandardMaterial color="#586088" />
        </RoundedBox>
        {TILE_COLORS.map((color, index) => {
          const column = index % 2;
          const row = Math.floor(index / 2);
          return (
            <RoundedBox
              key={color}
              args={[0.58, 0.58, 0.04]}
              position={[-0.34 + column * 0.68, 0.7 - row * 0.68, 0.14]}
              radius={0.11}
              smoothness={4}
            >
              <meshStandardMaterial
                ref={(material: MeshStandardMaterial | null) => {
                  tiles.current[index] = material;
                }}
                color={color}
                emissive={color}
                emissiveIntensity={0.25}
                roughness={0.3}
              />
            </RoundedBox>
          );
        })}
        {/* progress bar */}
        <RoundedBox args={[1.2, 0.12, 0.03]} position={[0, -0.85, 0.13]} radius={0.05}>
          <meshStandardMaterial color="#2b3060" />
        </RoundedBox>
        <RoundedBox args={[0.7, 0.12, 0.04]} position={[-0.25, -0.85, 0.14]} radius={0.05}>
          <meshStandardMaterial color="#ff9301" emissive="#ff9301" emissiveIntensity={0.6} />
        </RoundedBox>
      </group>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[2.3, 0.006, 8, 140]} />
          <meshBasicMaterial color="#a99bff" transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 2.7, 0.5, 0.2]}>
          <torusGeometry args={[2.65, 0.006, 8, 140]} />
          <meshBasicMaterial color="#7c6cff" transparent opacity={0.22} />
        </mesh>
      </group>
    </>
  );
}

export function PhoneStory({ title, steps }: { title: string; steps: Step[] }) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const active = useRef(0);
  const motionRef = useRef(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stageRef, visible, ever] = useVisible<HTMLDivElement>('150px');

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const enabled = !query.matches;
    motionRef.current = enabled;
    if (!enabled) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const element = section.current;
      if (!element) return;
      // 0 when the section enters the screen, 1 when its pinned range ends.
      const range = element.offsetHeight - window.innerHeight;
      const value =
        range > 0 ? Math.min(1, Math.max(0, -element.getBoundingClientRect().top / range)) : 0;
      progress.current = value;
      const index = Math.min(steps.length - 1, Math.floor(value * steps.length));
      if (index !== active.current) {
        active.current = index;
        setActiveIndex(index);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [steps.length]);

  return (
    <section
      ref={section}
      id="how-it-works"
      aria-labelledby="how-phone-heading"
      className="lg:relative lg:h-[260vh]"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-5 py-16 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:grid-cols-2 lg:py-0">
        <div
          ref={stageRef}
          className="h-[380px] w-full sm:h-[480px] lg:h-[640px]"
          aria-hidden="true"
        >
          {ever && (
            <Canvas
              camera={{ position: [0, 0, 7], fov: 38 }}
              dpr={[1, 1.5]}
              frameloop={visible ? 'always' : 'never'}
              gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={1} />
              <directionalLight position={[0, 2, 6]} intensity={2.4} />
              <directionalLight position={[-4, 3, 3]} intensity={1.2} color="#c9c2ff" />
              <Phone progress={progress} active={active} motion={motionRef} />
              <Sparkles
                count={40}
                scale={[6, 4, 4]}
                size={2}
                speed={0.3}
                color="#a99bff"
                opacity={0.7}
              />
            </Canvas>
          )}
        </div>
        <div>
          <h2
            id="how-phone-heading"
            className="text-[32px] leading-tight font-bold tracking-[-0.02em] text-white md:text-[44px]"
          >
            {title}
          </h2>
          <ol className="mt-8 space-y-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className={`rounded-2xl border p-5 transition-colors duration-300 ${
                  index === activeIndex
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/40">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
