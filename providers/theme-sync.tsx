"use client";

import * as React from "react";

import { usePresetSyncUrl } from "@/hooks/use-preset-sync-url";
import { useThemeConfig } from "@/hooks/use-theme-config";
import { getCssVarsFromThemeObject } from "@/constants/themes";
import { ThemeMode, ThemeProperties } from "@/types/theme";
import { setStyleProperty } from "@/lib/utils";
import { setShadowVariables } from "@/constants/shadows";
import { useTheme } from "@/lib/theme";

export function ThemeSync() {
  const {
    currentThemeObject,
    currentSurfacePreset,
    currentRadius,
    currentFonts,
  } = useThemeConfig();
  const mode = useTheme().resolvedTheme as ThemeMode;

  usePresetSyncUrl();

  React.useEffect(() => {
    const root = document.querySelector(":root") as HTMLElement;
    if (!root) return;

    const fontSans = currentFonts?.sans;
    const fontSerif = currentFonts?.serif;
    const fontMono = currentFonts?.mono;

    const themeProperties: Partial<ThemeProperties> = {
      ...currentThemeObject[mode],
      radius: currentRadius,
      "font-sans": fontSans,
      "font-serif": fontSerif,
      "font-mono": fontMono,
    };

    const cssVars = getCssVarsFromThemeObject(themeProperties);

    for (const [key, value] of Object.entries(cssVars)) {
      setStyleProperty({ element: root, key: key, value });
    }

    // Sync shadow tokens based on --shadow-[x] variables
    setShadowVariables(root, currentThemeObject, mode);
  }, [
    currentThemeObject,
    currentSurfacePreset,
    currentRadius,
    currentFonts,
    mode,
  ]);

  return null;
}
