// src/components/Mascot3D.jsx
import React, { Suspense, useMemo, useRef, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/** ─────────────────────────────────────────────────────────────
 * 머티리얼 정리: 반쪽 투명/백페이스 문제 임시 해결
 * - 모든 Mesh 머티리얼을 DoubleSide로
 * - 불필요한 transparent/alphaTest 제거
 * - depthWrite/ depthTest 정리
 * ────────────────────────────────────────────────────────────*/
function sanitizeMaterials(root) {
  root.traverse((o) => {
    if (o.isMesh && o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        m.side = THREE.DoubleSide;
        // 알파맵도 없고 사실상 불필요한 투명 설정이면 끔
        if (m.transparent && !m.alphaMap) {
          m.transparent = false;
          m.opacity = 1;
        }
        if (m.alphaTest) m.alphaTest = 0;
        m.depthWrite = true;
        m.depthTest = true;
      });
    }
  });
}

/** 살짝 둥실 회전(감소된 모션이면 비활성) */
function IdleRotate({ speed = 0.3, children }) {
  const group = useRef();
  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += speed * dt;
  });
  return <group ref={group}>{children}</group>;
}

/** 모델 로더 */
function Model({ url, scale = 1 }) {
  const { scene } = useGLTF(url, true); // cache
  // 로드 직후 머티리얼 정리
  useMemo(() => sanitizeMaterials(scene), [scene]);

  const s = useMemo(
    () => (window.innerWidth < 390 ? scale * 0.9 : scale),
    [scale]
  );
  return <primitive object={scene} scale={s} />;
}

/** 바운딩 박스로 카메라 자동 맞추기 */
function FitToObject({ children, margin = 1.18 }) {
  const group = useRef();
  const { camera, gl } = useThree();

  useLayoutEffect(() => {
    if (!group.current) return;

    const box = new THREE.Box3().setFromObject(group.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fov = (camera.fov * Math.PI) / 180;
    const dist = (maxSize * margin) / (2 * Math.tan(fov / 2));

    camera.position.set(center.x, center.y, center.z + dist);
    camera.near = Math.max(0.01, dist / 100);
    camera.far = dist * 100;
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  }, [camera, gl]);

  return <group ref={group}>{children}</group>;
}

// prefers-reduced-motion 감지
const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Mascot3D({
  glbUrl = "/models/character.glb",
  ratio = "16 / 10",
  width = "min(84%, 360px)",
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "40%",
        width,
        aspectRatio: ratio, // 정사각형 탈출
        pointerEvents: "none",
      }}
    >
      <Canvas camera={{ fov: 32 }} dpr={[1, 1.6]} gl={{ antialias: true }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={0.9} />

        <Suspense fallback={null}>
          <Environment preset="sunset" blur={0.7} />
          <FitToObject margin={1.18}>
            {reducedMotion ? (
              <Model url={glbUrl} />
            ) : (
              <IdleRotate speed={0.35}>
                <Model url={glbUrl} />
              </IdleRotate>
            )}
          </FitToObject>
        </Suspense>
      </Canvas>
    </div>
  );
}

// (옵션) 드라코 압축 glb면 프로젝트 초기화 구간에서 한 번 설정
// useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");