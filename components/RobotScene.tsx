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

useGLTF.preload("/models/tom/scene.gltf");

function TomModel({ wave, poke, mouseX, mouseY }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const { scene, animations } = useGLTF("/models/tom/scene.gltf");
  const { actions }           = useAnimations(animations, groupRef);

  // Play Gangnam Style dance on mount
  useEffect(() => {
    const dance = actions["mixamo.com"];
    if (dance) dance.reset().fadeIn(0.3).play();
  }, [actions]);

  const bounceT  = useRef(-1);
  const pokeT    = useRef(-1);
  const prevWave = useRef(false);
  const prevPoke = useRef(false);

  useFrame(({ clock }, delta) => {
    if (wave && !prevWave.current) bounceT.current = 0;
    prevWave.current = wave;

    if (poke && !prevPoke.current) {
      pokeT.current = 0;
      // Triple-speed dance for 2 s when poked
      const dance = actions["mixamo.com"];
      if (dance) dance.timeScale = 3;
    }
    prevPoke.current = poke;

    if (groupRef.current) {
      // Smooth arc bounce on section change
      if (bounceT.current >= 0) {
        bounceT.current += delta;
        const p = bounceT.current / 0.7;
        if (p >= 1) { bounceT.current = -1; groupRef.current.position.y = 0; }
        else groupRef.current.position.y = Math.sin(p * Math.PI) * 0.35;
      }

      // Restore dance speed after poke
      if (pokeT.current >= 0) {
        pokeT.current += delta;
        if (pokeT.current >= 2) {
          pokeT.current = -1;
          const dance = actions["mixamo.com"];
          if (dance) dance.timeScale = 1;
        }
      }

      // Whole body turns subtly toward the mouse (natural for a dancer)
      const targetY = mouseX * 0.5;
      groupRef.current.rotation.y +=
        (targetY - groupRef.current.rotation.y) * Math.min(1, delta * 4);
    }
  });

  return (
    // scale / position may need tuning depending on export units —
    // increase scale if Tom looks tiny, decrease if he's too large
    <group ref={groupRef} position={[0, -1.0, 0]}>
      <primitive object={scene} scale={0.013} />
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
    <Canvas camera={{ position: [0, 0.6, 2.8], fov: 45 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 4, 3]} intensity={1.4} castShadow />
      <pointLight position={[-2, 2, 1]} intensity={0.4} color="#7C5CFF" />
      <Suspense fallback={<LoadingFallback />}>
        <Float speed={0.8} rotationIntensity={0} floatIntensity={0.1}>
          <TomModel wave={wave} poke={poke} mouseX={mouseX} mouseY={mouseY} />
        </Float>
      </Suspense>
    </Canvas>
  );
}
