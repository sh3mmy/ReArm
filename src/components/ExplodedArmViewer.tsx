// src/components/ExplodedArmViewer.tsx
import React, { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/** ----------------------------------------------------------------
 *  CONFIG — point these to your actual assets when ready
 *  Place under:  public/assets/models/...
 *  Then set `useDemoShapes={false}` in <ExplodedArmViewer />
 *  ---------------------------------------------------------------*/
const PATHS = {
  casing: "/assets/models/hl_outer.glb",        // external shell
  motors: "/assets/models/hl_motors.glb",       // motors/gear train
  tendons: "/assets/models/hl_tendons.glb",     // tendons/sensors
};

// Finish materials for Outer Casing
const FINISH_MATERIALS = {
  Matte: new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#d9d9d9"),
    roughness: 0.85,
    metalness: 0.15,
    clearcoat: 0.2,
  }),
  Gloss: new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#d9d9d9"),
    roughness: 0.1,
    metalness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  }),
  Carbon: new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#111111"),
    roughness: 0.35,
    metalness: 0.7,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  }),
} as const;

type FinishKey = keyof typeof FINISH_MATERIALS;

type ExplodedArmViewerProps = {
  /** When you have real GLB files, set this to false to load them */
  useDemoShapes?: boolean;
  /** Initial exploded amount (0..1) */
  defaultExplode?: number;
  /** Default finish (outer casing) */
  defaultFinish?: FinishKey;
};

function AutoRotateGroup({
  speed = 0.2,
  children,
}: React.PropsWithChildren<{ speed?: number }>) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * speed * 0.2;
  });
  return <group ref={ref}>{children}</group>;
}

/* ---------------- DEMO SHAPES ----------------
   Elegant placeholders so nothing breaks before you add GLBs. */
function DemoCasing({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.5, 1.4, 16, 32]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0, -1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.25, 24]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}
function DemoMotors() {
  const mat = new THREE.MeshStandardMaterial({ color: "#b3b3b3", roughness: 0.5, metalness: 0.7 });
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.9, 24]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0.28, 0.15, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.12, 0.05, 16, 32]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[-0.28, -0.1, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.12, 0.05, 16, 32]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}
function DemoTendons() {
  const mat = new THREE.MeshStandardMaterial({ color: "#7dd3fc", roughness: 0.2, metalness: 0.1 });
  const wires = [];
  for (let i = -3; i <= 3; i++) {
    wires.push(
      <mesh key={i} position={[i * 0.08, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.01, 0.01, 1.4, 8]} />
        <primitive object={mat} attach="material" />
      </mesh>
    );
  }
  return <group>{wires}</group>;
}

/* ---------------- GLB PARTS ----------------
   Swap in real assets when ready */
function GLBPart({ path, materialOverride }: { path: string; materialOverride?: THREE.Material }) {
  const { scene } = useGLTF(path);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  cloned.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if ((mesh as any).isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (materialOverride) mesh.material = materialOverride;
      else {
        const m = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(m)) m.forEach((mm) => ((mm as any).metalness = 0.6));
        else (m as any).metalness = 0.6;
      }
    }
  });
  return <primitive object={cloned} />;
}

/* ---------------- LAYER GROUP ---------------- */
type LayerProps = {
  title: string;
  visible: boolean;
  opacity: number; // 0..1
  offset: [number, number, number]; // explode offset
  children: React.ReactNode;
};

function Layer({ title, visible, opacity, offset, children }: LayerProps) {
  const grp = useRef<THREE.Group>(null!);
  // smooth opacity via onBeforeCompile? simpler use material opacity in children
  // we do it by toggling material transparency on traverse:
  const setOpacity = (g: THREE.Object3D, v: number) => {
    g.traverse((o) => {
      const m = (o as any).material as THREE.Material | THREE.Material[] | undefined;
      if (m) {
        if (Array.isArray(m)) {
          m.forEach((mm) => {
            mm.transparent = v < 1;
            (mm as any).opacity = v;
          });
        } else {
          m.transparent = v < 1;
          (m as any).opacity = v;
        }
      }
    });
  };

  useFrame(() => {
    if (!grp.current) return;
    setOpacity(grp.current, opacity);
    grp.current.visible = visible || opacity > 0.02;
  });

  return (
    <group ref={grp} position={offset} name={title}>
      {children}
    </group>
  );
}

/* ---------------- MAIN VIEWER ---------------- */
export const ExplodedArmViewer: React.FC<ExplodedArmViewerProps> = ({
  useDemoShapes = true,
  defaultExplode = 0.22,
  defaultFinish = "Gloss",
}) => {
  const [explode, setExplode] = useState(defaultExplode); // 0..1
  const [fin, setFin] = useState<FinishKey>(defaultFinish);
  const [showCasing, setShowCasing] = useState(true);
  const [showMotors, setShowMotors] = useState(true);
  const [showTendons, setShowTendons] = useState(true);
  const [alphaCasing, setAlphaCasing] = useState(1);
  const [alphaMotors, setAlphaMotors] = useState(1);
  const [alphaTendons, setAlphaTendons] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);

  // Layer offsets (world space) when exploded
  const casingOffset: [number, number, number] = [0, explode * 1.3, 0];
  const motorsOffset: [number, number, number] = [explode * -0.7, explode * -0.4, 0];
  const tendonsOffset: [number, number, number] = [explode * 0.9, explode * -0.9, 0];

  const finishMat = useMemo(() => FINISH_MATERIALS[fin], [fin]);

  return (
    <div className="relative w-full aspect-[16/9] rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-b from-zinc-950 to-black">
      {/* 3D Scene */}
      <Canvas
        shadows
        camera={{ position: [2.2, 1.2, 2.2], fov: 40 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#000"]} />
        <fog attach="fog" args={["#000", 10, 30]} />

        <Suspense fallback={null}>
          <Environment preset="studio" background={false} />
        </Suspense>

        {/* Key light setup */}
        <hemisphereLight intensity={0.5} groundColor={"#111"} />
        <spotLight
          position={[5, 8, 5]}
          angle={0.35}
          penumbra={0.6}
          intensity={1.25}
          castShadow
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-6, 3, -4]} intensity={0.4} />

        <AutoRotateGroup speed={autoRotate ? 0.7 : 0}>
          {/* Ground */}
          <group position={[0, -1.35, 0]}>
            <ContactShadows opacity={0.5} scale={6} blur={2.2} far={2.8} />
          </group>

          {/* LAYERS */}
          <Layer title="Casing" visible={showCasing} opacity={alphaCasing} offset={casingOffset}>
            {useDemoShapes ? (
              <DemoCasing mat={finishMat} />
            ) : (
              <Suspense fallback={null}>
                <GLBPart path={PATHS.casing} materialOverride={finishMat} />
              </Suspense>
            )}
          </Layer>

          <Layer title="Motors" visible={showMotors} opacity={alphaMotors} offset={motorsOffset}>
            {useDemoShapes ? (
              <DemoMotors />
            ) : (
              <Suspense fallback={null}>
                <GLBPart path={PATHS.motors} />
              </Suspense>
            )}
          </Layer>

          <Layer title="Tendons" visible={showTendons} opacity={alphaTendons} offset={tendonsOffset}>
            {useDemoShapes ? (
              <DemoTendons />
            ) : (
              <Suspense fallback={null}>
                <GLBPart path={PATHS.tendons} />
              </Suspense>
            )}
          </Layer>
        </AutoRotateGroup>

        <OrbitControls
          enablePan={false}
          minDistance={1.6}
          maxDistance={5.5}
          enableDamping
          dampingFactor={0.08}
          makeDefault
        />
      </Canvas>

      {/* Luxury HUD */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-6 md:bottom-5">
        <div className="pointer-events-auto grid gap-3 md:grid-cols-[1fr,auto]">
          {/* Explode + Finish */}
          <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="w-full md:w-[56%]">
                <div className="text-xs text-white/60 mb-1">Explode</div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={explode}
                  onChange={(e) => setExplode(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["Matte", "Gloss", "Carbon"] as FinishKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFin(k)}
                    className={`px-3 py-1.5 rounded-xl border text-sm transition ${
                      fin === k
                        ? "bg-white text-black"
                        : "border-white/20 text-white/80 hover:border-white/50 hover:bg-white/5"
                    }`}
                  >
                    {k}
                  </button>
                ))}
                <label className="col-span-3 mt-1 flex items-center gap-2 text-xs text-white/70">
                  <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
                  Auto-rotate
                </label>
              </div>
            </div>
          </div>

          {/* Layer toggles */}
          <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur p-3 md:p-4">
            <div className="grid grid-cols-3 gap-2">
              {/* Casing */}
              <div>
                <button
                  onClick={() => setShowCasing((v) => !v)}
                  className={`w-full px-3 py-1.5 rounded-xl text-sm border transition ${
                    showCasing ? "bg-white text-black" : "border-white/20 text-white/80 hover:bg-white/5"
                  }`}
                >
                  Casing
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={alphaCasing}
                  onChange={(e) => setAlphaCasing(parseFloat(e.target.value))}
                  className="mt-1 w-full"
                />
              </div>
              {/* Motors */}
              <div>
                <button
                  onClick={() => setShowMotors((v) => !v)}
                  className={`w-full px-3 py-1.5 rounded-xl text-sm border transition ${
                    showMotors ? "bg-white text-black" : "border-white/20 text-white/80 hover:bg-white/5"
                  }`}
                >
                  Motors
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={alphaMotors}
                  onChange={(e) => setAlphaMotors(parseFloat(e.target.value))}
                  className="mt-1 w-full"
                />
              </div>
              {/* Tendons */}
              <div>
                <button
                  onClick={() => setShowTendons((v) => !v)}
                  className={`w-full px-3 py-1.5 rounded-xl text-sm border transition ${
                    showTendons ? "bg-white text-black" : "border-white/20 text-white/80 hover:bg-white/5"
                  }`}
                >
                  Tendons
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={alphaTendons}
                  onChange={(e) => setAlphaTendons(parseFloat(e.target.value))}
                  className="mt-1 w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute left-6 top-4 text-white/90 tracking-tight text-lg md:text-xl">
        ReArm — Exploded View
        <div className="text-xs text-white/50">Casing • Motors • Tendons & Sensors</div>
      </div>
    </div>
  );
};

export default ExplodedArmViewer;
