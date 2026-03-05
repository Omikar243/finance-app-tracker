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
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(0, 136, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  const scale = hovered ? 9 : 7;

  return (
    <Billboard position={[0, 0, -1]}>
      <mesh>
        <planeGeometry args={[scale, scale]} />
        <meshBasicMaterial map={texture} transparent opacity={hovered ? 0.8 : 0.5} depthWrite={false} />
      </mesh>
    </Billboard>
  );
}

function EquatorRing({ hovered }: { hovered: boolean }) {
<<<<<<< HEAD
  const count = 600; // Increased count for denser dust
=======
  // denser dust ring with wider spread
  const count = 600;
>>>>>>> fbb42bc (Embed CyberEarth in dashboard card; improve ring visibility and interaction)
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
<<<<<<< HEAD
      const radius = 3.2 + Math.random() * 1.2; // Wider spread
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.8; // More vertical spread
=======
      // wider radial variance for more substantial look
      const radius = 3.0 + Math.random() * 1.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.6;
>>>>>>> fbb42bc (Embed CyberEarth in dashboard card; improve ring visibility and interaction)
      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
<<<<<<< HEAD
        size={0.06}
        color={hovered ? "#00ffff" : "#0088ff"}
        transparent
        opacity={hovered ? 0.8 : 0.4}
=======
        size={0.08}
        // stronger base color so it stands out from the globe even when not hovered
        color={hovered ? "#00ffff" : "#00aaff"}
        transparent
        opacity={hovered ? 0.9 : 0.6}
>>>>>>> fbb42bc (Embed CyberEarth in dashboard card; improve ring visibility and interaction)
        sizeAttenuation
      />
    </points>
  );
}

function CurrencyRing({ hovered }: { hovered: boolean }) {
<<<<<<< HEAD
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.1;
    }
  });

  const symbols = useMemo(() => {
    return new Array(16).fill(0).map((_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const radius = 3.8;
      return {
        position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 0.5, Math.sin(angle) * radius] as [number, number, number],
        symbol: CURRENCIES[i % CURRENCIES.length],
        rotation: [0, -angle + Math.PI / 2, 0] as [number, number, number]
      };
    });
  }, []);

  return (
    <group ref={ref}>
      {symbols.map((s, i) => (
        <Text
          key={i}
          position={s.position}
          rotation={s.rotation}
          fontSize={0.25}
          color={hovered ? "#aaffff" : "#0066cc"}
          anchorX="center"
          anchorY="middle"
          fillOpacity={hovered ? 1 : 0.6}
        >
          {s.symbol}
        </Text>
      ))}
    </group>
=======
  const count = 16;
  const symbols = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => CURRENCIES[i % CURRENCIES.length]);
  }, []);

  const textRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    textRefs.current.forEach((ref, i) => {
      if (ref) {
        const angle = time * 0.8 + (i / count) * Math.PI * 2;
        const radius = 3.5;
        ref.position.x = Math.cos(angle) * radius;
        ref.position.z = Math.sin(angle) * radius;
      }
    });
  });

  return (
    <>
      {symbols.map((sym, i) => (
        <Text
          key={i}
          ref={el => (textRefs.current[i] = el)}
          fontSize={hovered ? 0.6 : 0.5}
          color={hovered ? "#ffff00" : "#ffdd00"}
          anchorX="center"
          anchorY="middle"
          position={[
            Math.cos((i / count) * Math.PI * 2) * 3.5,
            0,
            Math.sin((i / count) * Math.PI * 2) * 3.5,
          ]}
        >
          {sym}
        </Text>
      ))}
    </>
>>>>>>> fbb42bc (Embed CyberEarth in dashboard card; improve ring visibility and interaction)
  );
}

function Earth() {
  const groupRef = useRef<THREE.Group>(null);
  const distortRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const velocity = useRef(0);
  const lastX = useRef<number | null>(null);

  // pointer handlers for drag inertia
  const onPointerDown = (e: THREE.Event) => {
    setDragging(true);
    lastX.current = (e as any).clientX;
  };

  const onPointerMove = (e: THREE.Event) => {
    if (dragging && lastX.current !== null && groupRef.current) {
      const x = (e as any).clientX;
      const dx = x - lastX.current;
      velocity.current = dx * 0.01; // scale down
      groupRef.current.rotation.y += velocity.current;
      lastX.current = x;
    }
  };

  const onPointerUp = () => {
    setDragging(false);
    lastX.current = null;
  };

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

    // apply inertia when not dragging
    if (!dragging && groupRef.current) {
      // decay velocity
      velocity.current *= 0.95;
      groupRef.current.rotation.y += velocity.current * delta * 60;
      if (Math.abs(velocity.current) < 0.0001) velocity.current = 0;
    }
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
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <GlowHalo hovered={hovered} />
      <EquatorRing hovered={hovered} />
      <CurrencyRing hovered={hovered} />
      
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
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas className="w-full h-full pointer-events-auto" camera={{ position: [0, 0, 8] }}>
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
