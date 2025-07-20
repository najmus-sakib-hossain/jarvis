import { basePresetsV4 } from "@/constants/colors";
import { otherPresets } from "@/constants/presets";

import Color from "color";
import { parse } from "culori";
import { colorFormatter } from "@/lib/theme/color-converter";

export function getOptimalForegroundColor(baseColor: string) {
  if (!isValidColor(baseColor)) {
    throw new Error(`Invalid color format: ${baseColor}`);
  }

  const colorInHex = colorFormatter(baseColor, "hex", "4");
  const color = Color(colorInHex);

  const foregroundColor = color.isDark()
    ? otherPresets.vercel.dark.foreground
    : otherPresets.vercel.light.foreground;

  return foregroundColor;
}

export function isValidColor(color: string): boolean {
  try {
    const parsedColor = parse(color);
    if (!parsedColor) return false;
    return true;
  } catch {
    return false;
  }
}
