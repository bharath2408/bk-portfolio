"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

/* ── Shared mutable scene state — updated from DOM, read in useFrame ── */
interface OrbState {
  x:       number;   // normalised mouse x: −1 → 1
  y:       number;   // normalised mouse y: −1 → 1
  hover:   boolean;
  reduced: boolean;  // prefers-reduced-motion
}

/* ── Core sphere ─────────────────────────────────────────────────────── */
function OrbCore({ state }: { state: React.MutableRefObject<OrbState> }) {
  // tiltRef  — group that leans toward the cursor
  // meshRef  — inner mesh for the existing idle spin
  // matRef   — distort material for hover pulse
  const tiltRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matRef  = useRef<any>(null); // MeshDistortMaterial adds .distort / .emissiveIntensity

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    /* Idle spin — always active */
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.18;
      meshRef.current.rotation.x = Math.sin(t * 0.25) * 0.15;
    }

    if (state.current.reduced) return;   // reduced-motion: no reactive effects

    /* Lean toward cursor */
    if (tiltRef.current) {
      const tx = -state.current.y * 0.28;
      const ty =  state.current.x * 0.28;
      tiltRef.current.rotation.x +=
        (tx - tiltRef.current.rotation.x) * 0.05;
      tiltRef.current.rotation.y +=
        (ty - tiltRef.current.rotation.y) * 0.05;
    }

    /* Hover: raise distortion + brighten emissive, ease back on leave */
    if (matRef.current) {
      const targetDistort  = state.current.hover ? 0.58 : 0.42;
      const targetEmissive = state.current.hover ? 0.30 : 0.18;
      matRef.current.distort           +=
        (targetDistort  - matRef.current.distort)           * 0.04;
      matRef.current.emissiveIntensity +=
        (targetEmissive - matRef.current.emissiveIntensity) * 0.04;
    }
  });

  return (
    <group ref={tiltRef}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        {/* inner distorted core */}
        <Sphere ref={meshRef} args={[1.35, 96, 96]}>
          <MeshDistortMaterial
            ref={matRef}
            color="#7c5cff"
            attach="material"
            distort={0.42}
            speed={1.6}
            roughness={0.18}
            metalness={0.65}
            emissive="#22d3ee"
            emissiveIntensity={0.18}
          />
        </Sphere>

        {/* wireframe shell */}
        <Sphere args={[1.75, 28, 28]}>
          <meshBasicMaterial
            color="#22d3ee"
            wireframe
            transparent
            opacity={0.12}
          />
        </Sphere>
      </Float>
    </group>
  );
}

/* ── Particle cloud ──────────────────────────────────────────────────── */
function OrbParticles({ state }: { state: React.MutableRefObject<OrbState> }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count     = 280;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 2.6 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.05;

    /* Gently sync with orb tilt so the particle shell feels coherent */
    if (!state.current.reduced) {
      ref.current.rotation.x +=
        (-state.current.y * 0.1 - ref.current.rotation.x) * 0.04;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.025}
        color="#9b9bae"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Canvas wrapper ──────────────────────────────────────────────────── */
export default function HeroOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef     = useRef<OrbState>({ x: 0, y: 0, hover: false, reduced: false });

  useEffect(() => {
    /* Detect prefers-reduced-motion (and react to live changes) */
    const mq        = window.matchMedia("(prefers-reduced-motion: reduce)");
    stateRef.current.reduced = mq.matches;
    const onMqChange = (e: MediaQueryListEvent) => {
      stateRef.current.reduced = e.matches;
    };
    mq.addEventListener("change", onMqChange);

    /* Global mouse tracking — normalised to −1…1 */
    const onMove = (e: MouseEvent) => {
      stateRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      stateRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    /* Hover detection on the canvas container only */
    const el       = containerRef.current;
    const onEnter  = () => { stateRef.current.hover = true;  };
    const onLeave  = () => { stateRef.current.hover = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    el?.addEventListener("mouseenter", onEnter);
    el?.addEventListener("mouseleave", onLeave);

    return () => {
      mq.removeEventListener("change", onMqChange);
      window.removeEventListener("mousemove", onMove);
      el?.removeEventListener("mouseenter", onEnter);
      el?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        className="!h-full !w-full"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]}  intensity={2.2} color="#ffffff" />
        <pointLight       position={[-4, -2, -3]} intensity={3}   color="#22d3ee" />
        <pointLight       position={[3, -3,  2]}  intensity={2}   color="#7c5cff" />
        <OrbCore      state={stateRef} />
        <OrbParticles state={stateRef} />
      </Canvas>
    </div>
  );
}
