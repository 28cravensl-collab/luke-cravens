"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { FLAVORS, getState, pose, useStore } from "./store";

const rand = (a, b) => a + Math.random() * (b - a);

function canvasTexture(size, draw, { srgb = true } = {}) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------------- tablet ---------------- */

const R = 0.92; // flat face radius
const H = 0.2; // half thickness

function paintTabletColor(ctx, s, f) {
  ctx.fillStyle = f.tab;
  ctx.fillRect(0, 0, s, s);
  // Compressed powder: thousands of crystals and flavor specks
  for (let i = 0; i < 14000; i++) {
    const r = Math.random();
    ctx.fillStyle = r < 0.55 ? `rgba(255,255,255,${rand(0.2, 0.7)})` : r < 0.85 ? `rgba(0,0,0,${rand(0.02, 0.07)})` : f.speck;
    const d = r < 0.85 ? rand(1, 3) : rand(2, 6);
    ctx.globalAlpha = r < 0.85 ? 1 : rand(0.4, 0.9);
    ctx.fillRect(Math.random() * s, Math.random() * s, d, d);
  }
  ctx.globalAlpha = 1;
  // Shade the pressed logo and score line so they read under soft light.
  const c = s / 2;
  ctx.strokeStyle = "rgba(60,20,0,0.10)";
  ctx.lineWidth = s * 0.018;
  ctx.beginPath(); ctx.arc(c, c, s * 0.44, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `900 ${s * 0.15}px Unbounded, 'Arial Black', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SURGE", c + 3, c - s * 0.09 + 3);
  ctx.fillStyle = f.speck;
  ctx.globalAlpha = 0.55;
  ctx.fillText("SURGE", c, c - s * 0.09);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(40,10,0,0.25)";
  ctx.fillRect(c - s * 0.3, c + s * 0.08, s * 0.6, s * 0.022);
  ctx.font = `700 ${s * 0.055}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = "rgba(40,10,0,0.35)";
  ctx.fillText("+3G PROTEIN", c, c + s * 0.2);
}

function paintTabletBump(ctx, s) {
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 26000; i++) {
    const v = Math.floor(rand(90, 170));
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, rand(1, 3), rand(1, 3));
  }
  const c = s / 2;
  // Raised rim ring
  ctx.strokeStyle = "#c8c8c8";
  ctx.lineWidth = s * 0.018;
  ctx.beginPath();
  ctx.arc(c, c, s * 0.44, 0, Math.PI * 2);
  ctx.stroke();
  // Embossed wordmark
  ctx.fillStyle = "#d8d8d8";
  ctx.font = `900 ${s * 0.15}px Unbounded, 'Arial Black', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SURGE", c, c - s * 0.09);
  // Score line (groove)
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(c - s * 0.3, c + s * 0.08, s * 0.6, s * 0.022);
  ctx.font = `700 ${s * 0.055}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = "#c0c0c0";
  ctx.fillText("+3G PROTEIN", c, c + s * 0.2);
}

function Tablet() {
  const flavor = useStore((s) => s.flavor);
  const f = FLAVORS[flavor];

  const bump = useMemo(() => canvasTexture(1024, (ctx, s) => paintTabletBump(ctx, s), { srgb: false }), []);
  const color = useMemo(() => canvasTexture(1024, (ctx, s) => paintTabletColor(ctx, s, FLAVORS[0])), []);

  useEffect(() => {
    const ctx = color.image.getContext("2d");
    paintTabletColor(ctx, color.image.width, f);
    color.needsUpdate = true;
    // Re-emboss once the web font arrives.
    document.fonts?.ready.then(() => {
      paintTabletColor(ctx, color.image.width, f);
      color.needsUpdate = true;
      paintTabletBump(bump.image.getContext("2d"), bump.image.width);
      bump.needsUpdate = true;
    });
  }, [f, color, bump]);

  const edgeGeo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const a = -Math.PI / 2 + (i / 12) * Math.PI;
      pts.push(new THREE.Vector2(R + Math.cos(a) * 0.08, Math.sin(a) * H));
    }
    return new THREE.LatheGeometry(pts, 96);
  }, []);

  const mat = (
    <meshPhysicalMaterial
      map={color}
      bumpMap={bump}
      bumpScale={6}
      roughness={0.8}
      sheen={0.15}
      sheenColor="#ffffff"
      sheenRoughness={0.8}
    />
  );

  return (
    <group>
      <mesh geometry={edgeGeo}>
        <meshPhysicalMaterial map={color} roughness={0.85} sheen={0.15} sheenColor="#ffffff" />
      </mesh>
      <mesh position={[0, H, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R, 96]} />
        {mat}
      </mesh>
      <mesh position={[0, -H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R, 96]} />
        {mat}
      </mesh>
    </group>
  );
}

/* ---------------- water: fizz bubbles + splash ---------------- */

const waterMat = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  roughness: 0,
  ior: 1.33,
  thickness: 0.15,
  clearcoat: 1,
  envMapIntensity: 2.2,
  color: "#ffffff",
  attenuationColor: "#e8f6ff",
  attenuationDistance: 2,
});

function Bubbles() {
  const COUNT = 140;
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bubbles = useMemo(
    () => Array.from({ length: COUNT }, () => ({ a: rand(0, Math.PI * 2), r: rand(0.1, 1.1), y: rand(-0.4, 2.6), speed: rand(0.5, 1.4), size: rand(0.018, 0.075), wob: rand(0, 6) })),
    []
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const active = Math.floor(COUNT * Math.min(1, pose.fizz));
    bubbles.forEach((b, i) => {
      b.y += b.speed * dt * (0.6 + pose.fizz);
      if (b.y > 2.8) { b.y = -0.3; b.a = rand(0, Math.PI * 2); b.r = rand(0.1, 1.1); }
      const spread = 1 + Math.max(0, b.y) * 0.25;
      dummy.position.set(Math.cos(b.a) * b.r * spread + Math.sin(t * 3 + b.wob) * 0.04, b.y, Math.sin(b.a) * b.r * spread * 0.6 + 0.3);
      const grow = Math.min(1, (b.y + 0.3) * 2);
      dummy.scale.setScalar(i < active ? b.size * grow : 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, waterMat, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 16, 12]} />
    </instancedMesh>
  );
}

function Splash() {
  const COUNT = 30;
  const PERIOD = 3.6;
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const drops = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => ({ a: (i / COUNT) * Math.PI * 2 + rand(-0.1, 0.1), out: rand(1.1, 2.2), up: rand(2.2, 3.8), size: rand(0.04, 0.1), delay: rand(0, 0.15) })),
    []
  );
  const g = -7;

  useFrame((state) => {
    const t = state.clock.elapsedTime % PERIOD;
    drops.forEach((d, i) => {
      const tt = t - d.delay;
      if (tt < 0 || tt > 1.3) { dummy.scale.setScalar(0); }
      else {
        const vx = Math.cos(d.a) * d.out;
        const vz = Math.sin(d.a) * d.out * 0.5;
        const vy = d.up + g * tt;
        dummy.position.set(Math.cos(d.a) * 0.95 + vx * tt, -0.2 + d.up * tt + 0.5 * g * tt * tt, Math.sin(d.a) * 0.5 + vz * tt);
        // Stretch each droplet along its direction of travel.
        dummy.lookAt(dummy.position.x + vx, dummy.position.y + vy, dummy.position.z + vz);
        const fade = Math.min(1, (1.3 - tt) * 3);
        const stretch = 1 + Math.min(1.5, Math.abs(vy) * 0.25);
        dummy.scale.set(d.size * fade, d.size * fade, d.size * fade * stretch);
      }
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, waterMat, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 16, 12]} />
    </instancedMesh>
  );
}

/* ---------------- fruit ---------------- */

function citrusTexture(flesh, pith, rind) {
  return canvasTexture(512, (ctx, s) => {
    const c = s / 2;
    ctx.fillStyle = rind;
    ctx.beginPath(); ctx.arc(c, c, c, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pith;
    ctx.beginPath(); ctx.arc(c, c, c * 0.92, 0, Math.PI * 2); ctx.fill();
    const N = 10;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2 + 0.035;
      const a1 = ((i + 1) / N) * Math.PI * 2 - 0.035;
      const g = ctx.createRadialGradient(c, c, c * 0.08, c, c, c * 0.84);
      g.addColorStop(0, pith);
      g.addColorStop(0.25, flesh);
      g.addColorStop(1, flesh);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(c + Math.cos((a0 + a1) / 2) * c * 0.1, c + Math.sin((a0 + a1) / 2) * c * 0.1);
      ctx.arc(c, c, c * 0.84, a0, a1); ctx.closePath(); ctx.fill();
    }
    // Juice vesicles
    for (let i = 0; i < 900; i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(0.15, 0.82) * c;
      ctx.strokeStyle = `rgba(255,255,255,${rand(0.08, 0.35)})`;
      ctx.lineWidth = rand(1, 3);
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r);
      ctx.lineTo(c + Math.cos(a) * (r + rand(6, 16)), c + Math.sin(a) * (r + rand(6, 16)));
      ctx.stroke();
    }
  });
}

function CitrusSlice({ flesh, pith = "#fff6df", rind }) {
  const tex = useMemo(() => citrusTexture(flesh, pith, rind), [flesh, pith, rind]);
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.72, 0.72, 0.13, 64]} />
      <meshPhysicalMaterial attach="material-0" color={rind} roughness={0.55} clearcoat={0.3} />
      <meshPhysicalMaterial attach="material-1" map={tex} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
      <meshPhysicalMaterial attach="material-2" map={tex} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
    </mesh>
  );
}

function MelonWedge() {
  const RAD = 1.15;
  const { geo, tex } = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.absarc(0, 0, RAD, Math.PI / 2 - 0.42, Math.PI / 2 + 0.42, false);
    shape.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 32 });
    geo.translate(0, -RAD * 0.6, -0.14);
    const tex = canvasTexture(512, (ctx, s) => {
      const c = s / 2;
      const rr = (r) => (r / 1.25) * c; // texture space matches uv = xy / 2.5 + 0.5
      const g = ctx.createRadialGradient(c, c, 0, c, c, rr(RAD));
      g.addColorStop(0, "#ff3b5c");
      g.addColorStop(0.78, "#ff2d4f");
      g.addColorStop(0.84, "#ffd9d0");
      g.addColorStop(0.9, "#f4f9d9");
      g.addColorStop(0.93, "#8fd14f");
      g.addColorStop(1, "#1f6b2a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 26; i++) {
        const a = -Math.PI / 2 + rand(-0.35, 0.35);
        const r = rr(rand(0.45, 0.78) * RAD);
        ctx.save();
        ctx.translate(c + Math.cos(a) * r, c + Math.sin(a) * r);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = "#1a0f0a";
        ctx.beginPath(); ctx.ellipse(0, 0, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = `rgba(255,255,255,${rand(0.05, 0.2)})`;
        ctx.fillRect(rand(0, s), rand(0, s), 2, 2);
      }
    });
    // Extrude caps use the shape's x/y as UVs; map that onto the canvas around its center.
    tex.repeat.set(1 / 2.5, 1 / 2.5);
    tex.offset.set(0.5, 0.5);
    return { geo, tex };
  }, []);
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial attach="material-0" map={tex} roughness={0.3} clearcoat={0.9} />
      <meshPhysicalMaterial attach="material-1" color="#2f7d32" roughness={0.45} clearcoat={0.4} />
    </mesh>
  );
}

function Raspberry() {
  const ref = useRef();
  const N = 52;
  useEffect(() => {
    const m = new THREE.Object3D();
    let k = 0;
    for (let i = 0; i < N; i++) {
      // Fibonacci points over the upper 80% of a slightly tall sphere
      const y = 1 - (i / (N - 1)) * 1.6;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.39996;
      m.position.set(Math.cos(th) * r * 0.26, y * 0.31, Math.sin(th) * r * 0.26);
      m.scale.setScalar(0.085);
      m.updateMatrix();
      ref.current.setMatrixAt(k++, m.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, N]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshPhysicalMaterial color="#d3123f" roughness={0.3} clearcoat={0.8} sheen={1} sheenColor="#ff8aa6" />
      </instancedMesh>
      <mesh scale={[0.24, 0.29, 0.24]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#8a0a28" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Blueberry() {
  return (
    <group>
      <mesh scale={[0.26, 0.23, 0.26]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshPhysicalMaterial color="#27357a" roughness={0.55} sheen={1} sheenColor="#a9b8ff" sheenRoughness={0.6} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.025, 8, 5]} />
        <meshStandardMaterial color="#161b3d" roughness={0.8} />
      </mesh>
    </group>
  );
}

function MangoCube() {
  return (
    <RoundedBox args={[0.55, 0.55, 0.55]} radius={0.09} smoothness={4}>
      <meshPhysicalMaterial color="#ffae00" roughness={0.25} clearcoat={1} clearcoatRoughness={0.15} sheen={0.6} sheenColor="#fff0a0" />
    </RoundedBox>
  );
}

function PassionHalf() {
  const tex = useMemo(
    () => canvasTexture(512, (ctx, s) => {
      const c = s / 2;
      ctx.fillStyle = "#f6f0dc";
      ctx.beginPath(); ctx.arc(c, c, c, 0, Math.PI * 2); ctx.fill();
      const g = ctx.createRadialGradient(c, c, 0, c, c, c * 0.88);
      g.addColorStop(0, "#ffcf33");
      g.addColorStop(1, "#ff9800");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(c, c, c * 0.88, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 70; i++) {
        const a = rand(0, Math.PI * 2);
        const r = rand(0.05, 0.78) * c;
        const x = c + Math.cos(a) * r;
        const y = c + Math.sin(a) * r;
        ctx.fillStyle = "rgba(255,240,170,0.55)";
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1b120c";
        ctx.beginPath(); ctx.ellipse(x, y, 5, 7, a, 0, Math.PI * 2); ctx.fill();
      }
    }),
    []
  );
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.55, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#4a1046" roughness={0.45} clearcoat={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 48]} />
        <meshPhysicalMaterial map={tex} roughness={0.15} clearcoat={1} />
      </mesh>
    </group>
  );
}

const FRUIT_PIECES = {
  citrus: [
    () => <CitrusSlice flesh="#e8392a" rind="#ff7a1a" />,
    () => <CitrusSlice flesh="#ffe14d" rind="#ffd21f" />,
  ],
  melon: [() => <MelonWedge />, () => <CitrusSlice flesh="#a6e05a" pith="#f2fbe1" rind="#2f8f2a" />],
  berry: [() => <Raspberry />, () => <Blueberry />],
  mango: [() => <MangoCube />, () => <PassionHalf />],
};

// Slots behind the tablet: x, y, z, scale
const SLOTS = [
  [-5.6, 2.2, -4.2, 1.1], [-1.4, -3.3, -2.6, 1.0], [-0.6, 2.5, -4.2, 0.9], [2.5, 2.2, -2.6, 1.15],
  [4.6, -0.5, -3.4, 1.2], [1.1, -2.5, -3.2, 0.95], [-5.2, -0.3, -4.6, 1.0], [3.4, -2.6, -4.4, 0.9],
  [5.8, 2.6, -5, 1], [-3.2, 3.1, -5.2, 1],
];

function FruitSet({ kind, active }) {
  const group = useRef();
  const pieces = useRef([]);
  const spin = useMemo(() => SLOTS.map(() => ({ x: rand(-0.4, 0.4), y: rand(-0.6, 0.6), bob: rand(0, 6), base: [rand(0, 6), rand(0, 6), rand(0, 6)] })), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const target = active ? 1 : 0;
    const s = group.current.scale.x + (target - group.current.scale.x) * (1 - Math.pow(0.002, dt));
    group.current.scale.setScalar(s);
    group.current.visible = s > 0.01;
    group.current.position.y = pose.fruitY;
    pieces.current.forEach((p, i) => {
      if (!p) return;
      const sp = spin[i];
      p.rotation.set(sp.base[0] + t * sp.x, sp.base[1] + t * sp.y, sp.base[2]);
      p.position.y = SLOTS[i][1] + Math.sin(t * 0.8 + sp.bob) * 0.15;
    });
  });

  const make = FRUIT_PIECES[kind];
  return (
    <group ref={group} scale={active ? 1 : 0}>
      {SLOTS.map(([x, y, z, sc], i) => (
        <group key={i} ref={(el) => (pieces.current[i] = el)} position={[x, y, z]} scale={sc}>
          {make[i % 2]()}
        </group>
      ))}
    </group>
  );
}

/* ---------------- rig ---------------- */

function Rig() {
  const flavor = useStore((s) => s.flavor);
  const outer = useRef();
  const tablet = useRef();
  const rim = useRef();
  const rimColor = useMemo(() => new THREE.Color(), []);
  const { viewport } = useThree();

  useFrame((state, dt) => {
    const narrow = viewport.width < 6;
    const k = 1 - Math.pow(0.001, dt);
    const { x: px, y: py } = state.pointer;
    const t = state.clock.elapsedTime;

    const tx = narrow ? 0 : pose.x;
    const ty = narrow ? pose.y + 0.7 : pose.y;
    const ts = (narrow ? 0.7 : 1) * pose.scale;
    outer.current.position.x += (tx - outer.current.position.x) * k;
    outer.current.position.y += (ty + Math.sin(t * 1.2) * 0.08 - outer.current.position.y) * k;
    outer.current.scale.setScalar(Math.max(0.0001, outer.current.scale.x + (ts - outer.current.scale.x) * k));

    // Face the camera at an angle, spin on its own axis, lean toward the pointer.
    tablet.current.rotation.x += (0.82 - py * 0.25 - tablet.current.rotation.x) * k;
    tablet.current.rotation.z += (-0.45 + px * 0.3 - tablet.current.rotation.z) * k;
    tablet.current.rotation.y = pose.spin + Math.sin(t * 0.6) * 0.5;

    rimColor.set(FLAVORS[getState().flavor].deep);
    rim.current.color.lerp(rimColor, k);
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} />
      <directionalLight position={[-5, 2, 3]} intensity={0.8} color="#fff4e6" />
      <pointLight ref={rim} position={[-2, 1, -2.5]} intensity={40} distance={12} />

      {FLAVORS.map((f, i) => (
        <FruitSet key={f.id} kind={f.fruit} active={i === flavor} />
      ))}

      <group ref={outer} position={[pose.x, pose.y, 0]}>
        <group ref={tablet}>
          <Tablet />
        </group>
        <Bubbles />
        <Splash />
      </group>
    </>
  );
}

export default function TabletScene() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 7], fov: 40 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={5} position={[0, 4, 4]} scale={[10, 1.5, 1]} />
        <Lightformer form="rect" intensity={3} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[1.5, 8, 1]} />
        <Lightformer form="rect" intensity={3} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[1.5, 8, 1]} />
        <Lightformer form="circle" intensity={2} color="#bfe6ff" position={[0, -4, 2]} scale={4} />
      </Environment>
      <Rig />
    </Canvas>
  );
}
