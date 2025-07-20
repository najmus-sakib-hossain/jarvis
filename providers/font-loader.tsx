"use client";

import { useThemeConfig } from "@/hooks/use-theme-config";
import { monoFontsArray, sansFontsArray, serifFontsArray } from "@/constants/fonts";

export function FontLoader() {
  const { hasLoaded, currentFonts } = useThemeConfig();

  if (!hasLoaded) return null;

  const sansFontHref = [
    ...sansFontsArray,
    ...serifFontsArray,
    ...monoFontsArray,
  ].find((font) => font.value === currentFonts?.sans)?.href;
  const serifFontHref = serifFontsArray.find(
    (font) => font.value === currentFonts?.serif,
  )?.href;
  const monoFontHref = monoFontsArray.find(
    (font) => font.value === currentFonts?.mono,
  )?.href;

  return (
    <>
      {sansFontHref && (
        <link href={sansFontHref} rel="stylesheet" precedence="high" />
      )}
      {serifFontHref && (
        <link href={serifFontHref} rel="stylesheet" precedence="high" />
      )}
      {monoFontHref && (
        <link href={monoFontHref} rel="stylesheet" precedence="high" />
      )}
    </>
  );
}
