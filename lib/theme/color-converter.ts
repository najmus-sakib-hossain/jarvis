import { ColorFormat, OklchValue, TailwindVersion } from "@/types/theme";
import * as culori from "culori";

const formatNumber = (num?: number): number => {
  if (!num) return 0;
  return num % 1 === 0 ? num : Number(num.toFixed(3));
};

// Helper to format the alpha value if it exists and is not 1
const formatAlphaForCss = (alpha: number | undefined): string | null => {
  if (alpha === undefined || alpha === 1) {
    return null; // Not needed if opaque or undefined
  }
  // Standard CSS format: / A (where A can be a number or percentage)
  // We'll use percentage for consistency with HSL
  return `/ ${formatNumber(alpha * 100)}%`;
};

const formatAlphaForHex = (alpha: number | undefined): string | null => {
  if (alpha === undefined || alpha === 1) {
    return null; // Not needed if opaque or undefined
  }
  // Convert alpha to a two-digit hexadecimal value (00-ff)
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return alphaHex;
};

export const colorFormatter = (
  colorValue: string, // Expected "oklch(L C H)" or "oklch(L C H / A)"
  format: ColorFormat,
  tailwindVersion: TailwindVersion,
): string => {
  try {
    const parsedColor = culori.parse(colorValue);
    if (!parsedColor) throw new Error("Invalid color input");

    switch (format) {
      case "oklch": {
        const colorInOklch = convertToOklch(colorValue);
        return colorInOklch;
      }
      case "hsl": {
        // Transform to hex first to avoid weird conversion issues from oklch to hsl
        const colorInHex = culori.formatHex(parsedColor);
        const hsl = culori.hsl(colorInHex);
        if (!hsl) throw new Error("Invalid color input");

        const h = formatNumber(hsl.h);
        const s = formatNumber(hsl.s * 100);
        const l = formatNumber(hsl.l * 100);
        const alphaPart = formatAlphaForCss(parsedColor.alpha); // Extract alpha from the original color

        if (tailwindVersion === "4") {
          // Tailwind v4 uses modern CSS syntax hsl(H S% L% / A)
          return alphaPart
            ? `hsl(${h} ${s}% ${l}% ${alphaPart})`
            : `hsl(${h} ${s}% ${l}%)`;
        } else {
          // Tailwind v3 expects direct values "H S% L%" (alpha is omitted)
          if (alphaPart) {
            console.warn(
              `Alpha channel ignored converting to HSL for Tailwind v3: ${colorValue}`,
            );
          }
          return `${h} ${s}% ${l}%`;
        }
      }
      case "rgb": {
        // Convert the 'color' object (parsed from oklch) to RGB
        const rgb = culori.converter("rgb")(parsedColor);
        if (!rgb) throw new Error("Invalid color input");

        // culori.formatRgb handles alpha, returning rgb(R G B / A)
        return culori.formatRgb(rgb); // e.g., "rgb(64 128 192)" or "rgb(64 128 192 / 0.5)"
      }
      case "hex": {
        const hex = culori.formatHex(parsedColor);

        // Add the alpha channel if necessary
        const alphaPart = formatAlphaForHex(parsedColor.alpha);
        return alphaPart ? `${hex}${alphaPart}` : hex;
      }
      default:
        return colorValue;
    }
  } catch (error) {
    console.error(`Failed to convert color: ${colorValue}`, error);
    return colorValue;
  }
};

export const convertToOklch = (colorToConvert: string): OklchValue => {
  const parsedColor = culori.parse(colorToConvert);
  if (!parsedColor) throw new Error("Invalid color input");

  const colorInOklch = culori.oklch(parsedColor);

  if (!colorInOklch) {
    throw new Error("Color not found");
  }

  const l = formatNumber(colorInOklch.l);
  const c = formatNumber(colorInOklch.c);
  const h = formatNumber(colorInOklch.h ? colorInOklch.h : 0);
  const alphaPart = formatAlphaForCss(parsedColor.alpha); // Extract alpha from the original color

  if (alphaPart) {
    return `oklch(${l} ${c} ${h} ${alphaPart})` as OklchValue;
  }

  return `oklch(${l} ${c} ${h})`;
};

export function convertToHex(colorToConvert: string): string {
  const parsedColor = culori.parse(colorToConvert);
  if (!parsedColor) throw new Error("Invalid color input");

  const hex = culori.formatHex(parsedColor);

  if (parsedColor.alpha) {
    const alphaHex = formatAlphaForHex(parsedColor.alpha);
    return `${hex}${alphaHex}`;
  }

  return hex;
}
