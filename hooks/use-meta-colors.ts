// pulled from https://github.com/shadcn-ui/ui/blob/main/apps/v4/hooks/use-meta-color.ts
import * as React from "react";
import { useTheme } from "@/lib/theme";

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

export function useMetaColor() {
  const { resolvedTheme } = useTheme();

  const metaColor = React.useMemo(() => {
    return resolvedTheme !== "dark"
      ? META_THEME_COLORS.light
      : META_THEME_COLORS.dark;
  }, [resolvedTheme]);

  const setMetaColor = React.useCallback((color: string) => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", color);
  }, []);

  return {
    metaColor,
    setMetaColor,
  };
}
