'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { canUse3D } from '@/lib/webgl-support';

export type AtlasLoaderSize = 'sm' | 'md' | 'lg';

const DIMENSIONS: Record<AtlasLoaderSize, number> = {
  sm: 44,
  md: 64,
  lg: 88,
};

/**
 * Lightweight, instant isometric geometric fallback rendered during SSR, on weak/non-WebGL
 * devices, and under prefers-reduced-motion. Uses zero CSS infinite animations so reduced-motion
 * and non-landing route animation invariants stay 100% clean.
 */
function GeometricFallback({ px }: { px: number }) {
  const uid = useId();
  const coreGrad = `atlas-core-${uid}`;
  const ringCobalt = `atlas-ring-cobalt-${uid}`;
  const ringCyan = `atlas-ring-cyan-${uid}`;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 88 88"
      fill="none"
      aria-hidden="true"
      className="block shrink-0 select-none"
    >
      <defs>
        <linearGradient
          id={coreGrad}
          x1="20"
          y1="16"
          x2="68"
          y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="52%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient
          id={ringCobalt}
          x1="8"
          y1="44"
          x2="80"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient
          id={ringCyan}
          x1="14"
          y1="18"
          x2="74"
          y2="70"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.92" />
          <stop offset="50%" stopColor="#0284c7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.88" />
        </linearGradient>
      </defs>

      {/* Outer tilted Sky-Cyan orbital ring */}
      <ellipse
        cx="44"
        cy="44"
        rx="38"
        ry="15"
        transform="rotate(-24 44 44)"
        stroke={`url(#${ringCyan})`}
        strokeWidth="1.75"
      />
      <circle cx="11.5" cy="30.5" r="2.6" fill="#38bdf8" />

      {/* Inner counter-tilted Indigo-Cobalt orbital ring */}
      <ellipse
        cx="44"
        cy="44"
        rx="31"
        ry="12.5"
        transform="rotate(28 44 44)"
        stroke={`url(#${ringCobalt})`}
        strokeWidth="2"
      />
      <circle cx="71" cy="58.5" r="2.8" fill="#818cf8" />

      {/* Faceted isometric icosahedron core */}
      <polygon
        points="44,19 64,31 64,57 44,69 24,57 24,31"
        fill={`url(#${coreGrad})`}
        stroke="#38bdf8"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Internal precision crystal facet edges */}
      <path
        d="M44 19L44 44M44 44L64 31M44 44L64 57M44 44L44 69M44 44L24 57M44 44L24 31M24 31L64 31L44 69L24 31Z"
        stroke="#bae6fd"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="44" cy="44" r="2.5" fill="#e0f2fe" />
    </svg>
  );
}

/**
 * Original 3D DevAtlas loader: a faceted metallic Indigo-Cobalt icosahedron with a Sky-Cyan
 * wireframe edge cage and dual counter-tilted orbital rings on a compact Three.js WebGL canvas.
 * Properly disposes all GPU resources on unmount and falls back instantly to a crisp geometric
 * isometric emblem during SSR, under prefers-reduced-motion, or when WebGL is unavailable.
 */
export function AtlasLoader3D({
  size = 'md',
  className = '',
}: {
  size?: AtlasLoaderSize;
  className?: string;
}) {
  const px = DIMENSIONS[size];
  const hostRef = useRef<HTMLDivElement>(null);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reduce || reduce.matches || !canUse3D()) return;

    let disposed = false;
    let frameId = 0;
    let inView = true;
    let cleanupScene: (() => void) | null = null;

    async function mountScene() {
      try {
        const THREE = await import('three');
        if (disposed || !host || reduce.matches) return;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(px, px, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.setClearColor(0x000000, 0);

        const canvas = renderer.domElement;
        canvas.style.width = `${px}px`;
        canvas.style.height = `${px}px`;
        canvas.style.display = 'block';

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
        camera.position.set(0, 0.15, 4.8);
        camera.lookAt(0, 0, 0);

        // Balanced 3-point studio lighting: Warm key + Cobalt fill + Sky-Cyan rim
        const ambient = new THREE.AmbientLight(0xdbeafe, 0.85);
        const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.9);
        keyLight.position.set(-3, 4.5, 5);
        const fillLight = new THREE.DirectionalLight(0x818cf8, 1.8);
        fillLight.position.set(4, -2, 3.5);
        const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
        rimLight.position.set(-2.5, 2.5, -4);
        scene.add(ambient, keyLight, fillLight, rimLight);

        const root = new THREE.Group();
        scene.add(root);

        // Faceted icosahedron core + Sky-Cyan precision wireframe edge cage
        const coreGeo = new THREE.IcosahedronGeometry(0.74, 0);
        const coreMat = new THREE.MeshPhysicalMaterial({
          color: 0x4f46e5,
          metalness: 0.48,
          roughness: 0.2,
          clearcoat: 0.9,
          clearcoatRoughness: 0.14,
          flatShading: true,
          emissive: 0x1e1b4b,
          emissiveIntensity: 0.45,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);

        const edgeGeo = new THREE.EdgesGeometry(coreGeo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.85,
        });
        const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
        edgeLines.scale.setScalar(1.03);
        coreMesh.add(edgeLines);
        root.add(coreMesh);

        // Inner Atlas Indigo-Cobalt orbital ring + node
        const innerRingGroup = new THREE.Group();
        innerRingGroup.rotation.set(0.95, 0.38, 0.24);
        const innerRingGeo = new THREE.TorusGeometry(1.14, 0.032, 12, 64);
        const innerRingMat = new THREE.MeshStandardMaterial({
          color: 0x818cf8,
          emissive: 0x4f46e5,
          emissiveIntensity: 0.55,
          metalness: 0.65,
          roughness: 0.22,
        });
        const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
        const innerNodeGeo = new THREE.SphereGeometry(0.082, 14, 14);
        const innerNodeMat = new THREE.MeshBasicMaterial({ color: 0xa5b4fc });
        const innerNodeMesh = new THREE.Mesh(innerNodeGeo, innerNodeMat);
        innerNodeMesh.position.set(1.14, 0, 0);
        innerRingGroup.add(innerRingMesh, innerNodeMesh);
        root.add(innerRingGroup);

        // Outer Precision Sky-Cyan orbital ring + node
        const outerRingGroup = new THREE.Group();
        outerRingGroup.rotation.set(-0.78, -0.46, -0.18);
        const outerRingGeo = new THREE.TorusGeometry(1.42, 0.025, 12, 72);
        const outerRingMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.5,
          metalness: 0.6,
          roughness: 0.2,
        });
        const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
        const outerNodeGeo = new THREE.SphereGeometry(0.072, 14, 14);
        const outerNodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const outerNodeMesh = new THREE.Mesh(outerNodeGeo, outerNodeMat);
        outerNodeMesh.position.set(-1.42, 0, 0);
        outerRingGroup.add(outerRingMesh, outerNodeMesh);
        root.add(outerRingGroup);

        const onContextLost = (event: Event) => {
          event.preventDefault();
          if (!disposed) setWebglReady(false);
        };
        canvas.addEventListener('webglcontextlost', onContextLost, { once: true });

        const observer = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
        });
        observer.observe(host);

        host.appendChild(canvas);
        const start = performance.now();
        renderer.render(scene, camera);
        setWebglReady(true);

        const animate = () => {
          if (disposed) return;
          frameId = requestAnimationFrame(animate);
          if (!inView || document.hidden) return;
          const elapsed = (performance.now() - start) / 1000;
          coreMesh.rotation.y = elapsed * 0.95;
          coreMesh.rotation.x = Math.sin(elapsed * 0.7) * 0.35;
          innerRingGroup.rotation.z = elapsed * 1.35;
          outerRingGroup.rotation.z = -elapsed * 1.05;
          root.position.y = Math.sin(elapsed * 1.6) * 0.05;
          renderer.render(scene, camera);
        };
        frameId = requestAnimationFrame(animate);

        cleanupScene = () => {
          cancelAnimationFrame(frameId);
          observer.disconnect();
          canvas.removeEventListener('webglcontextlost', onContextLost);
          coreGeo.dispose();
          coreMat.dispose();
          edgeGeo.dispose();
          edgeMat.dispose();
          innerRingGeo.dispose();
          innerRingMat.dispose();
          innerNodeGeo.dispose();
          innerNodeMat.dispose();
          outerRingGeo.dispose();
          outerRingMat.dispose();
          outerNodeGeo.dispose();
          outerNodeMat.dispose();
          renderer.dispose();
          canvas.remove();
        };
      } catch {
        if (!disposed) setWebglReady(false);
      }
    }

    const onReduceChange = () => {
      if (reduce.matches) {
        cleanupScene?.();
        cleanupScene = null;
        setWebglReady(false);
      }
    };
    reduce.addEventListener('change', onReduceChange);
    void mountScene();

    return () => {
      disposed = true;
      reduce.removeEventListener('change', onReduceChange);
      cleanupScene?.();
      cleanupScene = null;
    };
  }, [px]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{ width: px, height: px }}
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
    >
      {!webglReady && <GeometricFallback px={px} />}
    </div>
  );
}
