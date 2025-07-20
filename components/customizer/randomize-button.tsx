"use client";

import { useSurfaceShades } from "@/hooks/use-surface-shades";
import { useThemeConfig } from "@/hooks/use-theme-config";
import { useTokens } from "@/hooks/use-tokens";
import { basePresetsV4Array, surfaceShadesPresetArray } from "@/constants/colors";
import { TAILWIND_PALETTE_V4 } from "@/constants/palettes";
import { otherPresetsArray } from "@/constants/presets";
import { getRandomIndex } from "@/lib/utils";
import { RADIUS_VALUES } from "@/lib/theme/theme-constants";
import { monoFontsArray, sansFontsArray, serifFontsArray } from "@/constants/fonts";
import { Shuffle } from "lucide-react";
import { ComponentProps, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface RandomizeButtonProps extends ComponentProps<typeof Button> {}

export function RandomizeButton({ className, ...props }: RandomizeButtonProps) {
  const { setConfig } = useThemeConfig();
  const { setPrimaryColorTokens, setSurfaceShadesColorTokens } = useTokens();
  const {
    getDefaultSurfaceShades,
    getInvertedSurfaceShades,
    getPlainSurfaceShades,
  } = useSurfaceShades();

  const randomize = useCallback(() => {
    const allFontsArray = [
      ...sansFontsArray,
      ...serifFontsArray,
      ...monoFontsArray,
    ];

    const baseShadcnPresetsArray = [...basePresetsV4Array];

    const presetsArray = [...otherPresetsArray, ...basePresetsV4Array];

    const randomRadiusIndex = getRandomIndex(RADIUS_VALUES);
    const randomPresetIndex = getRandomIndex(presetsArray);
    const randomSansFontIndex = getRandomIndex(allFontsArray);
    const randomSerifFontIndex = getRandomIndex(serifFontsArray);
    const randomMonoFontIndex = getRandomIndex(monoFontsArray);

    const randomRadius = RADIUS_VALUES[randomRadiusIndex];
    const randomPreset = presetsArray[randomPresetIndex];
    const randomSansFont = allFontsArray[randomSansFontIndex].value;
    const randomSerifFont = serifFontsArray[randomSerifFontIndex].value;
    const randomMonoFont = monoFontsArray[randomMonoFontIndex].value;

    const currentPresetShadesArray = [
      getDefaultSurfaceShades(randomPreset.name),
      getInvertedSurfaceShades(randomPreset.name),
      getPlainSurfaceShades(randomPreset.name),
    ];

    const allPresetShadesArray = [
      ...currentPresetShadesArray,
      ...surfaceShadesPresetArray,
    ];

    const randomPresetShades = getRandomIndex(allPresetShadesArray);
    const randomSurfaceShades = allPresetShadesArray[randomPresetShades];

    setConfig((prev) => {
      return {
        ...prev,
        radius: randomRadius,
        surface: randomSurfaceShades.name,
        fonts: {
          sans: randomSansFont,
          serif: randomSerifFont,
          mono: randomMonoFont,
        },
        themeObject: randomPreset,
      };
    });

    setSurfaceShadesColorTokens({
      bgShadesThemeObject: randomSurfaceShades,
      modesInSync: true,
    });

    // Only if the random preset is a base shadcn preset, we set the primary color
    if (
      baseShadcnPresetsArray.some((item) => item.name === randomPreset.name)
    ) {
      const randomPrimaryColorIndex = getRandomIndex(
        Object.entries(TAILWIND_PALETTE_V4),
      );

      // I want the random color to be only in the shades 300, 400, 500, 600
      const selectableTailwindPaleteShades = [
        "300",
        "400",
        "500",
        "600",
      ] as const;

      const randomTailwindPaletteShadeIndex = getRandomIndex(
        selectableTailwindPaleteShades as any,
      );

      const randomTailwindPaletteShade =
        selectableTailwindPaleteShades[randomTailwindPaletteShadeIndex];

      const randomPrimaryColor =
        Object.entries(TAILWIND_PALETTE_V4)[randomPrimaryColorIndex]["1"][
          randomTailwindPaletteShade
        ];

      setPrimaryColorTokens({
        color: randomPrimaryColor,
        modesInSync: true,
      });
    }
  }, []);

  return (
    <Button
      size="sm"
      variant="ghost"
      className={className}
      {...props}
      onClick={randomize}
    >
      <Shuffle />
      <span className="sr-only">Get random theme</span>
    </Button>
  );
}
