import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBox, RoundedBoxGeometry } from '@react-three/drei';
import { CanvasTexture, Color, Object3D, SRGBColorSpace, type InstancedMesh } from 'three';

type Key = string | [label: string, units: number];

const KEY_ROWS: Key[][] = [
  ['Esc', ...Array.from({ length: 12 }, (_, index) => `F${index + 1}`), 'Ins', 'Del'],
  ['~', ...'1234567890-=', ['Backspace', 2]],
  [['Tab', 1.45], ...'QWERTYUIOP[]', ['\\', 1.55]],
  [['Caps', 1.7], ..."ASDFGHJKL;'", ['Enter', 2.3]],
  [['Shift', 2.2], ...'ZXCVBNM,./', ['Shift', 1.8], '↑'],
  [['Ctrl', 1.2], ['Alt', 1.2], ['Fn', 1.1], ['', 6.5], ['Alt', 1.1], ['Ctrl', 0.9], '←', '↓', '→'],
];

const KEY_PITCH = 0.2;
const KEYBOARD_WIDTH = 3.2;
const KEYBOARD_DEPTH = 1.04;
const KEYS = KEY_ROWS.flatMap((row, rowIndex) => {
  let left = -1.5;
  return row.map((key) => {
    const [label, units] = typeof key === 'string' ? [key, 1] : key;
    const cellWidth = units * KEY_PITCH;
    const center = left + cellWidth / 2;
    left += cellWidth;
    return {
      label,
      x: center,
      z: -0.4 + rowIndex * 0.158,
      width: cellWidth - 0.024,
      depth: rowIndex === 0 ? 0.104 : 0.13,
      color:
        label === 'Esc'
          ? '#4f46e5'
          : label === 'Enter'
            ? '#334155'
            : units > 1 || rowIndex === 0
              ? '#243045'
              : '#2f3d55',
    };
  });
});

function Keyboard() {
  const keys = useRef<InstancedMesh>(null);
  const legendsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 336;
    const context = canvas.getContext('2d');
    if (context) {
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      for (const key of KEYS) {
        if (!key.label) continue;
        const left = (key.x / KEYBOARD_WIDTH + 0.5) * canvas.width;
        const top = (key.z / KEYBOARD_DEPTH + 0.5) * canvas.height;
        context.fillStyle =
          key.label === 'Esc' ? '#f8fafc' : key.label === 'Enter' ? '#7dd3fc' : '#dbe6f5';
        context.font = key.label.length > 2 ? '600 13px sans-serif' : '600 19px sans-serif';
        context.fillText(key.label, left, top);
      }
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);

  useEffect(() => {
    return () => {
      legendsTexture.dispose();
    };
  }, [legendsTexture]);

  useLayoutEffect(() => {
    const mesh = keys.current;
    if (!mesh) return;
    const transform = new Object3D();
    const color = new Color();
    KEYS.forEach((key, index) => {
      transform.position.set(key.x, 0.064, key.z);
      transform.scale.set(key.width / 0.176, 1, key.depth / 0.13);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
      mesh.setColorAt(index, color.set(key.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group position={[-0.18, -2.346, 1.39]} rotation={[0.095, -0.025, 0]}>
      <RoundedBox args={[3.26, 0.1, 1.1]} radius={0.036} smoothness={3} bevelSegments={2}>
        <meshPhysicalMaterial
          color="#9aaac0"
          metalness={0.84}
          roughness={0.23}
          clearcoat={0.48}
          clearcoatRoughness={0.22}
        />
      </RoundedBox>
      <RoundedBox
        args={[3.11, 0.025, 0.98]}
        position={[0, 0.039, 0]}
        radius={0.011}
        smoothness={2}
        bevelSegments={1}
      >
        <meshStandardMaterial color="#0b1120" roughness={0.62} metalness={0.25} />
      </RoundedBox>
      <instancedMesh ref={keys} args={[undefined, undefined, KEYS.length]}>
        <RoundedBoxGeometry
          args={[0.176, 0.038, 0.13]}
          radius={0.012}
          smoothness={2}
          bevelSegments={1}
        />
        <meshStandardMaterial roughness={0.46} metalness={0.18} />
      </instancedMesh>
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[KEYBOARD_WIDTH, KEYBOARD_DEPTH]} />
        <meshBasicMaterial
          map={legendsTexture}
          transparent
          opacity={0.88}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Mouse() {
  return (
    <group position={[2.09, -2.445, 1.44]} rotation={[0, -0.2, 0]}>
      <mesh position={[0, 0.038, 0]} scale={[0.265, 0.038, 0.39]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshStandardMaterial color="#111827" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.055, 0]} scale={[0.262, 0.15, 0.385]}>
        <sphereGeometry args={[1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#55657d"
          metalness={0.45}
          roughness={0.24}
          clearcoat={0.62}
          clearcoatRoughness={0.18}
        />
      </mesh>
      <RoundedBox
        args={[0.087, 0.023, 0.17]}
        position={[0, 0.19, -0.16]}
        rotation={[-0.17, 0, 0]}
        radius={0.01}
        smoothness={2}
        bevelSegments={1}
      >
        <meshStandardMaterial color="#0b1120" roughness={0.65} />
      </RoundedBox>
      <mesh position={[0, 0.204, -0.145]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.034, 0.034, 0.057, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.78} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.188, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.014, 12]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.16, -0.282]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.011, 0.012, 0.117]} />
        <meshStandardMaterial color="#1e293b" roughness={0.64} />
      </mesh>
    </group>
  );
}

const SHADOW_WIDTH = 6.8;
const SHADOW_DEPTH = 5.0;
const SHADOW_CENTER = 0.45;

function DeskShadow() {
  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 192;
    const context = canvas.getContext('2d');
    if (context) {
      const ellipses = [
        { x: 0, z: 0.18, width: 3.25, depth: 2.15, color: '79,70,229', opacity: 0.28 },
        { x: 0.2, z: 0.55, width: 2.35, depth: 1.55, color: '56,189,248', opacity: 0.14 },
        { x: 0, z: -0.31, width: 1.48, depth: 1.0, color: '2,6,23', opacity: 0.9 },
        { x: -0.18, z: 1.39, width: 2.2, depth: 0.86, color: '2,6,23', opacity: 0.88 },
        { x: 2.09, z: 1.44, width: 0.5, depth: 0.7, color: '2,6,23', opacity: 0.86 },
      ];
      for (const ellipse of ellipses) {
        context.save();
        context.translate(
          (0.5 + ellipse.x / SHADOW_WIDTH) * canvas.width,
          (0.5 + (ellipse.z - SHADOW_CENTER) / SHADOW_DEPTH) * canvas.height,
        );
        context.scale(
          (ellipse.width / SHADOW_WIDTH) * canvas.width,
          (ellipse.depth / SHADOW_DEPTH) * canvas.height,
        );
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
        gradient.addColorStop(0, `rgba(${ellipse.color},${ellipse.opacity})`);
        gradient.addColorStop(0.5, `rgba(${ellipse.color},${ellipse.opacity * 0.58})`);
        gradient.addColorStop(1, `rgba(${ellipse.color},0)`);
        context.fillStyle = gradient;
        context.fillRect(-1, -1, 2, 2);
        context.restore();
      }
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
    <mesh position={[0, -2.45, SHADOW_CENTER]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[SHADOW_WIDTH, SHADOW_DEPTH]} />
      <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export function ComputerHardware() {
  return (
    <>
      <RoundedBox
        args={[0.42, 1.38, 0.21]}
        position={[0, -1.72, -0.29]}
        rotation={[-0.14, 0, 0]}
        radius={0.057}
        smoothness={3}
        bevelSegments={2}
      >
        <meshPhysicalMaterial
          color="#96a6bc"
          metalness={0.86}
          roughness={0.22}
          clearcoat={0.5}
          clearcoatRoughness={0.22}
        />
      </RoundedBox>
      <RoundedBox
        args={[1.68, 0.088, 1.1]}
        position={[0, -2.394, -0.32]}
        radius={0.04}
        smoothness={3}
        bevelSegments={2}
      >
        <meshPhysicalMaterial
          color="#93a3ba"
          metalness={0.86}
          roughness={0.22}
          clearcoat={0.55}
          clearcoatRoughness={0.2}
        />
      </RoundedBox>
      <RoundedBox
        args={[1.56, 0.02, 0.98]}
        position={[0, -2.442, -0.32]}
        radius={0.008}
        smoothness={2}
        bevelSegments={1}
      >
        <meshStandardMaterial color="#0f172a" metalness={0.35} roughness={0.62} />
      </RoundedBox>
      <Keyboard />
      <Mouse />
      <DeskShadow />
    </>
  );
}
