import { Preset, SurfaceShades, SurfaceShadesThemeObject } from "@/types/theme";
import { useThemeConfig } from "@/hooks/use-theme-config";
import { useTokens } from "@/hooks/use-tokens";

export function useSurfaceShades() {
  const { createTokenGetterForPreset } = useTokens();
  const { currentPresetName } = useThemeConfig();

  const getDefaultSurfaceShades = (
    preset?: Preset,
  ): SurfaceShadesThemeObject => {
    const getPresetToken = preset
      ? createTokenGetterForPreset(preset)
      : createTokenGetterForPreset(currentPresetName);

    const lightDefaultSurfaceShades: SurfaceShades = {
      background: getPresetToken({
        property: "background",
        mode: "light",
      }),
      foreground: getPresetToken({
        property: "foreground",
        mode: "light",
      }),

      card: getPresetToken({
        property: "card",
        mode: "light",
      }),
      "card-foreground": getPresetToken({
        property: "card-foreground",
        mode: "light",
      }),

      popover: getPresetToken({
        property: "popover",
        mode: "light",
      }),
      "popover-foreground": getPresetToken({
        property: "popover-foreground",
        mode: "light",
      }),

      muted: getPresetToken({
        property: "muted",
        mode: "light",
      }),
      "muted-foreground": getPresetToken({
        property: "muted-foreground",
        mode: "light",
      }),

      accent: getPresetToken({
        property: "accent",
        mode: "light",
      }),
      "accent-foreground": getPresetToken({
        property: "accent-foreground",
        mode: "light",
      }),

      border: getPresetToken({
        property: "border",
        mode: "light",
      }),
      input: getPresetToken({
        property: "input",
        mode: "light",
      }),

      sidebar: getPresetToken({
        property: "sidebar",
        mode: "light",
      }),
      "sidebar-foreground": getPresetToken({
        property: "sidebar-foreground",
        mode: "light",
      }),

      "sidebar-accent": getPresetToken({
        property: "sidebar-accent",
        mode: "light",
      }),
      "sidebar-accent-foreground": getPresetToken({
        property: "sidebar-accent-foreground",
        mode: "light",
      }),

      "sidebar-border": getPresetToken({
        property: "sidebar-border",
        mode: "light",
      }),
    };

    const darkDefaultSurfaceShades: SurfaceShades = {
      background: getPresetToken({
        property: "background",
        mode: "dark",
      }),
      foreground: getPresetToken({
        property: "foreground",
        mode: "dark",
      }),

      card: getPresetToken({
        property: "card",
        mode: "dark",
      }),
      "card-foreground": getPresetToken({
        property: "card-foreground",
        mode: "dark",
      }),

      popover: getPresetToken({
        property: "popover",
        mode: "dark",
      }),
      "popover-foreground": getPresetToken({
        property: "popover-foreground",
        mode: "dark",
      }),

      muted: getPresetToken({
        property: "muted",
        mode: "dark",
      }),
      "muted-foreground": getPresetToken({
        property: "muted-foreground",
        mode: "dark",
      }),

      accent: getPresetToken({
        property: "accent",
        mode: "dark",
      }),
      "accent-foreground": getPresetToken({
        property: "accent-foreground",
        mode: "dark",
      }),

      border: getPresetToken({
        property: "border",
        mode: "dark",
      }),
      input: getPresetToken({
        property: "input",
        mode: "dark",
      }),

      sidebar: getPresetToken({
        property: "sidebar",
        mode: "dark",
      }),
      "sidebar-foreground": getPresetToken({
        property: "sidebar-foreground",
        mode: "dark",
      }),

      "sidebar-accent": getPresetToken({
        property: "sidebar-accent",
        mode: "dark",
      }),
      "sidebar-accent-foreground": getPresetToken({
        property: "sidebar-accent-foreground",
        mode: "dark",
      }),

      "sidebar-border": getPresetToken({
        property: "sidebar-border",
        mode: "dark",
      }),
    };

    const surfaceThemeObject: SurfaceShadesThemeObject = {
      name: "default",
      label: "Default",
      light: lightDefaultSurfaceShades,
      dark: darkDefaultSurfaceShades,
    };

    return surfaceThemeObject;
  };

  const getInvertedSurfaceShades = (
    preset?: Preset,
  ): SurfaceShadesThemeObject => {
    const getColorToken = preset
      ? createTokenGetterForPreset(preset)
      : createTokenGetterForPreset(currentPresetName);

    const lightInvertedSurfaceShades: SurfaceShades = {
      background: getColorToken({
        property: "sidebar",
        mode: "light",
      }),
      foreground: getColorToken({
        property: "sidebar-foreground",
        mode: "light",
      }),

      card: getColorToken({
        property: "background",
        mode: "light",
      }),
      "card-foreground": getColorToken({
        property: "foreground",
        mode: "light",
      }),

      popover: getColorToken({
        property: "card",
        mode: "light",
      }),
      "popover-foreground": getColorToken({
        property: "card-foreground",
        mode: "light",
      }),

      muted: getColorToken({
        property: "muted",
        mode: "light",
      }),
      "muted-foreground": getColorToken({
        property: "muted-foreground",
        mode: "light",
      }),

      accent: getColorToken({
        property: "sidebar-accent",
        mode: "light",
      }),
      "accent-foreground": getColorToken({
        property: "sidebar-accent-foreground",
        mode: "light",
      }),

      border: getColorToken({
        property: "sidebar-border",
        mode: "light",
      }),
      input: getColorToken({
        property: "input",
        mode: "light",
      }),

      sidebar: getColorToken({
        property: "background",
        mode: "light",
      }),
      "sidebar-foreground": getColorToken({
        property: "foreground",
        mode: "light",
      }),

      "sidebar-accent": getColorToken({
        property: "accent",
        mode: "light",
      }),
      "sidebar-accent-foreground": getColorToken({
        property: "accent-foreground",
        mode: "light",
      }),

      "sidebar-border": getColorToken({
        property: "border",
        mode: "light",
      }),
    };

    const darkInvertedSurfaceShades: SurfaceShades = {
      background: getColorToken({
        property: "sidebar",
        mode: "dark",
      }),
      foreground: getColorToken({
        property: "sidebar-foreground",
        mode: "dark",
      }),

      card: getColorToken({
        property: "background",
        mode: "dark",
      }),
      "card-foreground": getColorToken({
        property: "foreground",
        mode: "dark",
      }),

      popover: getColorToken({
        property: "card",
        mode: "dark",
      }),
      "popover-foreground": getColorToken({
        property: "card-foreground",
        mode: "dark",
      }),

      muted: getColorToken({
        property: "muted",
        mode: "dark",
      }),
      "muted-foreground": getColorToken({
        property: "muted-foreground",
        mode: "dark",
      }),

      accent: getColorToken({
        property: "sidebar-accent",
        mode: "dark",
      }),
      "accent-foreground": getColorToken({
        property: "sidebar-accent-foreground",
        mode: "dark",
      }),

      border: getColorToken({
        property: "sidebar-border",
        mode: "dark",
      }),
      input: getColorToken({
        property: "input",
        mode: "dark",
      }),

      sidebar: getColorToken({
        property: "background",
        mode: "dark",
      }),
      "sidebar-foreground": getColorToken({
        property: "foreground",
        mode: "dark",
      }),

      "sidebar-accent": getColorToken({
        property: "accent",
        mode: "dark",
      }),
      "sidebar-accent-foreground": getColorToken({
        property: "accent-foreground",
        mode: "dark",
      }),

      "sidebar-border": getColorToken({
        property: "border",
        mode: "dark",
      }),
    };

    const surfaceThemeObject: SurfaceShadesThemeObject = {
      name: "inverted",
      label: "Inverted",
      light: lightInvertedSurfaceShades,
      dark: darkInvertedSurfaceShades,
    };

    return surfaceThemeObject;
  };

  const getPlainSurfaceShades = (preset?: Preset): SurfaceShadesThemeObject => {
    const getColorToken = preset
      ? createTokenGetterForPreset(preset)
      : createTokenGetterForPreset(currentPresetName);

    const lightPlainSurfaceShades: SurfaceShades = {
      background: getColorToken({
        property: "background",
        mode: "light",
      }),
      foreground: getColorToken({
        property: "foreground",
        mode: "light",
      }),

      card: getColorToken({
        property: "background",
        mode: "light",
      }),
      "card-foreground": getColorToken({
        property: "foreground",
        mode: "light",
      }),

      popover: getColorToken({
        property: "background",
        mode: "light",
      }),
      "popover-foreground": getColorToken({
        property: "foreground",
        mode: "light",
      }),

      muted: getColorToken({
        property: "muted",
        mode: "light",
      }),
      "muted-foreground": getColorToken({
        property: "muted-foreground",
        mode: "light",
      }),

      accent: getColorToken({
        property: "accent",
        mode: "light",
      }),
      "accent-foreground": getColorToken({
        property: "accent-foreground",
        mode: "light",
      }),

      border: getColorToken({
        property: "border",
        mode: "light",
      }),
      input: getColorToken({
        property: "input",
        mode: "light",
      }),

      sidebar: getColorToken({
        property: "background",
        mode: "light",
      }),
      "sidebar-foreground": getColorToken({
        property: "foreground",
        mode: "light",
      }),

      "sidebar-accent": getColorToken({
        property: "accent",
        mode: "light",
      }),
      "sidebar-accent-foreground": getColorToken({
        property: "accent-foreground",
        mode: "light",
      }),

      "sidebar-border": getColorToken({
        property: "border",
        mode: "light",
      }),
    };

    const darkPlainSurfaceShades: SurfaceShades = {
      background: getColorToken({
        property: "background",
        mode: "dark",
      }),
      foreground: getColorToken({
        property: "foreground",
        mode: "dark",
      }),

      card: getColorToken({
        property: "background",
        mode: "dark",
      }),
      "card-foreground": getColorToken({
        property: "foreground",
        mode: "dark",
      }),

      popover: getColorToken({
        property: "background",
        mode: "dark",
      }),
      "popover-foreground": getColorToken({
        property: "foreground",
        mode: "dark",
      }),

      muted: getColorToken({
        property: "muted",
        mode: "dark",
      }),
      "muted-foreground": getColorToken({
        property: "muted-foreground",
        mode: "dark",
      }),

      accent: getColorToken({
        property: "accent",
        mode: "dark",
      }),
      "accent-foreground": getColorToken({
        property: "accent-foreground",
        mode: "dark",
      }),

      border: getColorToken({
        property: "border",
        mode: "dark",
      }),
      input: getColorToken({
        property: "input",
        mode: "dark",
      }),

      sidebar: getColorToken({
        property: "background",
        mode: "dark",
      }),
      "sidebar-foreground": getColorToken({
        property: "foreground",
        mode: "dark",
      }),

      "sidebar-accent": getColorToken({
        property: "accent",
        mode: "dark",
      }),
      "sidebar-accent-foreground": getColorToken({
        property: "accent-foreground",
        mode: "dark",
      }),

      "sidebar-border": getColorToken({
        property: "border",
        mode: "dark",
      }),
    };

    const surfaceThemeObject: SurfaceShadesThemeObject = {
      name: "plain",
      label: "Plain",
      light: lightPlainSurfaceShades,
      dark: darkPlainSurfaceShades,
    };

    return surfaceThemeObject;
  };

  return {
    getDefaultSurfaceShades,
    getInvertedSurfaceShades,
    getPlainSurfaceShades,
  };
}
