"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import * as THREE from "three";

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  // Generate 2000 points inside a sphere
  const sphere = useMemo(() => random.inSphere(new Float32Array(3000), { radius: 2.5 }), []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Slow subtle rotation
    ref.current.rotation.x -= delta / 20;
    ref.current.rotation.y -= delta / 30;
    
    // Parallax effect based on pointer
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, (state.pointer.x * state.viewport.width) / 20, 0.05);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, (state.pointer.y * state.viewport.height) / 20, 0.05);
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere as Float32Array} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#C8A96B"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-50 mix-blend-screen">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ParticleField />
      </Canvas>
    </div>
  );
}
