"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Float } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  wave:   boolean;
  poke:   boolean;
  mouseX: number;
  mouseY: number;
}

function TomModel({ wave, poke, mouseX, mouseY }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const scaled   = useRef(false);

  const { scene, animations } = useGLTF("/models/tom/scene.gltf");
  const { actions }           = useAnimations(animations, groupRef);

  // Start Gangnam Style dance once animations are ready
  useEffect(() => {
    const dance = actions["mixamo.com"];
    if (dance) dance.reset().play();
  }, [actions]);

  // Animation timers
  const bounceT   = useRef(-1);
  const pokeT     = useRef(-1);
  const baseY     = useRef(0);   // y position set by auto-scale, bounce offsets from this
  const prevWave  = useRef(false);
  const prevPoke  = useRef(false);

  useFrame((_, delta) => {
    // ── Auto-scale on first frame once bounding box is available ──
    // THREE.Box3 gives the real world-space size after GLTF transforms are applied.
    // This handles the root-matrix scale (13.251) automatically.
    if (!scaled.current && groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      if (!box.isEmpty()) {
        const size = box.getSize(new THREE.Vector3());
        const h = size.y;
        if (h > 0) {
          const s = 1.8 / h;                        // normalize to 1.8 units tall
          groupRef.current.scale.setScalar(s);
          const box2 = new THREE.Box3().setFromObject(groupRef.current);
          baseY.current = -box2.min.y - 0.9;        // feet at bottom, centered in view
          groupRef.current.position.y = baseY.current;
          scaled.current = true;
        }
      }
    }

    if (!groupRef.current) return;

    // ── Rising-edge triggers ───────────────────────────────────────
    if (wave && !prevWave.current) bounceT.current = 0;
    prevWave.current = wave;

    if (poke && !prevPoke.current) {
      pokeT.current = 0;
      const dance = actions["mixamo.com"];
      if (dance) dance.timeScale = 3;
    }
    prevPoke.current = poke;

    // ── Smooth arc bounce (sin 0→1→0) offset from baseY ──────────
    if (bounceT.current >= 0) {
      bounceT.current += delta;
      const p = bounceT.current / 0.7;
      if (p >= 1) {
        bounceT.current = -1;
        groupRef.current.position.y = baseY.current;
      } else {
        groupRef.current.position.y = baseY.current + Math.sin(p * Math.PI) * 0.35;
      }
    }

    // ── Restore dance speed after poke ────────────────────────────
    if (pokeT.current >= 0) {
      pokeT.current += delta;
      if (pokeT.current >= 2) {
        pokeT.current = -1;
        const dance = actions["mixamo.com"];
        if (dance) dance.timeScale = 1;
      }
    }

    // ── Whole body turns subtly toward the mouse ──────────────────
    const targetY = mouseX * 0.45;
    groupRef.current.rotation.y +=
      (targetY - groupRef.current.rotation.y) * Math.min(1, delta * 4);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function LoadingFallback() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 2;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.22, 0.07, 64, 12]} />
      <meshStandardMaterial color="#7C5CFF" wireframe />
    </mesh>
  );
}

export default function RobotScene({ wave, poke, mouseX, mouseY }: Props) {
  return (
    <Canvas camera={{ position: [0, 0.9, 3.5], fov: 40 }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 4, 3]} intensity={1.4} />
      <pointLight position={[-2, 2, 1]} intensity={0.4} color="#7C5CFF" />
      <Suspense fallback={<LoadingFallback />}>
        <Float speed={0.8} rotationIntensity={0} floatIntensity={0.12}>
          <TomModel wave={wave} poke={poke} mouseX={mouseX} mouseY={mouseY} />
        </Float>
      </Suspense>
    </Canvas>
  );
}
