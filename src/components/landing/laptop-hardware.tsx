import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { RoundedBox, RoundedBoxGeometry } from '@react-three/drei';
import {
  CanvasTexture,
  Color,
  Object3D,
  SRGBColorSpace,
  type Group,
  type InstancedMesh,
} from 'three';

type Key = string | [label: string, width: number];

const ROWS: Key[][] = [
  ['Esc', ...Array.from({ length: 12 }, (_, index) => `F${index + 1}`), '⏻'],
  ['~', ...'1234567890-=', ['⌫', 1.85]],
  [['Tab', 1.45], ...'QWERTYUIOP[]', ['\\', 1.4]],
  [['Caps', 1.7], ..."ASDFGHJKL;'", ['Enter', 2.15]],
  [['Shift', 2.1], ...'ZXCVBNM,./', ['Shift', 2.75]],
  [
    'Fn',
    'Ctrl',
    'Alt',
    ['⌘', 1.15],
    ['', 5.7],
    'Alt',
    ['←', 0.75],
    ['↑', 0.75],
    ['↓', 0.75],
    ['→', 0.75],
  ],
];

const KEYBOARD_WIDTH = 4.06;
const KEYBOARD_DEPTH = 1.16;
const KEYBOARD_CENTER = 0.748;
const KEY_PITCH = 0.215;
const DECK_TOP = -1.27;

const KEYS = ROWS.flatMap((row, rowIndex) => {
  const sizes = row.map((key) => (typeof key === 'string' ? 1 : key[1]));
  const rowWidth = sizes.reduce((total, size) => total + size * KEY_PITCH, 0);
  let left = -rowWidth / 2;
  return row.map((key, index) => {
    const label = typeof key === 'string' ? key : key[0];
    const cellWidth = sizes[index] * KEY_PITCH;
    const keycap = {
      label,
      x: left + cellWidth / 2,
      z: -0.462 + rowIndex * 0.18,
      width: cellWidth - 0.026,
      depth: rowIndex === 0 ? 0.112 : 0.149,
      color: label === 'Esc' ? '#4f46e5' : label === '⏻' ? '#1e293b' : '#1f293d',
    };
    left += cellWidth;
    return keycap;
  });
});

function LaptopKeyboard() {
  const keys = useRef<InstancedMesh>(null);
  const markingsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 292;
    const context = canvas.getContext('2d');
    if (context) {
      const pixelX = (x: number) => (x / KEYBOARD_WIDTH + 0.5) * canvas.width;
      const pixelZ = (z: number) => (z / KEYBOARD_DEPTH + 0.5) * canvas.height;

      context.textAlign = 'center';
      context.textBaseline = 'middle';
      for (const key of KEYS) {
        context.fillStyle =
          key.label === '⏻' ? '#38bdf8' : key.label === 'Esc' ? '#f8fafc' : '#e2eaf5';
        context.font = key.label.length > 1 ? '600 12px sans-serif' : '600 18px sans-serif';
        context.fillText(key.label, pixelX(key.x), pixelZ(key.z));
      }

      context.fillStyle = '#0f172a';
      context.beginPath();
      for (const side of [-1, 1]) {
        for (let row = 0; row < 18; row++) {
          for (let column = 0; column < 5; column++) {
            const x = pixelX(side * (1.777 + column * 0.043));
            const y = pixelZ(-0.448 + row * 0.047);
            context.moveTo(x + 2.1, y);
            context.arc(x, y, 2.1, 0, Math.PI * 2);
          }
        }
      }
      context.fill();
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);

  useEffect(() => {
    return () => {
      markingsTexture.dispose();
    };
  }, [markingsTexture]);

  useLayoutEffect(() => {
    const keyboard = keys.current;
    if (!keyboard) return;
    const transform = new Object3D();
    const color = new Color();
    KEYS.forEach((key, index) => {
      transform.position.set(key.x, 0.034, key.z);
      transform.scale.set(key.width / 0.189, 1, key.depth / 0.149);
      transform.updateMatrix();
      keyboard.setMatrixAt(index, transform.matrix);
      keyboard.setColorAt(index, color.set(key.color));
    });
    keyboard.instanceMatrix.needsUpdate = true;
    if (keyboard.instanceColor) keyboard.instanceColor.needsUpdate = true;
    keyboard.computeBoundingSphere();
  }, []);

  return (
    <group position={[0, DECK_TOP, KEYBOARD_CENTER]}>
      <RoundedBox args={[3.32, 0.024, 1.12]} radius={0.012} smoothness={3} bevelSegments={1}>
        <meshStandardMaterial color="#090e1a" roughness={0.62} metalness={0.22} />
      </RoundedBox>
      <instancedMesh ref={keys} args={[undefined, undefined, KEYS.length]}>
        <RoundedBoxGeometry
          args={[0.189, 0.036, 0.149]}
          radius={0.012}
          smoothness={2}
          bevelSegments={1}
        />
        <meshStandardMaterial roughness={0.44} metalness={0.2} />
      </instancedMesh>
      <mesh position={[0, 0.053, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[KEYBOARD_WIDTH, KEYBOARD_DEPTH]} />
        <meshBasicMaterial
          map={markingsTexture}
          transparent
          opacity={0.92}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function LaptopShadow() {
  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const context = canvas.getContext('2d');
    if (context) {
      // Soft Cobalt + Sky-Cyan ambient bounce pool around the grounded shadow
      const pool = context.createRadialGradient(128, 96, 20, 128, 96, 124);
      pool.addColorStop(0, 'rgba(2,6,23,0.94)');
      pool.addColorStop(0.5, 'rgba(6,9,19,0.78)');
      pool.addColorStop(0.76, 'rgba(79,70,229,0.26)');
      pool.addColorStop(0.9, 'rgba(56,189,248,0.12)');
      pool.addColorStop(1, 'rgba(56,189,248,0)');
      context.fillStyle = pool;
      context.fillRect(0, 0, 256, 192);
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);

  useEffect(() => {
    return () => {
      shadowTexture.dispose();
    };
  }, [shadowTexture]);

  return (
    <mesh position={[0, -1.504, 0.91]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[6.4, 3.9]} />
      <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

const PORTS = [
  { x: -2.183, z: 0.36, depth: 0.19 },
  { x: -2.183, z: 0.63, depth: 0.19 },
  { x: 2.183, z: 0.46, depth: 0.22 },
  { x: 2.183, z: 0.79, depth: 0.082 },
];

export function LaptopHardware({
  screenRef,
  hingeRef,
}: {
  screenRef: RefObject<Group | null>;
  hingeRef?: RefObject<Group | null>;
}) {
  return (
    <>
      <group ref={hingeRef} position={[0, -1.265, -0.015]} rotation={[-0.17, 0, 0]}>
        <group ref={screenRef} position={[0, 1.29, 0]}>
          {/* Brushed anodized space-silver aluminum lid */}
          <RoundedBox
            args={[4.28, 2.81, 0.156]}
            position={[0, 0, -0.014]}
            radius={0.062}
            smoothness={4}
            bevelSegments={3}
          >
            <meshPhysicalMaterial
              color="#adbdd4"
              metalness={0.86}
              roughness={0.2}
              clearcoat={0.62}
              clearcoatRoughness={0.18}
            />
          </RoundedBox>
          {/* Precision metallic chamfer trim around the screen bezel */}
          <RoundedBox
            args={[4.245, 2.775, 0.062]}
            position={[0, 0, 0.044]}
            radius={0.036}
            smoothness={3}
            bevelSegments={2}
          >
            <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.2} />
          </RoundedBox>
          {/* Obsidian glass bezel */}
          <RoundedBox
            args={[4.205, 2.735, 0.052]}
            position={[0, 0, 0.06]}
            radius={0.026}
            smoothness={3}
            bevelSegments={2}
          >
            <meshPhysicalMaterial
              color="#0b1120"
              metalness={0.24}
              roughness={0.18}
              clearcoat={0.85}
              clearcoatRoughness={0.14}
            />
          </RoundedBox>
          {/* Screen glass surface */}
          <mesh position={[0, 0.07, 0.087]}>
            <planeGeometry args={[3.984, 2.499]} />
            <meshPhysicalMaterial
              color="#060913"
              roughness={0.12}
              metalness={0.22}
              clearcoat={0.92}
              clearcoatRoughness={0.1}
            />
          </mesh>
          {/* Camera ring + Sky-Cyan privacy LED */}
          <mesh position={[0, 1.342, 0.0875]}>
            <circleGeometry args={[0.018, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.65} roughness={0.26} />
          </mesh>
          <mesh position={[0, 1.342, 0.089]}>
            <circleGeometry args={[0.009, 12]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.058, 1.342, 0.0875]}>
            <circleGeometry args={[0.0055, 10]} />
            <meshBasicMaterial color="#38bdf8" toneMapped={false} />
          </mesh>
          {/* Subtle Atlas Indigo brand accent bar */}
          <mesh position={[0, -1.277, 0.0875]}>
            <planeGeometry args={[0.2, 0.013]} />
            <meshBasicMaterial color="#818cf8" toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* Unibody machined aluminum deck */}
      <RoundedBox
        args={[4.37, 0.22, 2.3]}
        position={[0, DECK_TOP - 0.11, 0.9935]}
        radius={0.084}
        smoothness={4}
        bevelSegments={3}
      >
        <meshPhysicalMaterial
          color="#b2c2d9"
          roughness={0.21}
          metalness={0.84}
          clearcoat={0.58}
          clearcoatRoughness={0.19}
        />
      </RoundedBox>
      {/* Subtle front edge cyan/indigo studio light-catch strip */}
      <RoundedBox
        args={[4.12, 0.016, 0.02]}
        position={[0, DECK_TOP - 0.036, 2.138]}
        radius={0.006}
        smoothness={2}
        bevelSegments={1}
      >
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.9}
          roughness={0.16}
          emissive="#38bdf8"
          emissiveIntensity={0.18}
        />
      </RoundedBox>
      {/* Obsidian underbody */}
      <RoundedBox
        args={[4.245, 0.072, 2.163]}
        position={[0, -1.462, 0.9935]}
        radius={0.033}
        smoothness={3}
        bevelSegments={1}
      >
        <meshStandardMaterial color="#1e293b" roughness={0.42} metalness={0.62} />
      </RoundedBox>

      {/* Precision dual hinges */}
      {[-1.45, 1.45].map((x) => (
        <mesh key={x} position={[x, -1.252, -0.004]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.072, 0.072, 0.7, 18]} />
          <meshStandardMaterial color="#64748b" roughness={0.26} metalness={0.82} />
        </mesh>
      ))}
      {/* Side ports */}
      {PORTS.map((port) => (
        <RoundedBox
          key={port.z}
          args={[0.016, 0.058, port.depth]}
          position={[port.x, -1.381, port.z]}
          radius={0.006}
          smoothness={2}
          bevelSegments={1}
        >
          <meshStandardMaterial color="#0b1120" roughness={0.58} />
        </RoundedBox>
      ))}

      <LaptopKeyboard />
      {/* Chamfered precision glass trackpad */}
      <RoundedBox
        args={[1.45, 0.027, 0.6]}
        position={[0, -1.258, 1.679]}
        radius={0.012}
        smoothness={3}
        bevelSegments={2}
      >
        <meshStandardMaterial color="#475569" roughness={0.34} metalness={0.68} />
      </RoundedBox>
      <RoundedBox
        args={[1.395, 0.019, 0.553]}
        position={[0, -1.246, 1.679]}
        radius={0.009}
        smoothness={3}
        bevelSegments={1}
      >
        <meshPhysicalMaterial
          color="#9cb0c9"
          roughness={0.28}
          metalness={0.6}
          clearcoat={0.42}
          clearcoatRoughness={0.22}
        />
      </RoundedBox>
      {/* Front thumb notch */}
      <RoundedBox
        args={[0.48, 0.028, 0.016]}
        position={[0, -1.395, 2.142]}
        radius={0.006}
        smoothness={2}
        bevelSegments={1}
      >
        <meshStandardMaterial color="#334155" roughness={0.36} metalness={0.55} />
      </RoundedBox>
      <LaptopShadow />
    </>
  );
}
