function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeHexColor(color: string) {
  const normalized = color.trim().replace(/^#/, "");
  const hex = normalized.length === 3
    ? normalized.split("").map((segment) => `${segment}${segment}`).join("")
    : normalized.padEnd(6, "0").slice(0, 6);

  return `#${hex.toLowerCase()}`;
}

function hexToRgb(color: string) {
  const normalized = normalizeHexColor(color);

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixColors(baseColor: string, overlayColor: string, amount: number) {
  const base = hexToRgb(baseColor);
  const overlay = hexToRgb(overlayColor);
  const alpha = clamp(amount, 0, 1);

  return rgbToHex({
    r: base.r + (overlay.r - base.r) * alpha,
    g: base.g + (overlay.g - base.g) * alpha,
    b: base.b + (overlay.b - base.b) * alpha,
  });
}

function toRgba(color: string, alpha: number) {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

function toLinearChannel(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(color: string) {
  const { r, g, b } = hexToRgb(color);
  return (0.2126 * toLinearChannel(r)) + (0.7152 * toLinearChannel(g)) + (0.0722 * toLinearChannel(b));
}

export interface VehicleViewerTheme {
  containerBackground: string;
  stageBackground: string;
  fogColor: string;
  floorColor: string;
  ringColor: string;
  shadowColor: string;
  ambientLightIntensity: number;
  hemisphereSkyColor: string;
  hemisphereGroundColor: string;
  hemisphereIntensity: number;
  keyLightIntensity: number;
  fillLightIntensity: number;
  accentLightColor: string;
  accentLightIntensity: number;
}

export function getVehicleViewerTheme(paintColor: string): VehicleViewerTheme {
  const normalizedPaintColor = normalizeHexColor(paintColor);
  const luminance = getRelativeLuminance(normalizedPaintColor);

  if (luminance < 0.22) {
    const stageBackground = mixColors("#f8fafc", normalizedPaintColor, 0.08);
    const fogColor = mixColors("#e2e8f0", normalizedPaintColor, 0.12);
    const shadowColor = mixColors("#334155", normalizedPaintColor, 0.36);

    return {
      containerBackground: `radial-gradient(circle at 50% 12%, ${toRgba(mixColors(normalizedPaintColor, "#ffffff", 0.35), 0.24)} 0%, ${toRgba(stageBackground, 0.88)} 56%, ${toRgba(shadowColor, 0.98)} 100%)`,
      stageBackground,
      fogColor,
      floorColor: mixColors("#cbd5e1", normalizedPaintColor, 0.2),
      ringColor: mixColors(normalizedPaintColor, "#38bdf8", 0.72),
      shadowColor,
      ambientLightIntensity: 1,
      hemisphereSkyColor: "#ffffff",
      hemisphereGroundColor: "#64748b",
      hemisphereIntensity: 0.78,
      keyLightIntensity: 2.7,
      fillLightIntensity: 1.22,
      accentLightColor: mixColors(normalizedPaintColor, "#67e8f9", 0.78),
      accentLightIntensity: 0.38,
    };
  }

  if (luminance > 0.72) {
    const stageBackground = mixColors("#0f172a", normalizedPaintColor, 0.08);
    const fogColor = mixColors("#1e293b", normalizedPaintColor, 0.12);

    return {
      containerBackground: `radial-gradient(circle at 50% 10%, ${toRgba(mixColors(normalizedPaintColor, "#ffffff", 0.16), 0.18)} 0%, ${toRgba(stageBackground, 0.82)} 54%, ${toRgba("#020617", 0.98)} 100%)`,
      stageBackground,
      fogColor,
      floorColor: mixColors("#334155", normalizedPaintColor, 0.14),
      ringColor: mixColors("#67e8f9", normalizedPaintColor, 0.24),
      shadowColor: "#020617",
      ambientLightIntensity: 0.8,
      hemisphereSkyColor: "#dbeafe",
      hemisphereGroundColor: "#020617",
      hemisphereIntensity: 0.56,
      keyLightIntensity: 2.45,
      fillLightIntensity: 1.08,
      accentLightColor: mixColors(normalizedPaintColor, "#67e8f9", 0.42),
      accentLightIntensity: 0.54,
    };
  }

  const stageBackground = mixColors("#111827", normalizedPaintColor, 0.12);
  const fogColor = mixColors("#1f2937", normalizedPaintColor, 0.16);

  return {
    containerBackground: `radial-gradient(circle at 50% 10%, ${toRgba(mixColors(normalizedPaintColor, "#ffffff", 0.22), 0.2)} 0%, ${toRgba(stageBackground, 0.84)} 55%, ${toRgba("#020617", 0.98)} 100%)`,
    stageBackground,
    fogColor,
    floorColor: mixColors("#334155", normalizedPaintColor, 0.2),
    ringColor: mixColors(normalizedPaintColor, "#67e8f9", 0.56),
    shadowColor: mixColors("#020617", normalizedPaintColor, 0.08),
    ambientLightIntensity: 0.9,
    hemisphereSkyColor: "#e2e8f0",
    hemisphereGroundColor: "#0f172a",
    hemisphereIntensity: 0.62,
    keyLightIntensity: 2.55,
    fillLightIntensity: 1.14,
    accentLightColor: mixColors(normalizedPaintColor, "#67e8f9", 0.6),
    accentLightIntensity: 0.46,
  };
}