"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type RotationState = { y: number; autoRotate: boolean };

function Model({
  url,
  state,
}: {
  url: string;
  state: React.MutableRefObject<RotationState>;
}) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);

  /* eslint-disable react-hooks/immutability -- mutating a ref inside useFrame is the standard r3f perf pattern */
  useFrame((_, delta) => {
    const s = state.current;
    if (s.autoRotate) {
      s.y += delta * 0.35;
    }
    if (group.current) {
      group.current.rotation.y = s.y;
    }
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={group} position={[0, -1, 0]}>
      <primitive object={scene} />
    </group>
  );
}

export function AvatarViewer({ url }: { url: string }) {
  const state = useRef<RotationState>({ y: 0, autoRotate: true });
  const dragging = useRef(false);
  const lastX = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    state.current.autoRotate = false;
    lastX.current = e.clientX;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const delta = e.clientX - lastX.current;
    lastX.current = e.clientX;
    state.current.y += delta * 0.012;
  }
  function onPointerUp() {
    dragging.current = false;
  }
  function nudge(dir: number) {
    state.current.autoRotate = false;
    state.current.y += dir * 0.5;
  }

  return (
    <div className="relative h-full w-full">
      <div
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <Canvas camera={{ position: [0, 1.1, 2.6], fov: 28 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[2, 3, 2]} intensity={1.2} />
          <directionalLight position={[-2, 1, -2]} intensity={0.5} />
          <Suspense fallback={null}>
            <Model url={url} state={state} />
          </Suspense>
        </Canvas>
      </div>

      <button
        onClick={() => nudge(-1)}
        className="absolute left-6 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#3d3226] bg-white/[0.06]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ece3d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5 L8 12 L15 19" />
        </svg>
      </button>
      <button
        onClick={() => nudge(1)}
        className="absolute right-6 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#3d3226] bg-white/[0.06]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ece3d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5 L16 12 L9 19" />
        </svg>
      </button>
    </div>
  );
}
