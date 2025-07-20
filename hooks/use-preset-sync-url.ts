import { allPresetsArray } from "@/constants/colors";
import { Preset } from "@/types/theme";
import { QUERY_PARAMS_KEYS } from "@/lib/theme/theme-constants";
import { useQueryState } from "nuqs";
import React from "react";
import { useThemeConfig } from "@/hooks/use-theme-config";

export const usePresetSyncUrl = () => {
  const [preset, setPreset] = useQueryState(QUERY_PARAMS_KEYS.preset);
  const { currentThemeObject, updateThemeConfig } = useThemeConfig();
  const currentPresetName = currentThemeObject.name;

  // Apply theme preset from the URL if it exists
  React.useEffect(() => {
    // No need to update if the preset is already applied
    if (preset === currentPresetName) return;

    if (preset) {
      const normalizedPresetFromUrl = preset.trim().toLowerCase() as Preset;
      const presetThemeObject = allPresetsArray.find(
        (p) => p.name === normalizedPresetFromUrl,
      );

      if (presetThemeObject) {
        updateThemeConfig(presetThemeObject);
      }

      // Either way, set the preset to null to avoid weird sync issues
      setPreset(null);
    }
  }, [preset, setPreset, currentPresetName, updateThemeConfig]);
};
