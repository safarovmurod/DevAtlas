'use client';

import { useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer, RoundedBox, Sparkles } from '@react-three/drei';
import { Vector3, type Camera, type Group } from 'three';
import { quadToCssMatrix, smoothstep } from '@/lib/webgl-support';
import { ComputerHardware } from './computer-hardware';
import { LaptopHardware } from './laptop-hardware';

export type ComputerVariant = 'hero' | 'story';
export type ScenePointer = { x: number; y: number };

type SceneProps = {
  variant: ComputerVariant;
  /**
   * The 1000×625 px app window. It is ordinary React DOM laid over the canvas; every frame
   * its CSS matrix3d is set so it sits exactly on the monitor glass (no portal into the canvas).
   */
  placeScreen: (transform: string, opacity: number) => void;
  /** 0 → 1: real scroll progress for both hero scroll parallax and laptop story. */
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

type CardConfig = {
  position: [number, number, number];
  rotation: [number, number, number];
  parallax: [number, number, number];
  scrollSpin: number;
  accent: string;
  speed: number;
  lines: { width: number; color: string; indent: number }[];
};

/** A floating holographic obsidian glass code card with Atlas Cobalt/Cyan syntax bars. */
function CodeCard({
  lines,
  accent,
  motion,
  speed,
}: {
  lines: { width: number; color: string; indent: number }[];
  accent: string;
  motion: boolean;
  speed: number;
}) {
  return (
    <Float
      speed={motion ? speed : 0}
      rotationIntensity={motion ? 0.22 : 0}
      floatIntensity={motion ? 0.5 : 0}
    >
      <group>
        <RoundedBox args={[1.3, 0.9, 0.044]} radius={0.065} smoothness={4}>
          <meshPhysicalMaterial
            color="#0c1326"
            roughness={0.16}
            metalness={0.22}
            clearcoat={1}
            clearcoatRoughness={0.12}
            transparent
            opacity={0.93}
          />
        </RoundedBox>
        {/* Crisp top studio accent edge */}
        <mesh position={[0, 0.425, 0.024]}>
          <boxGeometry args={[0.92, 0.014, 0.008]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
        {lines.map((line, index) => (
          <mesh
            key={index}
            position={[-0.49 + line.indent + line.width / 2, 0.25 - index * 0.135, 0.032]}
          >
            <boxGeometry args={[line.width, 0.052, 0.01]} />
            <meshStandardMaterial
              color={line.color}
              emissive={line.color}
              emissiveIntensity={0.45}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

const CARDS: CardConfig[] = [
  {
    position: [-2.82, 1.32, -0.18],
    rotation: [0.05, 0.36, -0.04],
    parallax: [-0.85, 0.52, 0.85],
    scrollSpin: 0.24,
    accent: '#818cf8',
    speed: 1.25,
    lines: [
      { width: 0.44, color: '#818cf8', indent: 0 },
      { width: 0.64, color: '#38bdf8', indent: 0.1 },
      { width: 0.52, color: '#a5b4fc', indent: 0.2 },
      { width: 0.34, color: '#38bdf8', indent: 0.1 },
      { width: 0.24, color: '#818cf8', indent: 0 },
    ],
  },
  {
    position: [2.88, 0.65, -0.35],
    rotation: [-0.04, -0.4, 0.05],
    parallax: [0.92, 0.36, 0.72],
    scrollSpin: -0.28,
    accent: '#38bdf8',
    speed: 1.1,
    lines: [
      { width: 0.72, color: '#38bdf8', indent: 0 },
      { width: 0.48, color: '#818cf8', indent: 0.1 },
      { width: 0.58, color: '#34d399', indent: 0.1 },
      { width: 0.32, color: '#cbd5e1', indent: 0.2 },
    ],
  },
  {
    position: [-2.72, -0.96, 0.32],
    rotation: [0.08, 0.42, 0.05],
    parallax: [-0.72, -0.42, 1.05],
    scrollSpin: 0.3,
    accent: '#6366f1',
    speed: 1.45,
    lines: [
      { width: 0.38, color: '#60a5fa', indent: 0 },
      { width: 0.68, color: '#e2e8f0', indent: 0.1 },
      { width: 0.46, color: '#38bdf8', indent: 0.1 },
    ],
  },
];

type CrystalConfig = {
  radius: number;
  position: [number, number, number];
  parallax: [number, number, number];
  color: string;
  wireColor: string;
  speed: number;
  octahedron?: boolean;
};

/** Faceted Atlas studio crystal nodes that separate cleanly in 3D depth on scroll. */
const CRYSTALS: CrystalConfig[] = [
  {
    radius: 0.32,
    position: [2.72, 1.84, -0.35],
    parallax: [0.75, 0.65, -0.45],
    color: '#4f46e5',
    wireColor: '#818cf8',
    speed: 1.35,
  },
  {
    radius: 0.27,
    position: [2.9, -1.26, 0.85],
    parallax: [0.82, -0.48, 0.9],
    color: '#0284c7',
    wireColor: '#38bdf8',
    speed: 1.15,
    octahedron: true,
  },
  {
    radius: 0.24,
    position: [-2.42, 1.98, -0.55],
    parallax: [-0.62, 0.72, -0.35],
    color: '#6366f1',
    wireColor: '#a5b4fc',
    speed: 1.55,
    octahedron: true,
  },
  {
    radius: 0.22,
    position: [-3.05, 0.14, -0.65],
    parallax: [-0.88, 0.12, 0.6],
    color: '#0ea5e9',
    wireColor: '#7dd3fc',
    speed: 1.2,
  },
  {
    radius: 0.19,
    position: [1.92, -1.96, 1.55],
    parallax: [0.55, -0.56, 0.95],
    color: '#10b981',
    wireColor: '#6ee7b7',
    speed: 1.4,
    octahedron: true,
  },
];

/** Subtle Atlas depth crystals flanking the #how-it-works 3D laptop. */
const STORY_CRYSTALS: CrystalConfig[] = [
  {
    radius: 0.22,
    position: [-2.95, 1.15, -0.95],
    parallax: [-0.55, 0.42, 0.65],
    color: '#4f46e5',
    wireColor: '#818cf8',
    speed: 1.1,
  },
  {
    radius: 0.19,
    position: [3.05, 0.92, -0.85],
    parallax: [0.62, 0.35, 0.55],
    color: '#0284c7',
    wireColor: '#38bdf8',
    speed: 1.25,
    octahedron: true,
  },
  {
    radius: 0.16,
    position: [2.78, -0.95, -0.45],
    parallax: [0.45, -0.32, 0.75],
    color: '#6366f1',
    wireColor: '#a5b4fc',
    speed: 1.0,
  },
];

function FacetedCrystal({
  radius,
  color,
  wireColor,
  octahedron,
  motion,
  speed,
}: {
  radius: number;
  color: string;
  wireColor: string;
  octahedron?: boolean;
  motion: boolean;
  speed: number;
}) {
  return (
    <Float
      speed={motion ? speed : 0}
      rotationIntensity={motion ? 0.85 : 0}
      floatIntensity={motion ? 0.75 : 0}
    >
      <group>
        <mesh>
          {octahedron ? (
            <octahedronGeometry args={[radius, 0]} />
          ) : (
            <icosahedronGeometry args={[radius, 0]} />
          )}
          <meshPhysicalMaterial
            color={color}
            roughness={0.18}
            metalness={0.35}
            clearcoat={1}
            clearcoatRoughness={0.12}
            flatShading
            emissive={color}
            emissiveIntensity={0.18}
          />
        </mesh>
        <mesh scale={1.06}>
          {octahedron ? (
            <octahedronGeometry args={[radius, 0]} />
          ) : (
            <icosahedronGeometry args={[radius, 0]} />
          )}
          <meshBasicMaterial color={wireColor} wireframe transparent opacity={0.55} />
        </mesh>
      </group>
    </Float>
  );
}

function projectGlass(
  screen: Group,
  camera: Camera,
  { width, height }: { width: number; height: number },
  corner: Vector3,
) {
  camera.updateMatrixWorld();
  screen.updateWorldMatrix(true, false);
  const quad = CORNERS.map(([x, y]) => {
    corner.set(x, y, SCREEN_Z).applyMatrix4(screen.matrixWorld).project(camera);
    return [((corner.x + 1) / 2) * width, ((1 - corner.y) / 2) * height] as [number, number];
  });
  return quadToCssMatrix(quad, SCREEN_PX.width, SCREEN_PX.height);
}

function Laptop({ placeScreen, progress, pointer, motion, compact }: SceneProps) {
  const rig = useRef<Group>(null);
  const lid = useRef<Group>(null);
  const hinge = useRef<Group>(null);
  const halo = useRef<Group>(null);
  const crystalRefs = useRef<(Group | null)[]>([]);
  const corner = useMemo(() => new Vector3(), []);
  const smoothProgress = useRef(motion ? 0 : 0.25);
  const smoothPointer = useRef({ x: 0, y: 0 });
  const visibleCrystals = compact ? STORY_CRYSTALS.slice(0, 2) : STORY_CRYSTALS;

  useFrame(({ camera, size, clock }, delta) => {
    if (!rig.current || !lid.current) return;
    const clampedDelta = Math.min(delta, 0.05);
    // Framerate-independent exponential damping: balanced on both fast and slow scroll.
    const damp = motion ? 1 - Math.exp(-clampedDelta * 8.5) : 1;

    const targetProgress = motion ? progress.current : 0.25;
    smoothProgress.current += (targetProgress - smoothProgress.current) * damp;
    const travel = smoothProgress.current;

    smoothPointer.current.x += ((motion ? pointer.current.x : 0) - smoothPointer.current.x) * damp;
    smoothPointer.current.y += ((motion ? pointer.current.y : 0) - smoothPointer.current.y) * damp;

    // Phase 1 (0 -> 0.16): lid smoothly opens from closed (+1.50 rad) to viewing angle (-0.15 rad).
    // Phase 2 (0.16 -> 1.00): laptop stays centered with gentle orbit across all 10 story steps.
    const openFactor = motion ? smoothstep(0.01, 0.16, travel) : 1;
    const contentTravel = motion ? smoothstep(0.16, 1, travel) : 0;

    const targetYaw = (-0.14 + contentTravel * 0.28) * openFactor + smoothPointer.current.x * 0.055;
    const targetPitch =
      0.06 * (1 - openFactor) +
      (0.01 + contentTravel * 0.025) * openFactor -
      smoothPointer.current.y * 0.028;
    rig.current.rotation.y += (targetYaw - rig.current.rotation.y) * damp;
    rig.current.rotation.x += (targetPitch - rig.current.rotation.x) * damp;
    rig.current.position.y =
      0.16 * (1 - openFactor) + Math.sin(clock.elapsedTime * 0.7) * 0.02 * (motion ? 1 : 0);

    // Realistic hinge articulation: starts closed flat onto keyboard deck, then opens cleanly.
    if (hinge.current) {
      const targetLid = 1.5 * (1 - openFactor) + -0.15 * openFactor;
      hinge.current.rotation.x += (targetLid - hinge.current.rotation.x) * damp;
    }

    // Parallax studio arc & faceted nodes behind the laptop
    if (halo.current) {
      halo.current.rotation.z = -0.18 + travel * 0.55;
      halo.current.position.y = -0.18 + openFactor * 0.14;
      halo.current.scale.setScalar(0.92 + openFactor * 0.1 + contentTravel * 0.05);
    }
    visibleCrystals.forEach((crystal, index) => {
      const node = crystalRefs.current[index];
      if (!node) return;
      node.position.set(
        crystal.position[0] + crystal.parallax[0] * travel,
        crystal.position[1] + crystal.parallax[1] * travel,
        crystal.position[2] + crystal.parallax[2] * travel,
      );
      node.rotation.y = travel * (index % 2 === 0 ? 1.25 : -1.15);
      node.rotation.x = travel * 0.55;
    });

    // Centered studio framing with generous headroom so top screen text never clips.
    const ratio = size.width / Math.max(1, size.height);
    const distance = Math.max(8.05, 1.95 + 5.2 / (0.63 * ratio));
    const camX = (contentTravel - 0.5) * 0.28 * openFactor * (motion ? 1 : 0);
    const camY = 1.85 - openFactor * 0.32;
    const camZ = distance - openFactor * 0.28;
    camera.position.set(camX, camY, camZ);
    camera.lookAt(0, -0.14 - (1 - openFactor) * 0.35, 0.45);

    // Power on screen content ONLY once the lid has realistically opened past 70%.
    const screenOpacity = motion ? smoothstep(0.11, 0.18, travel) : 1;
    placeScreen(projectGlass(lid.current, camera, size, corner), screenOpacity);
  });

  return (
    <>
      <group ref={rig} rotation={[0.06, 0, 0]}>
        <LaptopHardware screenRef={lid} hingeRef={hinge} />
      </group>
      {/* Subtle Cobalt/Cyan architectural halo behind the laptop */}
      <group ref={halo} position={[0, -0.25, -1.35]}>
        <mesh>
          <torusGeometry args={[2.55, 0.011, 8, 96]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.28} />
        </mesh>
        <mesh rotation={[0.14, 0.18, 0]}>
          <torusGeometry args={[2.92, 0.008, 8, 96]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
        </mesh>
      </group>
      {visibleCrystals.map((crystal, index) => (
        <group
          key={crystal.position.join()}
          ref={(el) => {
            crystalRefs.current[index] = el;
          }}
          position={crystal.position}
        >
          <FacetedCrystal
            radius={crystal.radius}
            color={crystal.color}
            wireColor={crystal.wireColor}
            octahedron={crystal.octahedron}
            motion={motion}
            speed={crystal.speed}
          />
        </group>
      ))}
    </>
  );
}

function Computer({ placeScreen, progress, pointer, motion, compact }: SceneProps) {
  const rig = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  const cardRefs = useRef<(Group | null)[]>([]);
  const crystalRefs = useRef<(Group | null)[]>([]);
  const corner = useMemo(() => new Vector3(), []);
  const smoothPointer = useRef({ x: 0, y: 0 });
  const smoothScroll = useRef(0);
  const visibleCards = compact ? CARDS.slice(0, 2) : CARDS;
  const visibleCrystals = compact ? CRYSTALS.slice(0, 3) : CRYSTALS;

  useFrame((state, delta) => {
    const group = rig.current;
    if (!group) return;
    const clampedDelta = Math.min(delta, 0.065);
    const time = state.clock.elapsedTime;
    const ease = motion ? Math.min(1, clampedDelta * 5.2) : 1;
    const idle = motion ? 1 : 0;

    smoothPointer.current.x += ((motion ? pointer.current.x : 0) - smoothPointer.current.x) * ease;
    smoothPointer.current.y += ((motion ? pointer.current.y : 0) - smoothPointer.current.y) * ease;

    const targetScroll = motion ? progress.current : 0;
    smoothScroll.current += (targetScroll - smoothScroll.current) * ease;
    const scroll = smoothstep(0, 1, smoothScroll.current);

    // Continuous scroll-linked workstation orbit, subtle tilt and elevation
    const targetY =
      -0.25 + scroll * 0.46 + smoothPointer.current.x * 0.13 + Math.sin(time * 0.5) * 0.035 * idle;
    const targetX = 0.055 - scroll * 0.11 - smoothPointer.current.y * 0.095;
    group.rotation.y += (targetY - group.rotation.y) * ease;
    group.rotation.x += (targetX - group.rotation.x) * ease;
    group.position.y = -0.08 + scroll * 0.24 + Math.sin(time * 0.8) * 0.045 * idle;
    group.position.z = scroll * 0.34;

    // Separate holographic code cards cleanly in depth parallax as user scrolls
    visibleCards.forEach((card, index) => {
      const node = cardRefs.current[index];
      if (!node) return;
      node.position.set(
        card.position[0] + card.parallax[0] * scroll,
        card.position[1] + card.parallax[1] * scroll,
        card.position[2] + card.parallax[2] * scroll,
      );
      node.rotation.set(
        card.rotation[0] + scroll * 0.08,
        card.rotation[1] + scroll * card.scrollSpin,
        card.rotation[2],
      );
    });

    // Separate faceted Atlas crystal nodes along layered depth arcs
    visibleCrystals.forEach((crystal, index) => {
      const node = crystalRefs.current[index];
      if (!node) return;
      node.position.set(
        crystal.position[0] + crystal.parallax[0] * scroll,
        crystal.position[1] + crystal.parallax[1] * scroll,
        crystal.position[2] + crystal.parallax[2] * scroll,
      );
      node.rotation.y = scroll * (index % 2 === 0 ? 1.35 : -1.2);
      node.rotation.z = scroll * 0.45;
    });

    if (orbit.current) {
      if (motion) orbit.current.rotation.y += clampedDelta * (0.12 + scroll * 0.14);
      orbit.current.rotation.x = scroll * 0.16;
      orbit.current.scale.setScalar(1 + scroll * 0.08);
    }

    const camera = state.camera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const distance = Math.max(10.1, 7.3 / (0.63 * aspect));
    camera.position.set(
      smoothPointer.current.x * 0.35 - scroll * 0.44,
      1.28 - scroll * 0.32,
      distance - scroll * 0.68,
    );
    camera.lookAt(0, -0.14 + scroll * 0.14, 0);
    placeScreen(projectGlass(group, camera, state.size, corner), 1);
  });

  return (
    <>
      <group ref={rig}>
        {/* Monitor: brushed anodized aluminum shell, obsidian glass bezel, crisp screen sheen */}
        <RoundedBox
          args={[4.24, 2.8, 0.22]}
          position={[0, 0, -0.068]}
          radius={0.078}
          smoothness={4}
          bevelSegments={3}
        >
          <meshPhysicalMaterial
            color="#98a8bf"
            metalness={0.86}
            roughness={0.21}
            clearcoat={0.62}
            clearcoatRoughness={0.18}
          />
        </RoundedBox>
        <RoundedBox
          args={[4.15, 2.71, 0.074]}
          position={[0, 0, 0.05]}
          radius={0.036}
          smoothness={3}
          bevelSegments={2}
        >
          <meshPhysicalMaterial
            color="#111827"
            metalness={0.32}
            roughness={0.26}
            clearcoat={0.75}
            clearcoatRoughness={0.15}
          />
        </RoundedBox>
        <mesh position={[0, SCREEN_Y, 0.088]}>
          <planeGeometry args={[SCREEN_W + 0.074, SCREEN_H + 0.052]} />
          <meshPhysicalMaterial
            color="#060913"
            roughness={0.12}
            metalness={0.22}
            clearcoat={0.92}
            clearcoatRoughness={0.1}
          />
        </mesh>
        <mesh position={[1.85, -1.256, 0.089]}>
          <planeGeometry args={[0.072, 0.015]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
        <RoundedBox
          args={[3.58, 2.23, 0.29]}
          position={[0, 0.004, -0.182]}
          radius={0.135}
          smoothness={4}
          bevelSegments={2}
        >
          <meshPhysicalMaterial
            color="#334155"
            metalness={0.74}
            roughness={0.32}
            clearcoat={0.32}
          />
        </RoundedBox>
        <pointLight position={[0, 0.25, 1.75]} color="#7dd3fc" intensity={3.8} distance={6.5} />

        <ComputerHardware />
      </group>

      {visibleCards.map((card, index) => (
        <group
          key={card.position.join()}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          position={card.position}
          rotation={card.rotation}
        >
          <CodeCard lines={card.lines} accent={card.accent} motion={motion} speed={card.speed} />
        </group>
      ))}

      {visibleCrystals.map((crystal, index) => (
        <group
          key={crystal.position.join()}
          ref={(el) => {
            crystalRefs.current[index] = el;
          }}
          position={crystal.position}
        >
          <FacetedCrystal
            radius={crystal.radius}
            color={crystal.color}
            wireColor={crystal.wireColor}
            octahedron={crystal.octahedron}
            motion={motion}
            speed={crystal.speed}
          />
        </group>
      ))}

      {/* Precision dual Atlas Cobalt & Sky-Cyan orbital rings around the workstation */}
      <group ref={orbit} position={[0, -1.62, 0]}>
        {[
          { radius: 3.65, tilt: 0.22, color: '#818cf8', opacity: 0.3 },
          { radius: 4.25, tilt: -0.13, color: '#38bdf8', opacity: 0.22 },
        ].map((ring) => (
          <group key={ring.radius} rotation={[Math.PI / 2 + ring.tilt, 0, 0]}>
            <mesh>
              <torusGeometry args={[ring.radius, 0.01, 8, 96]} />
              <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} />
            </mesh>
            <mesh position={[ring.radius, 0, 0]}>
              <sphereGeometry args={[0.072, 16, 16]} />
              <meshBasicMaterial color={ring.color} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

export default function ComputerScene(props: SceneProps) {
  const { variant, motion, visible, compact, onReady, onFail } = props;
  const isStory = variant === 'story';

  // Procedural studio Lightformers cast crisp specular reflections onto aluminum & glass with zero network fetches.
  const studio = useMemo(
    () => (
      <Environment resolution={64} frames={1}>
        <Lightformer
          form="rect"
          intensity={3.6}
          color="#f8fafc"
          position={[0, 4.5, 3]}
          scale={[9, 2.2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.1}
          color="#6366f1"
          position={[-5.5, 1.2, -1.5]}
          scale={[3.5, 6.5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.3}
          color="#38bdf8"
          position={[5.5, 0.6, 1.8]}
          scale={[2.6, 5.5, 1]}
        />
        <Lightformer
          form="ring"
          intensity={2.2}
          color="#bae6fd"
          position={[0, 3.2, -4.5]}
          scale={[6, 2.5, 1]}
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
      {/* Balanced 3-point studio lighting: Warm key + Cobalt fill + Sky-Cyan rim */}
      <ambientLight intensity={isStory ? 0.76 : 0.62} color="#dbeafe" />
      <hemisphereLight args={['#e0f2fe', '#0b1120', isStory ? 0.95 : 0.68]} />
      <directionalLight
        position={[-3.2, 5.4, 6.2]}
        intensity={isStory ? 3.15 : 2.85}
        color="#fff4e6"
      />
      <directionalLight
        position={[4.6, 1.4, 4.8]}
        intensity={isStory ? 1.5 : 1.2}
        color="#818cf8"
      />
      <directionalLight
        position={[-4.2, 2.6, -4.4]}
        intensity={isStory ? 3.25 : 2.65}
        color="#38bdf8"
      />
      {isStory && <directionalLight position={[3.6, 3.8, -4.2]} intensity={2.2} color="#a5b4fc" />}
      {studio}
      {isStory ? (
        <Laptop {...props} />
      ) : (
        <>
          <Computer {...props} />
          <Sparkles
            count={compact ? 18 : 36}
            scale={[10.5, 6.2, 5.2]}
            size={2.1}
            speed={motion ? 0.32 : 0}
            color="#818cf8"
            opacity={0.48}
          />
          <Sparkles
            count={compact ? 10 : 18}
            scale={[9.5, 5.4, 4.5]}
            size={1.7}
            speed={motion ? 0.26 : 0}
            color="#38bdf8"
            opacity={0.44}
          />
        </>
      )}
    </Canvas>
  );
}
