"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { FLAVORS, getState, jarPose, useStore } from "./store";

const v = (x, y) => new THREE.Vector2(x, y);

// Glass jar silhouette (radius, height), revolved around the Y axis.
const GLASS_PROFILE = [
  v(0, -1.1), v(0.8, -1.1), v(0.9, -1.04), v(0.93, -0.92), v(0.93, 0.66),
  v(0.9, 0.82), v(0.8, 0.94), v(0.74, 1.0), v(0.74, 1.14),
];
const SAUCE_PROFILE = [
  v(0, -1.05), v(0.82, -1.05), v(0.88, -0.98), v(0.885, -0.9), v(0.885, 0.52),
  v(0.84, 0.58), v(0, 0.6),
];

function drawLabel(ctx, flavor) {
  const { width: w, height: h } = ctx.canvas;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0d0907";
  ctx.fillRect(0, 0, w, h);

  // Paper grain
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(255,140,60,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }

  ctx.fillStyle = "#ff5a00";
  ctx.fillRect(0, 26, w, 10);
  ctx.fillRect(0, h - 36, w, 10);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ff5a00";
  ctx.font = "900 210px 'Big Shoulders Display', Impact, sans-serif";
  ctx.fillText("SCORCH", w / 2, 270);

  ctx.fillStyle = "#f6e7d6";
  ctx.font = "700 64px 'Big Shoulders Display', Impact, sans-serif";
  ctx.fillText(flavor.name.toUpperCase(), w / 2, 360);

  ctx.font = "500 30px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#ff9a52";
  ctx.fillText(`${flavor.no}  ·  ${flavor.shu} SHU  ·  5 FL OZ`, w / 2, 425);

  // Heat pips
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(w / 2 - 100 + i * 50, 120, 13, 0, Math.PI * 2);
    ctx.fillStyle = i < flavor.heat ? "#ff5a00" : "rgba(246,231,214,0.18)";
    ctx.fill();
  }
}

function Label({ flavorIndex }) {
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 512;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { canvas: c, texture: t };
  }, []);

  useEffect(() => {
    const paint = () => {
      drawLabel(canvas.getContext("2d"), FLAVORS[flavorIndex]);
      texture.needsUpdate = true;
    };
    paint();
    // Repaint once web fonts arrive so the label uses the brand face.
    document.fonts?.ready.then(paint);
  }, [flavorIndex, canvas, texture]);

  return (
    <mesh position={[0, -0.18, 0]}>
      <cylinderGeometry args={[0.945, 0.945, 1.05, 96, 1, true, -1.75, 3.5]} />
      <meshPhysicalMaterial map={texture} roughness={0.55} clearcoat={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Seeds() {
  const ref = useRef();
  const count = 70;
  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.55 + Math.random() * 0.3;
      const s = 0.025 + Math.random() * 0.03;
      q.setFromEuler(new THREE.Euler(Math.random() * 3, Math.random() * 3, 0));
      m.compose(new THREE.Vector3(Math.cos(a) * r, -0.95 + Math.random() * 1.45, Math.sin(a) * r), q, new THREE.Vector3(s, s * 0.4, s * 0.7));
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial color="#ffd38a" roughness={0.4} />
    </instancedMesh>
  );
}

function Jar() {
  const flavorIndex = useStore((s) => s.flavor);
  const sauceMat = useRef();
  const target = useMemo(() => ({ color: new THREE.Color(), deep: new THREE.Color() }), []);
  const glassGeo = useMemo(() => new THREE.LatheGeometry(GLASS_PROFILE, 96), []);
  const sauceGeo = useMemo(() => new THREE.LatheGeometry(SAUCE_PROFILE, 64), []);

  useFrame((_, dt) => {
    const f = FLAVORS[getState().flavor];
    target.color.set(f.sauce);
    target.deep.set(f.deep);
    const k = 1 - Math.pow(0.02, dt);
    sauceMat.current.color.lerp(target.color, k);
    sauceMat.current.emissive.lerp(target.deep, k);
  });

  return (
    <group>
      {/* Sauce */}
      <mesh geometry={sauceGeo}>
        <meshPhysicalMaterial
          ref={sauceMat}
          color={FLAVORS[0].sauce}
          emissive={FLAVORS[0].deep}
          emissiveIntensity={0.35}
          roughness={0.28}
          clearcoat={0.8}
          sheen={0.6}
          sheenColor="#ffb070"
        />
      </mesh>
      <Seeds />

      {/* Glass */}
      <mesh geometry={glassGeo}>
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.35}
          roughness={0.03}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          specularIntensity={1}
          envMapIntensity={1.4}
          color="#fff6ee"
          attenuationColor="#ffe2c4"
          attenuationDistance={4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Label flavorIndex={flavorIndex} />

      {/* Lid with knurled ridges */}
      <group position={[0, 1.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.8, 0.8, 0.34, 96]} />
          <meshStandardMaterial color="#121010" metalness={0.85} roughness={0.32} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[0, -0.13 + i * 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.8, 0.012, 8, 96]} />
            <meshStandardMaterial color="#2a2522" metalness={0.9} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 0.172, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.36, 64]} />
          <meshStandardMaterial color="#ff5a00" emissive="#ff5a00" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

const steamVert = /* glsl */ `
  attribute float aLife;
  uniform float uSize;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.35 + aLife * 1.4) * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vAlpha = sin(aLife * 3.14159);
  }
`;
const steamFrag = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha * uOpacity;
    gl_FragColor = vec4(1.0, 0.94, 0.88, a);
  }
`;

function Steam() {
  const COUNT = 60;
  const geo = useRef();
  const seeds = useMemo(
    () => Array.from({ length: COUNT }, () => ({ life: Math.random(), speed: 0.12 + Math.random() * 0.15, x: (Math.random() - 0.5) * 0.9, z: (Math.random() - 0.5) * 0.9, sway: Math.random() * 6 })),
    []
  );
  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  const lives = useMemo(() => new Float32Array(COUNT), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    seeds.forEach((s, i) => {
      s.life += dt * s.speed;
      if (s.life > 1) s.life -= 1;
      positions[i * 3] = s.x * (1 + s.life) + Math.sin(t * 0.8 + s.sway) * 0.18 * s.life;
      positions[i * 3 + 1] = 1.5 + s.life * 1.9;
      positions[i * 3 + 2] = s.z;
      lives[i] = s.life;
    });
    geo.current.attributes.position.needsUpdate = true;
    geo.current.attributes.aLife.needsUpdate = true;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aLife" args={[lives, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={steamVert}
        fragmentShader={steamFrag}
        uniforms={{ uSize: { value: 1.1 }, uOpacity: { value: 0.16 } }}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function Spices() {
  const COUNT = 220;
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const flakes = useMemo(() => {
    const palette = ["#b91c1c", "#ff5a00", "#f97316", "#1c1714", "#fde68a", "#7c2d12"];
    return Array.from({ length: COUNT }, () => ({
      r: 1.5 + Math.random() * 2.6,
      a: Math.random() * Math.PI * 2,
      y: -1.8 + Math.random() * 4,
      speed: (0.05 + Math.random() * 0.12) * (Math.random() < 0.5 ? -1 : 1),
      bob: Math.random() * 6,
      s: 0.02 + Math.random() * 0.045,
      spin: Math.random() * 2,
      color: new THREE.Color(palette[Math.floor(Math.random() * palette.length)]),
    }));
  }, []);

  useEffect(() => {
    flakes.forEach((f, i) => ref.current.setColorAt(i, f.color));
    ref.current.instanceColor.needsUpdate = true;
  }, [flakes]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    flakes.forEach((f, i) => {
      f.a += f.speed * dt;
      dummy.position.set(Math.cos(f.a) * f.r, f.y + Math.sin(t * 0.6 + f.bob) * 0.15, Math.sin(f.a) * f.r - 0.5);
      dummy.rotation.set(t * f.spin, t * f.spin * 0.7, f.bob);
      dummy.scale.set(f.s, f.s * 0.35, f.s * 0.8);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.6} />
    </instancedMesh>
  );
}

function Rig() {
  const outer = useRef();
  const spin = useRef();
  const key = useRef();
  const ember = useRef();
  const { viewport } = useThree();

  useFrame((state, dt) => {
    const narrow = viewport.width < 6;
    const k = 1 - Math.pow(0.001, dt);
    const px = state.pointer.x;
    const py = state.pointer.y;

    const tx = narrow ? 0 : jarPose.x;
    const ty = narrow ? jarPose.y + 0.6 : jarPose.y;
    const ts = (narrow ? 0.72 : 1) * jarPose.scale;
    outer.current.position.x += (tx - outer.current.position.x) * k;
    outer.current.position.y += (ty - outer.current.position.y) * k;
    outer.current.scale.setScalar(outer.current.scale.x + (ts - outer.current.scale.x) * k);

    spin.current.rotation.y = jarPose.rotY + state.clock.elapsedTime * 0.25 + px * 0.35;
    spin.current.rotation.x += (-py * 0.12 + jarPose.tilt - spin.current.rotation.x) * k;
    spin.current.rotation.z += (px * -0.06 - spin.current.rotation.z) * k;

    // Key light follows the pointer; ember light flickers like coals.
    key.current.position.x += (px * 6 - key.current.position.x) * k;
    key.current.position.y += (3 + py * 3 - key.current.position.y) * k;
    const t = state.clock.elapsedTime;
    ember.current.intensity = 18 + Math.sin(t * 7) * 3 + Math.sin(t * 13.3) * 2 + Math.random() * 2;
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <spotLight ref={key} position={[3, 4, 5]} angle={0.5} penumbra={1} intensity={60} color="#fff1e0" />
      <pointLight ref={ember} position={[-2.5, -1, -2]} color="#ff4d00" distance={12} />
      <pointLight position={[2.5, 1.5, -3]} intensity={25} color="#ff8a1f" distance={10} />

      <group ref={outer} position={[jarPose.x, jarPose.y, 0]}>
        <group ref={spin}>
          <Jar />
        </group>
        <Steam />
        <ContactShadows position={[0, -1.12, 0]} opacity={0.65} scale={5} blur={2.6} far={2} color="#000000" />
      </group>
      <Spices />
    </>
  );
}

export default function JarScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.3, 6.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} color="#fff4e8" position={[0, 3, 5]} scale={[8, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[1, 6, 1]} />
        <Lightformer form="rect" intensity={6} color="#ff5a00" position={[5, 0, -2]} rotation-y={-Math.PI / 2} scale={[2, 8, 1]} />
        <Lightformer form="ring" intensity={3} color="#ff9a3d" position={[0, -4, -4]} scale={4} />
      </Environment>
      <Rig />
    </Canvas>
  );
}
