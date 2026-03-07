"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { VehicleVisualSpec } from "@/lib/configurator/3d/visual-spec";

const ConfiguratorViewerCanvas = dynamic(
  () => import("./configurator-viewer-canvas").then((mod) => mod.ConfiguratorViewerCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Loading viewer</p>
      </div>
    ),
  },
);

type ViewerAssetStatus = VehicleVisualSpec["asset"]["availability"] | "checking" | "missing" | "failed";
type RuntimeAssetState = "idle" | "checking" | "ready" | "missing" | "failed";

const availabilityLabels: Record<ViewerAssetStatus, string> = {
  checking: "Checking GLB asset",
  failed: "GLB fallback active",
  missing: "GLB asset missing",
  planned: "Procedural preview",
  ready: "GLB asset active",
  unmapped: "Manifest missing",
  unselected: "No vehicle selected",
};

const availabilityToneClasses: Record<ViewerAssetStatus, string> = {
  checking: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100",
  failed: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  missing: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  planned: "border-slate-500/40 bg-slate-900/80 text-slate-200",
  ready: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
  unmapped: "border-violet-400/25 bg-violet-400/10 text-violet-100",
  unselected: "border-slate-500/40 bg-slate-900/80 text-slate-200",
};

function formatLabel(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getViewerAssetStatus(
  visualSpec: VehicleVisualSpec,
  runtimeAssetState: RuntimeAssetState,
): ViewerAssetStatus {
  if (visualSpec.asset.availability !== "ready") {
    return visualSpec.asset.availability;
  }

  switch (runtimeAssetState) {
    case "ready":
      return "ready";
    case "missing":
      return "missing";
    case "failed":
      return "failed";
    case "checking":
    case "idle":
    default:
      return "checking";
  }
}

interface ConfiguratorViewerProps {
  visualSpec: VehicleVisualSpec;
  modelName: string;
}

export function ConfiguratorViewer({ visualSpec, modelName }: ConfiguratorViewerProps) {
  const [runtimeAssetState, setRuntimeAssetState] = useState<RuntimeAssetState>("idle");

  useEffect(() => {
    let cancelled = false;

    if (visualSpec.asset.availability !== "ready" || !visualSpec.asset.glbPath) {
      setRuntimeAssetState("idle");
      return () => {
        cancelled = true;
      };
    }

    setRuntimeAssetState("checking");

    fetch(visualSpec.asset.glbPath, {
      method: "HEAD",
      cache: "no-store",
    })
      .then((response) => {
        if (!cancelled) {
          setRuntimeAssetState(response.ok ? "ready" : "missing");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRuntimeAssetState("missing");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visualSpec.asset.availability, visualSpec.asset.glbPath]);

  const viewerAssetStatus = useMemo(
    () => getViewerAssetStatus(visualSpec, runtimeAssetState),
    [runtimeAssetState, visualSpec],
  );
  const renderGlb = viewerAssetStatus === "ready" && Boolean(visualSpec.asset.glbPath);
  const detailBadges = useMemo(() => {
    const badges = [
      {
        label: "Paint",
        value: visualSpec.paint.name ?? "Standard",
        accent: visualSpec.paint.color,
      },
      visualSpec.wheels.name
        ? {
            label: "Wheels",
            value: visualSpec.wheels.name,
          }
        : null,
      visualSpec.packages.optionIds.length
        ? {
            label: "Packages",
            value: `${visualSpec.packages.optionIds.length}`,
          }
        : null,
    ].filter((badge): badge is { label: string; value: string; accent?: string } => Boolean(badge));

    return badges;
  }, [visualSpec.packages.optionIds.length, visualSpec.paint.color, visualSpec.paint.name, visualSpec.wheels.name]);
  const footerBadges = useMemo(() => {
    return [
      visualSpec.trim.trimId
        ? {
            label: "Trim",
            value: formatLabel(visualSpec.trim.trimId),
          }
        : null,
      visualSpec.interior.upholsteryName
        ? {
            label: "Interior",
            value: visualSpec.interior.upholsteryName,
          }
        : null,
      visualSpec.roof.optionIds.length
        ? {
            label: "Roof",
            value: visualSpec.roof.optionIds.map((optionId) => formatLabel(optionId.replace(/^roof-/, ""))).join(" • "),
          }
        : null,
    ].filter((badge): badge is { label: string; value: string } => Boolean(badge));
  }, [visualSpec.interior.upholsteryName, visualSpec.roof.optionIds, visualSpec.trim.trimId]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.55),_rgba(2,6,23,0.95))]">
      <ConfiguratorViewerCanvas
        glbPath={visualSpec.asset.glbPath}
        onGlbError={() => setRuntimeAssetState("failed")}
        renderGlb={renderGlb}
        visualSpec={visualSpec}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <div className="rounded-full border border-slate-700/60 bg-slate-950/55 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">{modelName}</p>
            <div className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] ${availabilityToneClasses[viewerAssetStatus]}`}>
              {availabilityLabels[viewerAssetStatus]}
            </div>
          </div>
        </div>

        <div className="flex max-w-xs flex-wrap justify-end gap-2">
          {detailBadges.map((badge) => (
            <div key={`${badge.label}-${badge.value}`} className="rounded-full border border-slate-700/60 bg-slate-950/50 px-3 py-1.5 text-right backdrop-blur-sm">
              <div className="flex items-center justify-end gap-2">
                {badge.accent ? <span className="h-2.5 w-2.5 rounded-full border border-white/20" style={{ backgroundColor: badge.accent }} /> : null}
                <p className="text-[10px] font-medium text-slate-100">{badge.label}: {badge.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/55 via-slate-950/20 to-transparent p-3">
        <div className="flex items-end justify-between gap-3">
          <div className="rounded-full border border-slate-700/60 bg-slate-950/45 px-3 py-1.5 text-left backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">Drag to orbit • Scroll to zoom</p>
          </div>

          <div className="flex max-w-sm flex-wrap justify-end gap-2">
          {footerBadges.map((badge) => (
            <div key={`${badge.label}-${badge.value}`} className="rounded-full border border-slate-700/60 bg-slate-950/45 px-3 py-1.5 text-right backdrop-blur-sm">
              <p className="text-[10px] font-medium text-slate-100">{badge.label}: {badge.value}</p>
            </div>
          ))}

          {visualSpec.missingBindings.length ? (
            <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-right text-[10px] font-medium text-amber-200 backdrop-blur-sm">
              {visualSpec.missingBindings.length} visual mapping
              {visualSpec.missingBindings.length === 1 ? " gap" : " gaps"}
            </div>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}