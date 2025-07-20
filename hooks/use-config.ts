import { initialThemeConfig } from "@/constants/themes";
import { ThemeConfig } from "@/types/theme";
import { LOCAL_STORAGE_KEYS } from "@/lib/theme/theme-constants";
import { useAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";

const initialConfigAtom = atomWithStorage<ThemeConfig>(
  LOCAL_STORAGE_KEYS.themeConfig,
  initialThemeConfig,
);

export function useConfig() {
  return useAtom(initialConfigAtom);
}
