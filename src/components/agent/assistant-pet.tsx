'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { canUse3D } from '@/lib/webgl-support';
import type { VoicePhase } from './use-voice-assistant';

const PHASE_ACCENT: Record<VoicePhase, { primary: string; glow: string; ring: string }> = {
  idle: { primary: '#6366f1', glow: '#38bdf8', ring: '#818cf8' },
  listening: { primary: '#ef4444', glow: '#fb7185', ring: '#fda4af' },
  thinking: { primary: '#f59e0b', glow: '#38bdf8', ring: '#fbbf24' },
  speaking: { primary: '#10b981', glow: '#38bdf8', ring: '#34d399' },
};

function FallbackAvatar({
  phase,
  size,
  level,
}: {
  phase: VoicePhase;
  size: number;
  level: number;
}) {
  const uid = useId();
  const accent = PHASE_ACCENT[phase];
  const mouthHeight =
    phase === 'speaking' ? 4 + Math.round(level * 12) : phase === 'listening' ? 6 : 3;
  const ringScale = phase === 'listening' ? 1.07 : phase === 'speaking' ? 1 + level * 0.14 : 1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className="block shrink-0 select-none"
    >
      <defs>
        <radialGradient id={`orb-${uid}`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="38%" stopColor={accent.primary} />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="45%" stopColor={accent.glow} stopOpacity="0.32" />
          <stop offset="100%" stopColor={accent.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r={54 * ringScale} fill={`url(#halo-${uid})`} />
      <ellipse
        cx="60"
        cy="60"
        rx="48"
        ry="18"
        transform={`rotate(${phase === 'thinking' ? 32 : -18} 60 60)`}
        stroke={accent.ring}
        strokeOpacity="0.7"
        strokeWidth="2.2"
      />
      <ellipse
        cx="60"
        cy="60"
        rx="42"
        ry="15"
        transform={`rotate(${phase === 'thinking' ? -36 : 24} 60 60)`}
        stroke={accent.glow}
        strokeOpacity="0.55"
        strokeWidth="1.6"
      />
      <circle
        cx="60"
        cy="60"
        r="32"
        fill={`url(#orb-${uid})`}
        stroke={accent.ring}
        strokeWidth="1.5"
      />
      <rect x="37" y="47" width="46" height="24" rx="12" fill="#060913" fillOpacity="0.88" />
      <circle cx="50" cy="57" r={phase === 'listening' ? 4.2 : 3.4} fill={accent.glow} />
      <circle cx="70" cy="57" r={phase === 'listening' ? 4.2 : 3.4} fill={accent.glow} />
      <rect
        x={60 - (phase === 'speaking' ? 9 : 6)}
        y={64 - mouthHeight / 2}
        width={phase === 'speaking' ? 18 : 12}
        height={mouthHeight}
        rx="3"
        fill={accent.primary}
      />
    </svg>
  );
}

/**
 * Reactive 3D WebGL Voice Instructor orb-mentor with dual gyroscope rings, glowing core,
 * and live audio-amplitude animation. Falls back cleanly to the SVG avatar in compact bubble
 * mode, SSR, jsdom tests, reduced-motion, or non-WebGL browsers.
 */
export function AssistantPet({
  phase,
  compact = false,
  audioLevel = 0,
}: {
  phase: VoicePhase;
  compact?: boolean;
  audioLevel?: number;
}) {
  const size = compact ? 38 : 128;
  const hostRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<VoicePhase>(phase);
  const levelRef = useRef<number>(audioLevel);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    levelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    if (compact) return;
    const host = hostRef.current;
    if (!host || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reduce || reduce.matches || !canUse3D()) return;

    let disposed = false;
    let frameId = 0;
    let cleanup: (() => void) | null = null;

    async function mount() {
      try {
        const THREE = await import('three');
        if (disposed || !host || reduce.matches) return;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.setSize(size, size, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.28;
        renderer.setClearColor(0x000000, 0);

        const canvas = renderer.domElement;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        canvas.style.display = 'block';

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
        camera.position.set(0, 0.12, 4.9);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.AmbientLight(0xdbeafe, 0.95));
        const key = new THREE.DirectionalLight(0xfff5ea, 3.0);
        key.position.set(-3, 4.5, 5);
        const fill = new THREE.DirectionalLight(0x818cf8, 2.0);
        fill.position.set(4, -2, 3.5);
        const rim = new THREE.DirectionalLight(0x38bdf8, 2.9);
        rim.position.set(0, 3, -4);
        scene.add(key, fill, rim);

        const root = new THREE.Group();
        scene.add(root);

        // Smooth metallic AI mentor sphere head
        const headGeo = new THREE.SphereGeometry(0.84, 32, 32);
        const headMat = new THREE.MeshPhysicalMaterial({
          color: 0x4f46e5,
          metalness: 0.52,
          roughness: 0.16,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          emissive: 0x1e1b4b,
          emissiveIntensity: 0.55,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        root.add(head);

        // Obsidian visor glass
        const visorGeo = new THREE.CapsuleGeometry(0.28, 0.44, 12, 20);
        visorGeo.rotateZ(Math.PI / 2);
        const visorMat = new THREE.MeshPhysicalMaterial({
          color: 0x060913,
          metalness: 0.35,
          roughness: 0.08,
          clearcoat: 1,
        });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0.04, 0.64);
        head.add(visor);

        // Glowing reactive eyes
        const eyeGeo = new THREE.SphereGeometry(0.085, 16, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.22, 0.08, 0.87);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.22, 0.08, 0.87);
        head.add(leftEye, rightEye);

        // Audio-reactive voice waveform bar inside the visor
        const bars: InstanceType<typeof THREE.Mesh>[] = [];
        const barGeo = new THREE.BoxGeometry(0.052, 0.08, 0.04);
        const barMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
        for (let i = -2; i <= 2; i++) {
          const bar = new THREE.Mesh(barGeo, barMat);
          bar.position.set(i * 0.085, -0.09, 0.87);
          head.add(bar);
          bars.push(bar);
        }

        // Dual gyroscope rings reacting to phase
        const ring1Geo = new THREE.TorusGeometry(1.18, 0.032, 14, 72);
        const ring1Mat = new THREE.MeshStandardMaterial({
          color: 0x818cf8,
          emissive: 0x4f46e5,
          emissiveIntensity: 0.65,
          metalness: 0.72,
          roughness: 0.18,
        });
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.rotation.set(1.05, 0.32, 0);
        root.add(ring1);

        const ring2Geo = new THREE.TorusGeometry(1.42, 0.024, 14, 72);
        const ring2Mat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.65,
          metalness: 0.68,
          roughness: 0.18,
        });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.set(-0.85, -0.42, 0);
        root.add(ring2);

        const pulseGeo = new THREE.RingGeometry(0.95, 1.03, 48);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.0,
          side: THREE.DoubleSide,
        });
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        root.add(pulse);

        const targetColor = new THREE.Color(0x4f46e5);
        const targetEye = new THREE.Color(0x38bdf8);

        const onLost = (e: Event) => {
          e.preventDefault();
          if (!disposed) setWebglReady(false);
        };
        canvas.addEventListener('webglcontextlost', onLost, { once: true });

        host.appendChild(canvas);
        setWebglReady(true);
        const start = performance.now();

        const animate = () => {
          if (disposed) return;
          frameId = requestAnimationFrame(animate);
          if (document.hidden) return;
          const t = (performance.now() - start) / 1000;
          const p = phaseRef.current;
          const lvl = levelRef.current;

          // Smooth color transitions by phase
          if (p === 'listening') {
            targetColor.set(0xe11d48);
            targetEye.set(0xfda4af);
          } else if (p === 'thinking') {
            targetColor.set(0xd97706);
            targetEye.set(0xfde68a);
          } else if (p === 'speaking') {
            targetColor.set(0x059669);
            targetEye.set(0x6ee7b7);
          } else {
            targetColor.set(0x4f46e5);
            targetEye.set(0x38bdf8);
          }
          headMat.color.lerp(targetColor, 0.08);
          ring1Mat.emissive.lerp(targetColor, 0.08);
          eyeMat.color.lerp(targetEye, 0.12);
          barMat.color.lerp(targetEye, 0.12);

          // Natural floating + head responsiveness
          root.position.y = Math.sin(t * (p === 'speaking' ? 3.2 : 1.7)) * 0.07;
          head.rotation.y =
            p === 'thinking'
              ? Math.sin(t * 2.6) * 0.35
              : p === 'speaking'
                ? Math.sin(t * 1.9) * 0.2
                : Math.sin(t * 0.9) * 0.15;
          head.rotation.x =
            p === 'listening' ? -0.08 + Math.sin(t * 4) * 0.04 : Math.sin(t * 1.1) * 0.06;

          // Natural eye blink every ~4 seconds when idle
          const blinkCycle = t % 4.2;
          const blink = p === 'idle' && blinkCycle > 4.02 ? 0.15 : 1;
          leftEye.scale.y = blink;
          rightEye.scale.y = blink;

          // Voice equalizer bars react to live audio amplitude (or synthetic cadence fallback)
          const activeEnergy =
            p === 'speaking'
              ? Math.max(lvl, 0.25 + Math.abs(Math.sin(t * 10.5)) * 0.55)
              : p === 'listening'
                ? 0.22 + Math.abs(Math.sin(t * 7.2)) * 0.4
                : p === 'thinking'
                  ? 0.15
                  : 0.08;
          bars.forEach((bar, idx) => {
            const centerWeight = 1 - Math.abs(idx - 2) * 0.22;
            const wave = Math.abs(Math.sin(t * 11 + idx * 1.35));
            const h = 0.5 + activeEnergy * (1.2 + wave * 2.2) * centerWeight;
            bar.scale.y = h;
          });

          // Gyroscope ring speeds
          const speed =
            p === 'thinking' ? 2.8 : p === 'listening' ? 1.9 : p === 'speaking' ? 1.5 : 0.7;
          ring1.rotation.z = t * speed;
          ring2.rotation.z = -t * speed * 0.85;
          const scalePulse =
            p === 'speaking'
              ? 1 + activeEnergy * 0.12
              : p === 'listening'
                ? 1 + Math.sin(t * 6) * 0.06
                : 1;
          ring1.scale.setScalar(scalePulse);
          ring2.scale.setScalar(scalePulse);

          // Expanding acoustic wave ring during listening & speaking
          if (p === 'listening' || p === 'speaking') {
            const cycle = (t * (p === 'listening' ? 1.35 : 1.1)) % 1;
            pulse.scale.setScalar(0.95 + cycle * 0.75);
            pulseMat.opacity = (1 - cycle) * 0.55;
            pulseMat.color.copy(targetEye);
          } else {
            pulseMat.opacity = 0;
          }

          renderer.render(scene, camera);
        };
        frameId = requestAnimationFrame(animate);

        cleanup = () => {
          cancelAnimationFrame(frameId);
          canvas.removeEventListener('webglcontextlost', onLost);
          headGeo.dispose();
          headMat.dispose();
          visorGeo.dispose();
          visorMat.dispose();
          eyeGeo.dispose();
          eyeMat.dispose();
          barGeo.dispose();
          barMat.dispose();
          ring1Geo.dispose();
          ring1Mat.dispose();
          ring2Geo.dispose();
          ring2Mat.dispose();
          pulseGeo.dispose();
          pulseMat.dispose();
          renderer.dispose();
          canvas.remove();
        };
      } catch {
        if (!disposed) setWebglReady(false);
      }
    }

    void mount();
    return () => {
      disposed = true;
      cleanup?.();
      cleanup = null;
    };
  }, [compact, size]);

  return (
    <span
      className={
        compact
          ? 'assistant-pet assistant-pet-compact relative inline-flex items-center justify-center'
          : 'assistant-pet relative inline-flex items-center justify-center'
      }
      style={{ width: size, height: size }}
      aria-hidden="true"
      data-phase={phase}
    >
      <div
        ref={hostRef}
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {!webglReady && <FallbackAvatar phase={phase} size={size} level={audioLevel} />}
      </div>
    </span>
  );
}
