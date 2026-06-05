"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text3D, Center, Float } from "@react-three/drei";
import * as THREE from "three";

function BKMesh() {
  // Wrap Center in a Group so we own the rotation ref
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.38;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.12;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.9}
          height={0.28}
          curveSegments={14}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.015}
          bevelOffset={0}
          bevelSegments={6}
        >
          BK
          <meshStandardMaterial
            color="#7C5CFF"
            roughness={0.08}
            metalness={0.85}
            emissive="#22d3ee"
            emissiveIntensity={0.18}
          />
        </Text3D>
      </Center>
    </group>
  );
}

export default function BK3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4,  6,  4]} intensity={2.2} color="#ffffff" />
      <pointLight      position={[-3, -2,  2]} intensity={1.8} color="#22d3ee" />
      <pointLight      position={[ 3,  2, -1]} intensity={1.4} color="#7C5CFF" />

      <Float speed={1.6} rotationIntensity={0.04} floatIntensity={0.3}>
        <BKMesh />
      </Float>
    </Canvas>
  );
}
