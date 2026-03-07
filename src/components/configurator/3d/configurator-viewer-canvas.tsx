"use client";

import { ContactShadows, OrbitControls, PerspectiveCamera, RoundedBox, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, Suspense, useMemo, useRef } from "react";
import { Box3, Vector3 } from "three";
import type { Group, Material, Mesh, Object3D } from "three";
import type { VehicleVisualSpec } from "@/lib/configurator/3d/visual-spec";
import type { VehicleViewerTheme } from "@/lib/configurator/3d/viewer-theme";

const DEFAULT_CAMERA = { position: [3.2, 1.8, 5.8] as [number, number, number], target: [0, 0.8, 0] as [number, number, number], fov: 34 };
const DEFAULT_VARIANT = { body: [2.7, 0.58, 1.18] as [number, number, number], cabin: [1.4, 0.5, 1.02] as [number, number, number], cabinPosition: [0.08, 0.48, 0] as [number, number, number], rideHeight: 0.12, noseOffset: 1.12, tailOffset: -1.12 };
const GLB_TARGET_SIZE = 3.35;

const VEHICLE_VARIANTS: Record<string, typeof DEFAULT_VARIANT> = {
  "sedan-x": DEFAULT_VARIANT,
  "suv-elite": { body: [2.9, 0.7, 1.28] as [number, number, number], cabin: [1.55, 0.64, 1.1] as [number, number, number], cabinPosition: [0.08, 0.66, 0] as [number, number, number], rideHeight: 0.18, noseOffset: 1.22, tailOffset: -1.22 },
  "coupe-sport": { body: [2.55, 0.5, 1.14] as [number, number, number], cabin: [1.2, 0.42, 0.98] as [number, number, number], cabinPosition: [0.16, 0.42, 0] as [number, number, number], rideHeight: 0.08, noseOffset: 1.06, tailOffset: -1.02 },
};

interface ConfiguratorViewerCanvasProps {
  glbPath: string | null;
  onGlbError: () => void;
  renderGlb: boolean;
  visualSpec: VehicleVisualSpec;
  viewerTheme: VehicleViewerTheme;
}

interface GlbFallbackBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError: () => void;
  resetKey: string;
}

interface GlbFallbackBoundaryState {
  hasError: boolean;
}

function getVariant(modelId: string | null) {
  return (modelId ? VEHICLE_VARIANTS[modelId] : null) ?? DEFAULT_VARIANT;
}

function getWheelRadius(optionId: string | null) {
  const wheelSize = optionId ? Number(optionId.match(/([0-9]+)/)?.[1] ?? "19") : 19;
  return 0.31 + Math.max(wheelSize - 18, 0) * 0.015;
}

function getTrimAccent(trimId: string | null) {
  switch (trimId) {
    case "sport":
      return "#22d3ee";
    case "luxury":
      return "#fbbf24";
    default:
      return "#94a3b8";
  }
}

function getRoofColor(visualSpec: VehicleVisualSpec) {
  if (visualSpec.roof.optionIds.includes("roof-carbon-fiber")) {
    return "#111827";
  }

  if (visualSpec.roof.optionIds.includes("roof-panoramic")) {
    return "#475569";
  }

  return visualSpec.paint.color;
}

function isMeshObject(object: Object3D): object is Mesh {
  return (object as Mesh).isMesh === true;
}

function hasColorSetter(
  material: Material,
): material is Material & { color: { set: (value: string) => void } } {
  return (
    "color" in material
    && typeof material.color === "object"
    && material.color !== null
    && "set" in material.color
    && typeof material.color.set === "function"
  );
}

function updateMaterialColor(
  material: Material,
  targetNames: Set<string>,
  color: string,
  properties?: {
    clearcoat?: number;
    clearcoatRoughness?: number;
    envMapIntensity?: number;
    metalness?: number;
    roughness?: number;
  },
) {
  if (!targetNames.has(material.name) || !hasColorSetter(material)) {
    return;
  }

  material.color.set(color);

  if (properties && "metalness" in material && typeof properties.metalness === "number") {
    material.metalness = properties.metalness;
  }

  if (properties && "roughness" in material && typeof properties.roughness === "number") {
    material.roughness = properties.roughness;
  }

  if (properties && "clearcoat" in material && typeof properties.clearcoat === "number") {
    material.clearcoat = properties.clearcoat;
  }

  if (properties && "clearcoatRoughness" in material && typeof properties.clearcoatRoughness === "number") {
    material.clearcoatRoughness = properties.clearcoatRoughness;
  }

  if (properties && "envMapIntensity" in material && typeof properties.envMapIntensity === "number") {
    material.envMapIntensity = properties.envMapIntensity;
  }
}

function updateMeshMaterials(
  material: Material | Material[],
  targetNames: Set<string>,
  color: string,
  properties?: {
    clearcoat?: number;
    clearcoatRoughness?: number;
    envMapIntensity?: number;
    metalness?: number;
    roughness?: number;
  },
) {
  if (Array.isArray(material)) {
    material.forEach((entry) => updateMaterialColor(entry, targetNames, color, properties));
    return;
  }

  updateMaterialColor(material, targetNames, color, properties);
}

function fitSceneToStage(scene: Object3D, scaleMultiplier: number) {
  scene.updateMatrixWorld(true);

  const initialBox = new Box3().setFromObject(scene);
  if (initialBox.isEmpty()) {
    return;
  }

  const initialSize = initialBox.getSize(new Vector3());
  if (initialSize.z > initialSize.x * 1.15) {
    scene.rotation.y = -Math.PI / 2;
    scene.updateMatrixWorld(true);
  }

  const box = new Box3().setFromObject(scene);
  if (box.isEmpty()) {
    return;
  }

  const size = box.getSize(new Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 1);
  const fitScale = (GLB_TARGET_SIZE / maxDimension) * scaleMultiplier;

  scene.scale.setScalar(fitScale);
  scene.updateMatrixWorld(true);

  const fittedBox = new Box3().setFromObject(scene);
  if (fittedBox.isEmpty()) {
    return;
  }

  const center = fittedBox.getCenter(new Vector3());
  scene.position.x -= center.x;
  scene.position.z -= center.z;
  scene.position.y -= fittedBox.min.y - 0.04;
  scene.updateMatrixWorld(true);
}

function applyVisualSpecToScene(scene: Object3D, visualSpec: VehicleVisualSpec) {
  const roofNodes = new Set(visualSpec.roof.nodeNames);
  const allRoofNodes = new Set(visualSpec.roof.allNodeNames);
  const packageNodes = new Set(visualSpec.packages.nodeNames);
  const allPackageNodes = new Set(visualSpec.packages.allNodeNames);
  const trimNodes = new Set(visualSpec.trim.nodeNames);
  const allTrimNodes = new Set(visualSpec.trim.allNodeNames);
  const allWheelNodes = new Set(visualSpec.wheels.allMeshNames);
  const selectedWheelNode = visualSpec.wheels.meshName;
  const paintMaterialNames = new Set(visualSpec.paint.materialName ? [visualSpec.paint.materialName] : []);
  const upholsteryMaterialNames = new Set(visualSpec.interior.upholsteryMaterialNames);
  const interiorTrimMaterialNames = new Set(visualSpec.interior.trimMaterialNames);
  const interiorTrimColor = getTrimAccent(visualSpec.trim.trimId);

  scene.traverse((object) => {
    if (allRoofNodes.has(object.name)) {
      object.visible = roofNodes.has(object.name);
    }

    if (allPackageNodes.has(object.name)) {
      object.visible = packageNodes.has(object.name);
    }

    if (allTrimNodes.has(object.name)) {
      object.visible = trimNodes.has(object.name);
    }

    if (selectedWheelNode && allWheelNodes.has(object.name)) {
      object.visible = object.name === selectedWheelNode;
    }

    if (!isMeshObject(object)) {
      return;
    }

    object.castShadow = true;
    object.receiveShadow = true;

    updateMeshMaterials(object.material, paintMaterialNames, visualSpec.paint.color, {
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.1,
      metalness: 0.58,
      roughness: 0.24,
    });

    if (visualSpec.interior.upholsteryColor) {
      updateMeshMaterials(object.material, upholsteryMaterialNames, visualSpec.interior.upholsteryColor, {
        metalness: 0.08,
        roughness: 0.78,
      });
    }

    updateMeshMaterials(object.material, interiorTrimMaterialNames, interiorTrimColor, {
      metalness: 0.72,
      roughness: 0.3,
    });
  });
}

class GlbFallbackBoundary extends Component<GlbFallbackBoundaryProps, GlbFallbackBoundaryState> {
  state: GlbFallbackBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): GlbFallbackBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  componentDidUpdate(prevProps: GlbFallbackBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function GlbVehicle({ glbPath, visualSpec }: { glbPath: string; visualSpec: VehicleVisualSpec }) {
  const gltf = useGLTF(glbPath);
  const scene = useMemo(() => {
    const nextScene = gltf.scene.clone(true);
    applyVisualSpecToScene(nextScene, visualSpec);
    fitSceneToStage(nextScene, visualSpec.asset.sceneScale ?? 1);
    return nextScene;
  }, [gltf.scene, visualSpec]);

  return <primitive dispose={null} object={scene} />;
}

function PresentationVehicle({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const time = performance.now() / 1000;

    group.position.y = Math.sin(time * 1.1) * 0.035;
    group.rotation.x = Math.cos(time * 0.45) * 0.012;
    group.rotation.z = Math.sin(time * 0.55) * 0.01;
  });

  return <group ref={groupRef}>{children}</group>;
}

function ProceduralVehicle({ visualSpec }: { visualSpec: VehicleVisualSpec }) {
  const variant = getVariant(visualSpec.modelId);
  const wheelRadius = getWheelRadius(visualSpec.wheels.optionId);
  const wheelDepth = 0.24;
  const bodyY = variant.rideHeight + 0.16;
  const cabinInsertHeight = Math.max(variant.cabin[1] - 0.16, 0.18);
  const trimAccent = getTrimAccent(visualSpec.trim.trimId);
  const roofColor = getRoofColor(visualSpec);
  const upholsteryColor = visualSpec.interior.upholsteryColor ?? "#cbd5e1";
  const packageCount = Math.max(visualSpec.packages.optionIds.length, 0);
  const showPanoramicRoof = visualSpec.roof.optionIds.includes("roof-panoramic");
  const showCarbonRoof = visualSpec.roof.optionIds.includes("roof-carbon-fiber");
  const wheelPositions: Array<[number, number, number]> = [
    [0.86, wheelRadius - 0.02, 0.72],
    [0.86, wheelRadius - 0.02, -0.72],
    [-0.86, wheelRadius - 0.02, 0.72],
    [-0.86, wheelRadius - 0.02, -0.72],
  ];

  return (
    <group scale={visualSpec.asset.sceneScale ?? 1}>
      <RoundedBox args={variant.body} position={[0, bodyY, 0]} radius={0.14} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.1}
          color={visualSpec.paint.color}
          metalness={0.55}
          roughness={0.2}
        />
      </RoundedBox>

      <RoundedBox args={variant.cabin} position={variant.cabinPosition} radius={0.12} smoothness={4} castShadow>
        <meshPhysicalMaterial color={roofColor} metalness={0.15} roughness={0.22} transparent opacity={0.84} clearcoat={0.7} />
      </RoundedBox>

      <RoundedBox
        args={[variant.cabin[0] - 0.18, cabinInsertHeight, variant.cabin[2] - 0.14]}
        position={[variant.cabinPosition[0], variant.cabinPosition[1] - 0.02, 0]}
        radius={0.08}
        smoothness={4}
      >
        <meshStandardMaterial color={upholsteryColor} metalness={0.06} roughness={0.86} />
      </RoundedBox>

      <RoundedBox args={[2.06, 0.06, 0.04]} position={[0, bodyY + 0.06, 0.6]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color={trimAccent} emissive={trimAccent} emissiveIntensity={0.18} metalness={0.72} roughness={0.26} />
      </RoundedBox>
      <RoundedBox args={[2.06, 0.06, 0.04]} position={[0, bodyY + 0.06, -0.6]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color={trimAccent} emissive={trimAccent} emissiveIntensity={0.18} metalness={0.72} roughness={0.26} />
      </RoundedBox>

      {showPanoramicRoof ? (
        <RoundedBox args={[0.94, 0.03, 0.72]} position={[variant.cabinPosition[0], variant.cabinPosition[1] + 0.17, 0]} radius={0.03} smoothness={4}>
          <meshPhysicalMaterial color="#dbeafe" metalness={0.05} roughness={0.08} transparent opacity={0.65} />
        </RoundedBox>
      ) : null}

      {showCarbonRoof ? (
        <RoundedBox args={[0.96, 0.025, 0.74]} position={[variant.cabinPosition[0], variant.cabinPosition[1] + 0.17, 0]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#020617" metalness={0.55} roughness={0.34} />
        </RoundedBox>
      ) : null}

      <RoundedBox args={[0.18, 0.07, 0.84]} position={[variant.noseOffset, bodyY + 0.04, 0]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#e2e8f0" emissive="#e2e8f0" emissiveIntensity={0.18} />
      </RoundedBox>
      <RoundedBox args={[0.16, 0.06, 0.84]} position={[variant.tailOffset, bodyY + 0.04, 0]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.28} />
      </RoundedBox>

      {wheelPositions.map((position, index) => (
        <group key={`${position.join("-")}-${index}`} position={position}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[wheelRadius, wheelRadius, wheelDepth, 28]} />
            <meshStandardMaterial color="#020617" roughness={0.88} metalness={0.12} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[wheelRadius * 0.58, wheelRadius * 0.58, wheelDepth + 0.02, 18]} />
            <meshStandardMaterial color={trimAccent} metalness={0.92} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {Array.from({ length: packageCount }).map((_, index) => {
        const x = -0.45 + index * 0.28;
        return (
          <mesh key={`package-${index}`} position={[x, variant.cabinPosition[1] + 0.42, 0]}>
            <sphereGeometry args={[0.05, 20, 20]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.45} metalness={0.35} roughness={0.24} />
          </mesh>
        );
      })}
    </group>
  );
}

export function ConfiguratorViewerCanvas({
  glbPath,
  onGlbError,
  renderGlb,
  visualSpec,
  viewerTheme,
}: ConfiguratorViewerCanvasProps) {
  const camera = visualSpec.asset.camera ?? DEFAULT_CAMERA;
  const fallbackVehicle = <ProceduralVehicle visualSpec={visualSpec} />;
  const cameraDistance = Math.hypot(
    camera.position[0] - camera.target[0],
    camera.position[1] - camera.target[1],
    camera.position[2] - camera.target[2],
  );
  const minDistance = Math.max(3.8, cameraDistance * 0.78);
  const maxDistance = Math.max(6.8, cameraDistance * 1.18);
  const renderedVehicle = renderGlb && glbPath ? (
    <GlbFallbackBoundary fallback={fallbackVehicle} onError={onGlbError} resetKey={glbPath}>
      <GlbVehicle glbPath={glbPath} visualSpec={visualSpec} />
    </GlbFallbackBoundary>
  ) : (
    fallbackVehicle
  );

  return (
    <Canvas shadows="percentage" dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={[viewerTheme.stageBackground]} />
      <fog attach="fog" args={[viewerTheme.fogColor, 5.5, 13.5]} />

      <PerspectiveCamera makeDefault position={camera.position} fov={camera.fov} />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.55}
        dampingFactor={0.08}
        enableDamping
        enablePan={false}
        maxDistance={maxDistance}
        maxPolarAngle={Math.PI / 2.02}
        minDistance={minDistance}
        minPolarAngle={Math.PI / 4.2}
        rotateSpeed={0.75}
        target={camera.target}
        zoomSpeed={0.85}
      />

      <ambientLight intensity={viewerTheme.ambientLightIntensity} />
      <hemisphereLight
        args={[
          viewerTheme.hemisphereSkyColor,
          viewerTheme.hemisphereGroundColor,
          viewerTheme.hemisphereIntensity,
        ]}
      />
      <directionalLight
        castShadow
        intensity={viewerTheme.keyLightIntensity}
        position={[4.8, 5.8, 4.2]}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />
      <directionalLight intensity={viewerTheme.fillLightIntensity} position={[-4, 2.5, -4.8]} />
      <spotLight
        angle={0.42}
        color={viewerTheme.accentLightColor}
        intensity={viewerTheme.accentLightIntensity}
        penumbra={0.85}
        position={[0, 3.4, 2.8]}
      />

      <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.35, 64]} />
        <meshStandardMaterial color={viewerTheme.floorColor} metalness={0.12} roughness={0.94} />
      </mesh>

      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.12, 2.65, 64]} />
        <meshBasicMaterial color={viewerTheme.ringColor} transparent opacity={0.16} />
      </mesh>

      <Suspense fallback={<PresentationVehicle>{fallbackVehicle}</PresentationVehicle>}>
        <PresentationVehicle>{renderedVehicle}</PresentationVehicle>
      </Suspense>

      <ContactShadows blur={2.4} color={viewerTheme.shadowColor} opacity={0.44} position={[0, -0.01, 0]} scale={5.8} />
    </Canvas>
  );
}