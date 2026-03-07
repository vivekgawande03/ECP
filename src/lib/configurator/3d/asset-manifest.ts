import type { Model } from "@/lib/configurator/types";

export interface VehicleCameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface VehicleAssetManifest {
  modelId: Model["id"];
  assetStatus: "planned" | "ready";
  glbPath: string;
  sceneScale: number;
  camera: VehicleCameraPreset;
  paintMaterialName: string;
  upholsteryMaterialNames: string[];
  interiorTrimMaterialNames: string[];
  wheelNodes: Record<string, string>;
  roofOptionNodes: Record<string, string>;
  packageNodes: Record<string, string[]>;
  trimNodes?: Record<string, string[]>;
}

export const vehicleAssetManifest: Record<string, VehicleAssetManifest> = {
  "sedan-x": {
    modelId: "sedan-x",
    assetStatus: "ready",
    glbPath: "/models-3d/sedan-x.glb",
    sceneScale: 1,
    camera: {
      position: [4.2, 1.55, 6.3],
      target: [0, 0.8, 0],
      fov: 30,
    },
    paintMaterialName: "blinn1",
    upholsteryMaterialNames: [],
    interiorTrimMaterialNames: [],
    wheelNodes: {},
    roofOptionNodes: {},
    packageNodes: {},
    trimNodes: {},
  },
  "suv-elite": {
    modelId: "suv-elite",
    assetStatus: "ready",
    glbPath: "/models-3d/suv.glb",
    sceneScale: 1,
    camera: {
      position: [4.4, 1.8, 6.8],
      target: [0, 0.95, 0],
      fov: 31,
    },
    paintMaterialName: "Standard00FF80",
    upholsteryMaterialNames: [],
    interiorTrimMaterialNames: [],
    wheelNodes: {},
    roofOptionNodes: {},
    packageNodes: {},
    trimNodes: {},
  },
  "coupe-sport": {
    modelId: "coupe-sport",
    assetStatus: "ready",
    glbPath: "/models-3d/coupe-sport.glb",
    sceneScale: 1,
    camera: {
      position: [4.1, 1.45, 6.4],
      target: [0, 0.75, 0],
      fov: 30,
    },
    paintMaterialName: "Standard00E059",
    upholsteryMaterialNames: [],
    interiorTrimMaterialNames: [],
    wheelNodes: {},
    roofOptionNodes: {},
    packageNodes: {},
    trimNodes: {},
  },
};

export function getVehicleAssetManifest(modelId: string | null | undefined): VehicleAssetManifest | null {
  if (!modelId) {
    return null;
  }

  return vehicleAssetManifest[modelId] ?? null;
}