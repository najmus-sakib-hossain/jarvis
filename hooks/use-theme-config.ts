import { allPresetsArray } from "@/constants/colors";
import {
  DEFAULT_FONTS,
  DEFAULT_RADIUS,
  DEFAULT_SURFACE,
  initialThemeConfig,
} from "@/constants/themes";
import { ThemeObject } from "@/types/theme";
import {
  mergeThemeObjects,
  mergeThemeObjectWithInitial,
} from "@/constants/theme-config";
import { isEqual } from "lodash";
import React from "react";
import { useConfig } from "@/hooks/use-config";

export function useThemeConfig() {
  const [config, setConfig] = useConfig();
  const [hasLoaded, setHasLoaded] = React.useState(false);

  React.useEffect(() => {
    // This prevents the theme from being set with the default values
    // since the theme config from localStorage was applied in a script in the <head>
    setHasLoaded(true);
  }, []);

  const currentThemeObject = config.themeObject;
  const currentSurfacePreset = config.surface;
  const currentRadius = config.radius;
  const currentFonts = config.fonts;
  const currentPresetName = config.themeObject.name;
  const currentPresetThemeObject = allPresetsArray.find(
    (preset) => preset.name === currentPresetName,
  );

  const updateThemeConfig = (themeObject: ThemeObject) => {
    const mergedThemeObject = mergeThemeObjectWithInitial(themeObject);

    setConfig((prev) => ({
      ...prev,
      surface: "default",
      fonts: { ...prev.fonts, ...themeObject.fonts },
      radius: themeObject.radius ?? prev.radius,
      themeObject: mergedThemeObject,
    }));
  };

  const resetToDefault = () => {
    setConfig(initialThemeConfig);
  };

  const resetToLatestThemePreset = () => {
    if (!currentPresetThemeObject) return;

    setConfig((prev) => {
      const themeObject = mergeThemeObjects(
        prev.themeObject,
        currentPresetThemeObject,
      );
      const mergedThemeObject = mergeThemeObjectWithInitial(themeObject);

      return {
        ...prev,
        surface: DEFAULT_SURFACE,
        fonts: {
          sans:
            currentPresetThemeObject.fonts?.sans ?? DEFAULT_FONTS["font-sans"],
          serif:
            currentPresetThemeObject.fonts?.serif ??
            DEFAULT_FONTS["font-serif"],
          mono:
            currentPresetThemeObject.fonts?.mono ?? DEFAULT_FONTS["font-mono"],
        },
        radius: currentPresetThemeObject.radius ?? DEFAULT_RADIUS,
        themeObject: mergedThemeObject,
      };
    });
  };

  const hasDefaultThemeChanged = () => {
    const initialThemeObject = initialThemeConfig.themeObject;
    const initialThemeRadius = initialThemeConfig.radius;
    const initialThemeFonts = initialThemeConfig.fonts;

    const isThemeObjectEqual = isEqual(currentThemeObject, initialThemeObject);
    const isRadiusEqual = currentRadius === initialThemeRadius;
    const areFontsEqual = isEqual(currentFonts, initialThemeFonts);

    return !isThemeObjectEqual || !isRadiusEqual || !areFontsEqual;
  };

  const hasCurrentPresetChanged = () => {
    const mergedThemeObjectWithDefaults = mergeThemeObjectWithInitial(
      currentPresetThemeObject!,
    );

    const isThemeObjectEqual = isEqual(
      mergedThemeObjectWithDefaults,
      currentThemeObject,
    );

    const isRadiusEqual =
      (currentPresetThemeObject?.radius ?? initialThemeConfig.radius) ===
      currentRadius;

    const presetFonts = {
      sans: currentPresetThemeObject?.fonts?.sans ?? DEFAULT_FONTS["font-sans"],
      serif:
        currentPresetThemeObject?.fonts?.serif ?? DEFAULT_FONTS["font-serif"],
      mono: currentPresetThemeObject?.fonts?.mono ?? DEFAULT_FONTS["font-mono"],
    };
    const areFontsEqual = currentPresetThemeObject?.fonts
      ? isEqual(presetFonts, currentFonts)
      : true;

    return !isThemeObjectEqual || !isRadiusEqual || !areFontsEqual;
  };

  return {
    hasLoaded,
    currentThemeObject,
    currentSurfacePreset,
    currentRadius,
    currentFonts,
    config,
    setConfig,
    updateThemeConfig,
    resetToDefault,
    resetToLatestThemePreset,
    hasDefaultThemeChanged,
    hasCurrentPresetChanged,
    currentPresetName,
    currentPresetThemeObject,
  };
}
