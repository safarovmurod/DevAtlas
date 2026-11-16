'use client';

import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  RoundedBox,
  Sparkles,
} from '@react-three/drei';
import { Object3D, Vector3, type Group, type InstancedMesh, type PointLight } from 'three';
import { quadToCssMatrix, smoothstep } from '@/lib/webgl-support';

export type ComputerVariant = 'hero' | 'story';
export type ScenePointer = { x: number; y: number };

type SceneProps = {
  variant: ComputerVariant;
  /**
   * The 1000×625 px app window. It is ordinary React DOM laid over the canvas; every frame
   * its CSS matrix3d is set so it sits exactly on the monitor glass (no portal into the canvas).
   */
  placeScreen: (transform: string, opacity: number) => void;
  /** 0 → 1: how far the story section has been scrolled. The hero keeps a fixed pose. */
  progress: MutableRefObject<number>;
  /** Mouse or device tilt, −1 → 1 on both axes. */
  pointer: MutableRefObject<ScenePointer>;
  motion: boolean;
  visible: boolean;
  compact: boolean;
  onReady: () => void;
  onFail: () => void;
};

// The screen glass is 3.96 × 2.475 units: the same 1.6 ratio as the 1000×625 px window.
const SCREEN_W = 3.96;
const SCREEN_H = 2.475;
const SCREEN_Y = 0.07;
const SCREEN_Z = 0.09;
export const SCREEN_PX = { width: 1000, height: 625 };
// Top-left, top-right, bottom-right, bottom-left corners of the glass in monitor space.
const CORNERS = [
  [-SCREEN_W / 2, SCREEN_Y + SCREEN_H / 2],
  [SCREEN_W / 2, SCREEN_Y + SCREEN_H / 2],
  [SCREEN_W / 2, SCREEN_Y - SCREEN_H / 2],
  [-SCREEN_W / 2, SCREEN_Y - SCREEN_H / 2],
] as const;

const KEY_COLUMNS = 14;
const KEY_ROWS = 4;
const KEY_GAP = 0.215;

/** Keyboard keys as one instanced mesh: 56 keys, one draw call. */
function Keys() {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const helper = new Object3D();
    let index = 0;
    for (let row = 0; row < KEY_ROWS; row++)
      for (let column = 0; column < KEY_COLUMNS; column++) {
        helper.position.set(
          (column - (KEY_COLUMNS - 1) / 2) * KEY_GAP,
          0.07,
          (row - (KEY_ROWS - 1) / 2) * KEY_GAP - 0.1,
        );
        helper.updateMatrix();
        target.setMatrixAt(index++, helper.matrix);
      }
    target.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, KEY_COLUMNS * KEY_ROWS]}>
      <boxGeometry args={[0.18, 0.05, 0.17]} />
      <meshStandardMaterial color="#2a3050" roughness={0.55} metalness={0.2} />
    </instancedMesh>
  );
}

/** A floating "code card": dark glass with coloured lines of code. */
function CodeCard({
  position,
  rotation,
  lines,
  motion,
  speed,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  lines: { width: number; color: string; indent: number }[];
  motion: boolean;
  speed: number;
}) {
  return (
    <Float
      speed={motion ? speed : 0}
      rotationIntensity={motion ? 0.25 : 0}
      floatIntensity={motion ? 0.6 : 0}
    >
      <group position={position} rotation={rotation}>
        <RoundedBox args={[1.25, 0.86, 0.05]} radius={0.06} smoothness={4}>
          <meshPhysicalMaterial
            color="#141933"
            roughness={0.2}
            metalness={0.1}
            clearcoat={1}
            transparent
            opacity={0.92}
          />
        </RoundedBox>
        {lines.map((line, index) => (
          <mesh
            key={index}
            position={[-0.48 + line.indent + line.width / 2, 0.26 - index * 0.13, 0.035]}
          >
            <boxGeometry args={[line.width, 0.055, 0.01]} />
            <meshStandardMaterial
              color={line.color}
              emissive={line.color}
              emissiveIntensity={0.8}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

const CARDS = [
  {
    position: [-2.95, 1.3, 0.6] as [number, number, number],
    rotation: [0.05, 0.35, -0.04] as [number, number, number],
    speed: 1.3,
    lines: [
      { width: 0.42, color: '#c084fc', indent: 0 },
      { width: 0.62, color: '#7dd3fc', indent: 0.1 },
      { width: 0.5, color: '#fb923c', indent: 0.2 },
      { width: 0.32, color: '#7dd3fc', indent: 0.1 },
      { width: 0.2, color: '#c084fc', indent: 0 },
    ],
  },
  {
    position: [3.0, 0.6, 0.4] as [number, number, number],
    rotation: [-0.04, -0.4, 0.05] as [number, number, number],
    speed: 1.1,
    lines: [
      { width: 0.7, color: '#34d399', indent: 0 },
      { width: 0.46, color: '#fbbf24', indent: 0.1 },
      { width: 0.56, color: '#34d399', indent: 0.1 },
      { width: 0.3, color: '#f472b6', indent: 0.2 },
    ],
  },
  {
    position: [-2.85, -1.0, 1.1] as [number, number, number],
    rotation: [0.1, 0.45, 0.06] as [number, number, number],
    speed: 1.6,
    lines: [
      { width: 0.36, color: '#60a5fa', indent: 0 },
      { width: 0.66, color: '#e5e7eb', indent: 0.1 },
      { width: 0.44, color: '#60a5fa', indent: 0.1 },
    ],
  },
];

/** Technology cubes around the computer; each colour stands for one direction. */
const CUBES: { size: number; position: [number, number, number]; color: string; speed: number }[] =
  [
    { size: 0.42, position: [2.75, 1.85, -0.3], color: '#7c6cff', speed: 1.4 },
    { size: 0.34, position: [2.95, -1.3, 0.9], color: '#34d399', speed: 1.1 },
    { size: 0.3, position: [-2.45, 2.0, -0.5], color: '#f59e0b', speed: 1.7 },
    { size: 0.26, position: [-3.1, 0.15, -0.6], color: '#38bdf8', speed: 1.2 },
    { size: 0.22, position: [1.9, -2.05, 1.6], color: '#f472b6', speed: 1.5 },
  ];

function Computer({ variant, placeScreen, progress, pointer, motion }: SceneProps) {
  const rig = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  const glow = useRef<PointLight>(null);
  const corner = useMemo(() => new Vector3(), []);
  const smoothPointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const group = rig.current;
    if (!group) return;
    const time = state.clock.elapsedTime;
    const ease = motion ? Math.min(1, delta * 4) : 1;
    // Reduced motion: one calm pose, screen on, no scroll travel and no idle movement.
    const p = variant === 'hero' ? 0.32 : motion ? progress.current : 0.42;

    const turn = smoothstep(0, 0.45, p);
    const enter = smoothstep(0.62, 1, p);
    const on = smoothstep(0.04, 0.3, p);

    smoothPointer.current.x += ((motion ? pointer.current.x : 0) - smoothPointer.current.x) * ease;
    smoothPointer.current.y += ((motion ? pointer.current.y : 0) - smoothPointer.current.y) * ease;
    const parallax = 1 - enter;
    const idle = motion ? 1 - enter : 0;

    const targetY =
      -0.55 * (1 - turn) +
      smoothPointer.current.x * 0.22 * parallax +
      Math.sin(time * 0.5) * 0.04 * idle;
    const targetX = 0.14 * (1 - turn) - smoothPointer.current.y * 0.1 * parallax;
    group.rotation.y += (targetY - group.rotation.y) * ease;
    group.rotation.x += (targetX - group.rotation.x) * ease;
    group.position.y = -0.25 * (1 - turn) + Math.sin(time * 0.8) * 0.05 * idle;

    if (orbit.current && motion) orbit.current.rotation.y += delta * 0.15;
    if (glow.current) glow.current.intensity = 6 * on;

    // The camera backs off on narrow stages so the whole desk fits, then dives into the screen.
    const camera = state.camera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const base = Math.max(variant === 'hero' ? 10.5 : 9.6, 8 / (0.63 * aspect));
    // The end of the story: the glass fills the stage, so the window reads like a real screen.
    const close = Math.max((SCREEN_W * 1.04) / (0.63 * aspect), (SCREEN_H * 1.04) / 0.63);
    const distance = base + (close - base) * enter;
    camera.position.set(
      smoothPointer.current.x * 0.35 * parallax,
      0.75 * (1 - enter) + SCREEN_Y * enter,
      distance,
    );
    camera.lookAt(0, SCREEN_Y * enter - 0.15 * (1 - enter), 0);

    // Pin the DOM screen onto the glass: project its four corners and map the window onto them.
    camera.updateMatrixWorld();
    group.updateWorldMatrix(true, false);
    const { width, height } = state.size;
    const quad = CORNERS.map(([x, y]) => {
      corner.set(x, y, SCREEN_Z).applyMatrix4(group.matrixWorld).project(camera);
      return [((corner.x + 1) / 2) * width, ((1 - corner.y) / 2) * height] as [number, number];
    });
    placeScreen(quadToCssMatrix(quad, SCREEN_PX.width, SCREEN_PX.height), 0.15 + 0.85 * on);
  });

  return (
    <>
      <group ref={rig}>
        {/* Monitor: aluminium frame, black glass, the live screen and a rear housing. */}
        <RoundedBox args={[4.22, 2.78, 0.16]} radius={0.08} smoothness={6}>
          <meshPhysicalMaterial color="#1c2033" metalness={0.75} roughness={0.28} clearcoat={0.6} />
        </RoundedBox>
        <mesh position={[0, SCREEN_Y, 0.082]}>
          <planeGeometry args={[SCREEN_W + 0.06, SCREEN_H + 0.06]} />
          <meshPhysicalMaterial color="#05060c" roughness={0.08} metalness={0.2} clearcoat={1} />
        </mesh>
        <mesh position={[0, -1.29, 0.083]}>
          <circleGeometry args={[0.035, 24]} />
          <meshStandardMaterial color="#8b93c9" emissive="#8b93c9" emissiveIntensity={0.6} />
        </mesh>
        <RoundedBox args={[3.1, 1.9, 0.34]} position={[0, 0.05, -0.2]} radius={0.16} smoothness={4}>
          <meshStandardMaterial color="#181c2d" metalness={0.7} roughness={0.35} />
        </RoundedBox>
        <pointLight
          ref={glow}
          position={[0, 0.2, 1.6]}
          color="#8f84ff"
          intensity={0}
          distance={6}
        />

        {/* Stand: neck and base. */}
        <RoundedBox
          args={[0.5, 1.35, 0.12]}
          position={[0, -1.72, -0.34]}
          rotation={[-0.12, 0, 0]}
          radius={0.05}
          smoothness={4}
        >
          <meshStandardMaterial color="#2a3047" metalness={0.8} roughness={0.25} />
        </RoundedBox>
        <RoundedBox
          args={[1.75, 0.08, 1.05]}
          position={[0, -2.38, -0.22]}
          radius={0.04}
          smoothness={4}
        >
          <meshStandardMaterial color="#2a3047" metalness={0.8} roughness={0.25} />
        </RoundedBox>

        {/* Keyboard and mouse on the desk. */}
        <group position={[0, -2.37, 1.45]}>
          <RoundedBox args={[3.25, 0.09, 1.1]} radius={0.04} smoothness={4}>
            <meshStandardMaterial color="#1a1e31" metalness={0.6} roughness={0.35} />
          </RoundedBox>
          <Keys />
          <mesh position={[0, 0.07, 0.38]}>
            <boxGeometry args={[1.3, 0.05, 0.16]} />
            <meshStandardMaterial color="#2a3050" roughness={0.55} metalness={0.2} />
          </mesh>
        </group>
        <mesh position={[2.3, -2.34, 1.5]} scale={[0.26, 0.1, 0.4]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshPhysicalMaterial color="#232842" metalness={0.5} roughness={0.25} clearcoat={1} />
        </mesh>
      </group>

      {CARDS.map((card) => (
        <CodeCard key={card.position.join()} {...card} motion={motion} />
      ))}
      {CUBES.map((cube) => (
        <Float
          key={cube.color}
          speed={motion ? cube.speed : 0}
          rotationIntensity={motion ? 1 : 0}
          floatIntensity={motion ? 0.9 : 0}
        >
          <RoundedBox
            args={[cube.size, cube.size, cube.size]}
            position={cube.position}
            radius={cube.size * 0.2}
            smoothness={4}
          >
            <meshPhysicalMaterial
              color={cube.color}
              roughness={0.25}
              metalness={0.1}
              clearcoat={1}
              emissive={cube.color}
              emissiveIntensity={0.15}
            />
          </RoundedBox>
        </Float>
      ))}

      {/* Orbits around the desk with small "planets" travelling on them. */}
      <group ref={orbit} position={[0, -1.6, 0]}>
        {[
          { radius: 3.6, tilt: 0.22, color: '#a99bff', opacity: 0.35 },
          { radius: 4.2, tilt: -0.12, color: '#38bdf8', opacity: 0.22 },
        ].map((ring) => (
          <group key={ring.radius} rotation={[Math.PI / 2 + ring.tilt, 0, 0]}>
            <mesh>
              <torusGeometry args={[ring.radius, 0.008, 8, 160]} />
              <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} />
            </mesh>
            <mesh position={[ring.radius, 0, 0]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color={ring.color} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

export default function ComputerScene(props: SceneProps) {
  const { motion, visible, compact, onReady, onFail } = props;
  // Lightformers draw a tiny studio into the reflections; nothing is downloaded.
  const studio = useMemo(
    () => (
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.5} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#8f84ff"
          position={[-5, 1, -2]}
          scale={[3, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1}
          color="#38bdf8"
          position={[5, 0, 2]}
          scale={[2, 4, 1]}
        />
      </Environment>
    ),
    [],
  );

  return (
    <Canvas
      camera={{ position: [0, 0.75, 10], fov: 35, near: 0.1, far: 60 }}
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      frameloop={!visible ? 'never' : motion ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        canvas.addEventListener(
          'webglcontextlost',
          (event) => {
            event.preventDefault();
            onFail();
          },
          { once: true },
        );
        requestAnimationFrame(onReady);
      }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <directionalLight position={[-5, 2, -4]} intensity={2.4} color="#7c6cff" />
      {studio}
      <Computer {...props} />
      <Sparkles
        count={compact ? 30 : 60}
        scale={[10, 6, 5]}
        size={2.2}
        speed={motion ? 0.35 : 0}
        color="#b7adff"
        opacity={0.7}
      />
      <ContactShadows
        position={[0, -2.43, 0]}
        scale={14}
        blur={2.6}
        far={4}
        opacity={0.6}
        resolution={compact ? 256 : 512}
        frames={motion ? Infinity : 1}
        color="#000000"
      />
    </Canvas>
  );
}
