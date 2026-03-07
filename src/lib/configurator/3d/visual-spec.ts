import {
  getExteriorOptionById,
  getInteriorOptionById,
  getModelById,
  getWheelById,
} from "@/lib/configurator/mock-data";
import type { Configuration } from "@/lib/configurator/types";

import { getVehicleAssetManifest, type VehicleAssetManifest, type VehicleCameraPreset } from "./asset-manifest";

export interface VehicleVisualSpec {
  modelId: string | null;
  asset: {
    availability: "unselected" | "unmapped" | "planned" | "ready";
    glbPath: string | null;
    fallbackImage: string | null;
    sceneScale: number | null;
    camera: VehicleCameraPreset | null;
  };
  paint: {
    optionId: string | null;
    name: string | null;
    color: string;
    materialName: string | null;
  };
  roof: {
    optionIds: string[];
    nodeNames: string[];
    allNodeNames: string[];
  };
  wheels: {
    optionId: string | null;
    name: string | null;
    meshName: string | null;
    allMeshNames: string[];
  };
  interior: {
    upholsteryOptionId: string | null;
    upholsteryName: string | null;
    upholsteryColor: string | null;
    upholsteryMaterialNames: string[];
    trimOptionIds: string[];
    trimMaterialNames: string[];
  };
  packages: {
    optionIds: string[];
    nodeNames: string[];
    allNodeNames: string[];
  };
  trim: {
    trimId: string | null;
    nodeNames: string[];
    allNodeNames: string[];
  };
  missingBindings: string[];
}

function resolveAssetAvailability(
  manifest: VehicleAssetManifest | null,
  modelId: string | null,
): VehicleVisualSpec["asset"]["availability"] {
  if (!modelId) {
    return "unselected";
  }

  if (!manifest) {
    return "unmapped";
  }

  return manifest.assetStatus;
}

function getUniqueNames(nodeNames: string[]): string[] {
  return [...new Set(nodeNames.filter(Boolean))];
}

function hasConfiguredBindings(bindings: Record<string, string | string[]> | undefined): boolean {
  if (!bindings) {
    return false;
  }

  return Object.values(bindings).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)));
}

export function getVehicleVisualSpec(configuration: Configuration): VehicleVisualSpec {
  const model = configuration.modelId ? getModelById(configuration.modelId) : null;
  const manifest = getVehicleAssetManifest(configuration.modelId);
  const missingBindings: string[] = [];
  const hasRoofBindings = hasConfiguredBindings(manifest?.roofOptionNodes);
  const hasPackageBindings = hasConfiguredBindings(manifest?.packageNodes);
  const hasWheelBindings = hasConfiguredBindings(manifest?.wheelNodes);

  const exteriorSelections = configuration.exteriorOptions
    .map((optionId) => getExteriorOptionById(optionId))
    .filter((option): option is NonNullable<typeof option> => Boolean(option));

  const interiorSelections = configuration.interiorOptions
    .map((optionId) => getInteriorOptionById(optionId))
    .filter((option): option is NonNullable<typeof option> => Boolean(option));

  const paintOption = exteriorSelections.find((option) => option.type === "paint" && option.color);
  const roofOptions = exteriorSelections.filter((option) => option.type === "roof");
  const upholsteryOption = interiorSelections.find((option) => option.type === "upholstery");
  const trimMaterialOptions = interiorSelections.filter((option) => option.type === "trim_material");
  const wheelOption = configuration.wheels ? getWheelById(configuration.wheels) : null;

  const roofNodeNames = roofOptions.flatMap((option) => {
    const nodeName = manifest?.roofOptionNodes[option.id];

    if (!nodeName) {
      if (manifest && hasRoofBindings) {
        missingBindings.push(`roof:${option.id}`);
      }
      return [];
    }

    return [nodeName];
  });

  const packageNodeNames = configuration.packages.flatMap((packageId) => {
    const nodeNames = manifest?.packageNodes[packageId];

    if (!nodeNames?.length) {
      if (manifest && hasPackageBindings) {
        missingBindings.push(`package:${packageId}`);
      }
      return [];
    }

    return nodeNames;
  });

  const trimNodeNames = (() => {
    if (!configuration.trimId || !manifest?.trimNodes) {
      return [];
    }

    return manifest.trimNodes[configuration.trimId] ?? [];
  })();

  const wheelMeshName = (() => {
    if (!configuration.wheels) {
      return null;
    }

    const meshName = manifest?.wheelNodes[configuration.wheels] ?? null;
    if (!meshName && manifest && hasWheelBindings) {
      missingBindings.push(`wheel:${configuration.wheels}`);
    }

    return meshName;
  })();

  return {
    modelId: configuration.modelId,
    asset: {
      availability: resolveAssetAvailability(manifest, configuration.modelId),
      glbPath: manifest?.glbPath ?? null,
      fallbackImage: model?.image ?? null,
      sceneScale: manifest?.sceneScale ?? null,
      camera: manifest?.camera ?? null,
    },
    paint: {
      optionId: paintOption?.id ?? null,
      name: paintOption?.name ?? null,
      color: paintOption?.color ?? "#ffffff",
      materialName: manifest?.paintMaterialName ?? null,
    },
    roof: {
      optionIds: roofOptions.map((option) => option.id),
      nodeNames: getUniqueNames(roofNodeNames),
      allNodeNames: getUniqueNames(Object.values(manifest?.roofOptionNodes ?? {})),
    },
    wheels: {
      optionId: wheelOption?.id ?? null,
      name: wheelOption?.name ?? null,
      meshName: wheelMeshName,
      allMeshNames: getUniqueNames(Object.values(manifest?.wheelNodes ?? {})),
    },
    interior: {
      upholsteryOptionId: upholsteryOption?.id ?? null,
      upholsteryName: upholsteryOption?.name ?? null,
      upholsteryColor: upholsteryOption?.color ?? null,
      upholsteryMaterialNames: manifest?.upholsteryMaterialNames ?? [],
      trimOptionIds: trimMaterialOptions.map((option) => option.id),
      trimMaterialNames: manifest?.interiorTrimMaterialNames ?? [],
    },
    packages: {
      optionIds: [...configuration.packages],
      nodeNames: getUniqueNames(packageNodeNames),
      allNodeNames: getUniqueNames(Object.values(manifest?.packageNodes ?? {}).flat()),
    },
    trim: {
      trimId: configuration.trimId,
      nodeNames: getUniqueNames(trimNodeNames),
      allNodeNames: getUniqueNames(Object.values(manifest?.trimNodes ?? {}).flat() ?? []),
    },
    missingBindings,
  };
}