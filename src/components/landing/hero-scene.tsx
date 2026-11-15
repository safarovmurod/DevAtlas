'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { useVisible } from '@/lib/use-visible';

type Piece = {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  speed: number;
};

// A local 3D learning workspace: one main editor card and floating blocks.
const PIECES: Piece[] = [
  { size: [0.8, 0.8, 0.8], position: [-1.6, 1.1, 0.7], color: '#7c6cff', speed: 1.2 },
  { size: [0.6, 0.6, 0.6], position: [1.7, -0.95, 0.6], color: '#34d399', speed: 1 },
  { size: [0.45, 0.45, 0.45], position: [1.45, 1.2, -0.2], color: '#f59e0b', speed: 1.6 },
  { size: [0.5, 0.5, 0.5], position: [-1.5, -1.05, 0.2], color: '#38bdf8', speed: 1.4 },
];

function Workspace({ motion }: { motion: boolean }) {
  const group = useRef<Group>(null);

  // Parallax: the whole workspace turns slowly toward the pointer.
  useFrame((state, delta) => {
    const target = group.current;
    if (!target) return;
    const ease = Math.min(1, delta * 4);
    const targetY = motion ? state.pointer.x * 0.35 : 0;
    const targetX = motion ? -state.pointer.y * 0.25 : 0;
    target.rotation.y += (targetY - target.rotation.y) * ease;
    target.rotation.x += (targetX - target.rotation.x) * ease;
  });

  return (
    <group ref={group}>
      <Float
        speed={motion ? 1 : 0}
        rotationIntensity={motion ? 0.25 : 0}
        floatIntensity={motion ? 0.5 : 0}
      >
        <RoundedBox args={[2.3, 1.5, 0.24]} radius={0.05} smoothness={6}>
          <meshPhysicalMaterial color="#232a44" roughness={0.3} metalness={0.2} clearcoat={1} />
        </RoundedBox>
      </Float>
      {PIECES.map((piece) => (
        <Float
          key={piece.color}
          speed={motion ? piece.speed : 0}
          rotationIntensity={motion ? 0.8 : 0}
          floatIntensity={motion ? 0.9 : 0}
        >
          <RoundedBox
            args={piece.size}
            position={piece.position}
            radius={Math.min(...piece.size) * 0.22}
            smoothness={6}
          >
            <meshPhysicalMaterial
              color={piece.color}
              roughness={0.28}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.2}
            />
          </RoundedBox>
        </Float>
      ))}
    </group>
  );
}

export function HeroScene() {
  const [motion, setMotion] = useState(true);
  const [stageRef, visible] = useVisible<HTMLDivElement>('100px');

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotion(!query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <div
      ref={stageRef}
      className="h-[360px] w-full min-w-0 sm:h-[420px] lg:h-[560px]"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 36 }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} />
        <directionalLight position={[4, -2, 3]} intensity={0.8} color="#c4d8ff" />
        <Workspace motion={motion} />
      </Canvas>
    </div>
  );
}
