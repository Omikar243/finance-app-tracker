import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

const CURRENCIES = ['$', '€', '£', '¥', '₹', '₿', '₽', '₩'];

function FallingCurrency({ position, speed, symbol }: { position: [number, number, number], speed: number, symbol: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.y -= speed * delta;
      if (ref.current.position.y < -10) {
        ref.current.position.y = 10;
      }
      ref.current.rotation.z += delta;
      
      // Hover effect
      if (hovered) {
        ref.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
        ref.current.material.color.lerp(new THREE.Color('#00ff00'), 0.1);
      } else {
        ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        ref.current.material.color.lerp(new THREE.Color('#00aa00'), 0.1);
      }
    }
  });

  return (
    <Text
      ref={ref}
      position={position}
      fontSize={0.5}
      color="#00aa00"
      anchorX="center"
      anchorY="middle"
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {symbol}
    </Text>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1;
      earthRef.current.rotation.x += delta * 0.05;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.1;
      coreRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Wireframe Outer Shell */}
      <Sphere ref={earthRef} args={[2.8, 64, 64]}>
        <MeshDistortMaterial
          color="#0088ff"
          emissive="#0044aa"
          emissiveIntensity={0.5}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </Sphere>
      {/* Solid Core */}
      <Sphere ref={coreRef} args={[2.4, 64, 64]}>
        <meshStandardMaterial
          color="#001133"
          emissive="#000022"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.1}
        />
      </Sphere>
    </group>
  );
}

function MatrixRain() {
  const count = 50;
  const items = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 - 5 // Behind earth mostly
      ] as [number, number, number],
      speed: Math.random() * 2 + 1,
      symbol: CURRENCIES[Math.floor(Math.random() * CURRENCIES.length)]
    }));
  }, []);

  return (
    <>
      {items.map((item, i) => (
        <FallingCurrency key={i} {...item} />
      ))}
    </>
  );
}

export function CyberEarth() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Earth />
        <MatrixRain />
      </Canvas>
    </div>
  );
}
