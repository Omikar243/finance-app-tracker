import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Sphere, Stars, MeshDistortMaterial, OrbitControls, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';

const CURRENCIES = ['$', '€', '£', '¥', '₹', '₿', '₽', '₩'];

function Debug() {
  const { gl } = useThree();
  useEffect(() => {
    console.log('Canvas created', gl.info);
  }, [gl]);
  return null;
}

function Loader() {
  return (
    <Html center>
      <div className="text-white text-sm">Loading 3D...</div>
    </Html>
  );
}

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
    }
  });

  return (
    <Text
      ref={ref}
      position={position}
      fontSize={0.5}
      color={hovered ? '#00ff00' : '#00aa00'}
      anchorX="center"
      anchorY="middle"
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {symbol}
    </Text>
  );
}

function GlowHalo({ hovered }: { hovered: boolean }) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(0, 200, 255, 0.7)');
      gradient.addColorStop(0.5, 'rgba(0, 120, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    setTexture(tex);

    return () => {
      tex.dispose();
    };
  }, []);

  const scale = hovered ? 10 : 8;

  return (
    texture && (
      <Billboard position={[0, 0, -1]}>
        <mesh>
          <planeGeometry args={[scale, scale]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={hovered ? 0.9 : 0.6}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    )
  );
}

function EquatorRing({ hovered }: { hovered: boolean }) {
  const count = 300;
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3.2 + Math.random() * 0.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.4;
      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.2;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes.position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={hovered ? "#00ffff" : "#0088ff"}
        transparent
        opacity={hovered ? 0.9 : 0.5}
        sizeAttenuation
      />
    </points>
  );
}

function Earth() {
  const groupRef = useRef<THREE.Group>(null);
  const distortRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    // Pulse animation logic
    if (distortRef.current) {
      const targetDistort = hovered ? 0.6 : 0.4;
      const targetEmissive = hovered ? 2.5 : 0.5; // Brighter flash
      const targetColor = hovered ? new THREE.Color('#88ffff') : new THREE.Color('#0088ff'); // More electric blue/cyan
      
      // Faster lerp for "flash" effect
      distortRef.current.distort = THREE.MathUtils.lerp(distortRef.current.distort, targetDistort, delta * 2);
      distortRef.current.emissiveIntensity = THREE.MathUtils.lerp(distortRef.current.emissiveIntensity, targetEmissive, delta * 8);
      distortRef.current.color.lerp(targetColor, delta * 8);
    }
    
    // Subtle rotation even when not auto-rotating (handled by OrbitControls usually, but this adds a layer)
    // Actually, let OrbitControls handle the main rotation interaction.
  });

  return (
    <group 
      ref={groupRef} 
      position={[0, 0, 0]}
      onPointerOver={() => {
        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'pointer';
        }
        setHovered(true);
      }}
      onPointerOut={() => {
        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'auto';
        }
        setHovered(false);
      }}
    >
      <GlowHalo hovered={hovered} />
      <EquatorRing hovered={hovered} />
      
      {/* Wireframe Outer Shell */}
      <Sphere args={[2.8, 64, 64]}>
        <MeshDistortMaterial
          ref={distortRef}
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
      <Sphere args={[2.4, 64, 64]}>
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
        (Math.random() - 0.5) * 10 - 5
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
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8] }} style={{ pointerEvents: 'none' }}>
        <Debug />
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Earth />
          <MatrixRain />
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            enableDamping={true} 
            dampingFactor={0.05} 
            autoRotate={true}
            autoRotateSpeed={0.5}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
