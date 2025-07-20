import { initialThemeConfig } from "@/constants/themes";
import { ThemeObject } from "@/types/theme";
import { merge } from "lodash";

export function mergeThemeObjects(...themeObjects: ThemeObject[]) {
  // Clone each theme object to avoid mutating the originals
  const clonedObjects = themeObjects.map((obj) => structuredClone(obj));

  return merge({}, ...clonedObjects);
}

export function mergeThemeObjectWithInitial(themeObject: ThemeObject) {
  return merge(
    {}, // Start with an empty object
    structuredClone(initialThemeConfig.themeObject), // Apply defaults
    structuredClone(themeObject), // Apply overrides deeply
  );
}
