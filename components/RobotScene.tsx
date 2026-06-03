"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  wave:   boolean;
  poke:   boolean;
  mouseX: number;
  mouseY: number;
}

function RobotModel({ wave, poke, mouseX, mouseY }: Props) {
  const rootRef  = useRef<THREE.Group>(null);
  const headRef  = useRef<THREE.Group>(null);
  const rArmRef  = useRef<THREE.Group>(null);
  const lArmRef  = useRef<THREE.Group>(null);
  const lLegRef  = useRef<THREE.Group>(null);
  const rLegRef  = useRef<THREE.Group>(null);
  const ringRef  = useRef<THREE.Mesh>(null);
  const coreMat  = useRef<THREE.MeshStandardMaterial>(null);
  const visorMat = useRef<THREE.MeshStandardMaterial>(null);
  const antMat   = useRef<THREE.MeshStandardMaterial>(null);

  // Smooth bounce state (section change)
  const bounceT    = useRef(-1); // -1 = inactive
  const prevWave   = useRef(false);

  // Poke shimmy state
  const pokeT    = useRef(-1);
  const prevPoke = useRef(false);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    // ── Trigger animations on rising edge ──────────────
    if (wave && !prevWave.current) bounceT.current = 0;
    prevWave.current = wave;

    if (poke && !prevPoke.current) pokeT.current = 0;
    prevPoke.current = poke;

    // ── Smooth arc bounce (section change) ─────────────
    // sin(progress * π) goes 0→1→0 in one clean arc — no jitter
    if (bounceT.current >= 0) {
      bounceT.current += delta;
      const progress = bounceT.current / 0.75; // 0.75 s duration
      if (progress >= 1) {
        bounceT.current = -1;
        if (rootRef.current) rootRef.current.position.y = 0;
      } else if (rootRef.current) {
        rootRef.current.position.y = Math.sin(progress * Math.PI) * 0.22;
      }
    }

    // ── Poke: scale + shimmy ────────────────────────────
    if (pokeT.current >= 0) {
      pokeT.current += delta;
      const p = pokeT.current / 0.55; // 0.55 s
      if (p >= 1) {
        pokeT.current = -1;
        if (rootRef.current) {
          rootRef.current.scale.setScalar(1);
          rootRef.current.rotation.z = 0;
        }
      } else if (rootRef.current) {
        rootRef.current.scale.setScalar(1 + Math.sin(p * Math.PI * 2) * 0.13);
        rootRef.current.rotation.z  = Math.sin(p * Math.PI * 5) * 0.1;
      }
    }

    // ── Head tracks global mouse (delta-based, frame-rate independent) ──
    if (headRef.current) {
      const speed = Math.min(1, delta * 6); // ~6× per second catch-up
      headRef.current.rotation.y +=
        (mouseX * 0.75 - headRef.current.rotation.y) * speed;
      headRef.current.rotation.x +=
        (mouseY * -0.45 - headRef.current.rotation.x) * speed;
    }

    // ── Idle arm swing ─────────────────────────────────
    if (lArmRef.current) lArmRef.current.rotation.z =  0.16 + Math.sin(t * 1.1) * 0.045;
    if (rArmRef.current) {
      rArmRef.current.rotation.z = wave
        ? -0.45 + Math.sin(t * 7) * 0.5
        : -0.16 - Math.sin(t * 1.1) * 0.045;
    }

    // ── Idle leg swing ─────────────────────────────────
    if (lLegRef.current) lLegRef.current.rotation.x =  Math.sin(t * 1.2) * 0.09;
    if (rLegRef.current) rLegRef.current.rotation.x = -Math.sin(t * 1.2) * 0.09;

    // ── Orbit ring spin ────────────────────────────────
    if (ringRef.current) ringRef.current.rotation.z = t * 0.72;

    // ── Glow pulses ────────────────────────────────────
    if (coreMat.current)  coreMat.current.emissiveIntensity  = 0.85 + Math.sin(t * 2.3) * 0.45;
    if (visorMat.current) visorMat.current.emissiveIntensity = 0.5  + Math.sin(t * 4.1) * 0.28;
    if (antMat.current)   antMat.current.emissiveIntensity   = 0.55 + Math.sin(t * 2.8) * 0.35;
  });

  return (
    <group ref={rootRef}>

      {/* Orbit ring */}
      <mesh ref={ringRef} rotation={[Math.PI * 0.44, 0.18, 0]}>
        <torusGeometry args={[0.54, 0.013, 8, 56]} />
        <meshStandardMaterial color="#7C5CFF" emissive="#7C5CFF" emissiveIntensity={0.7} transparent opacity={0.72} />
      </mesh>

      {/* HEAD — mouse tracked */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 28, 28]} />
          <meshStandardMaterial color="#7C5CFF" roughness={0.07} metalness={0.88} />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 0.01, 0.2]}>
          <boxGeometry args={[0.28, 0.095, 0.008]} />
          <meshStandardMaterial ref={visorMat} color="#22D3EE" emissive="#22D3EE" emissiveIntensity={0.55} roughness={0} metalness={1} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.235, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.038, 0.038, 0.052, 10]} />
          <meshStandardMaterial color="#0E0E15" metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[0.235, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.038, 0.038, 0.052, 10]} />
          <meshStandardMaterial color="#0E0E15" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0, 0.285, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.15, 8]} />
          <meshStandardMaterial color="#9B9BAE" metalness={1} roughness={0} />
        </mesh>
        <mesh position={[0, 0.375, 0]}>
          <sphereGeometry args={[0.036, 14, 14]} />
          <meshStandardMaterial ref={antMat} color="#34D399" emissive="#34D399" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.063, 0.063, 0.075, 12]} />
        <meshStandardMaterial color="#1A1A26" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.26]} />
        <meshStandardMaterial color="#13131C" roughness={0.18} metalness={0.78} />
      </mesh>
      {/* Energy core */}
      <mesh position={[0, 0.1, 0.137]}>
        <sphereGeometry args={[0.088, 22, 22]} />
        <meshStandardMaterial ref={coreMat} color="#7C5CFF" emissive="#7C5CFF" emissiveIntensity={0.88} transparent opacity={0.9} roughness={0} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, 0.136]}>
        <torusGeometry args={[0.112, 0.011, 8, 28]} />
        <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={0.5} />
      </mesh>
      {/* Chest lines */}
      <mesh position={[0,  0.265, 0.132]}><boxGeometry args={[0.4, 0.009, 0.009]} /><meshStandardMaterial color="#7C5CFF" emissive="#7C5CFF" emissiveIntensity={0.4} /></mesh>
      <mesh position={[0, -0.1,  0.132]}><boxGeometry args={[0.4, 0.009, 0.009]} /><meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={0.4} /></mesh>

      {/* Left arm */}
      <group ref={lArmRef} position={[-0.34, 0.13, 0]}>
        <mesh><sphereGeometry args={[0.068, 12, 12]} /><meshStandardMaterial color="#0E0E15" metalness={0.85} roughness={0.1} /></mesh>
        <mesh position={[0, -0.16, 0]}><capsuleGeometry args={[0.056, 0.22, 4, 8]} /><meshStandardMaterial color="#1A1A26" roughness={0.28} metalness={0.65} /></mesh>
      </group>

      {/* Right arm (waves) */}
      <group ref={rArmRef} position={[0.34, 0.13, 0]}>
        <mesh><sphereGeometry args={[0.068, 12, 12]} /><meshStandardMaterial color="#0E0E15" metalness={0.85} roughness={0.1} /></mesh>
        <mesh position={[0, -0.16, 0]}><capsuleGeometry args={[0.056, 0.22, 4, 8]} /><meshStandardMaterial color="#1A1A26" roughness={0.28} metalness={0.65} /></mesh>
      </group>

      {/* Left leg */}
      <group ref={lLegRef} position={[-0.13, -0.27, 0]}>
        <mesh><sphereGeometry args={[0.072, 12, 12]} /><meshStandardMaterial color="#0E0E15" metalness={0.85} roughness={0.1} /></mesh>
        <mesh position={[0, -0.15, 0]}><capsuleGeometry args={[0.064, 0.18, 4, 8]} /><meshStandardMaterial color="#1A1A26" roughness={0.28} metalness={0.65} /></mesh>
        <mesh position={[-0.012, -0.32, 0.024]}><boxGeometry args={[0.115, 0.062, 0.165]} /><meshStandardMaterial color="#0E0E15" roughness={0.2} metalness={0.85} /></mesh>
      </group>

      {/* Right leg */}
      <group ref={rLegRef} position={[0.13, -0.27, 0]}>
        <mesh><sphereGeometry args={[0.072, 12, 12]} /><meshStandardMaterial color="#0E0E15" metalness={0.85} roughness={0.1} /></mesh>
        <mesh position={[0, -0.15, 0]}><capsuleGeometry args={[0.064, 0.18, 4, 8]} /><meshStandardMaterial color="#1A1A26" roughness={0.28} metalness={0.65} /></mesh>
        <mesh position={[0.012, -0.32, 0.024]}><boxGeometry args={[0.115, 0.062, 0.165]} /><meshStandardMaterial color="#0E0E15" roughness={0.2} metalness={0.85} /></mesh>
      </group>

    </group>
  );
}

export default function RobotScene({ wave, poke, mouseX, mouseY }: Props) {
  return (
    <Canvas camera={{ position: [0, 0.06, 2.5], fov: 36 }}>
      <ambientLight intensity={0.38} />
      <pointLight position={[2,  4,  2]} intensity={1.5}  color="#ffffff" />
      <pointLight position={[-2, 1,  1]} intensity={0.55} color="#7C5CFF" />
      <pointLight position={[0, -1,  2]} intensity={0.3}  color="#22D3EE" />
      <pointLight position={[0,  3, -1]} intensity={0.2}  color="#34D399" />
      {/*
        rotationIntensity={0} — disables Float's random rotation so it
        doesn't fight the mouse-tracked head rotation
      */}
      <Float speed={1.4} rotationIntensity={0} floatIntensity={0.26}>
        <RobotModel wave={wave} poke={poke} mouseX={mouseX} mouseY={mouseY} />
      </Float>
    </Canvas>
  );
}
