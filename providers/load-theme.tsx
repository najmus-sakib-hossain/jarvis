"use client";

import { initialThemeConfig } from "@/constants/themes";
import { LOCAL_STORAGE_KEYS } from "@/lib/theme/theme-constants";
import { monoFontsArray, sansFontsArray, serifFontsArray } from "@/constants/fonts";
import { preconnect } from "react-dom";

export function LoadTheme() {
  preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });
  preconnect("https://fonts.googleapis.com", { crossOrigin: "anonymous" });

  const loadThemeScriptContent = `(function() {
    const root = document.documentElement;

    const defaultLightStyles = ${JSON.stringify(
      initialThemeConfig.themeObject.light,
    )};
    const defaultDarkStyles = ${JSON.stringify(
      initialThemeConfig.themeObject.dark,
    )};
    const defaultRadius = ${JSON.stringify(initialThemeConfig.radius)};
    const defaultFonts = ${JSON.stringify(initialThemeConfig.fonts)};

    let themeConfig = null;
    try {
      const persistedThemeConfig = localStorage.getItem("${LOCAL_STORAGE_KEYS.themeConfig}");
      if (persistedThemeConfig) {
        const parsedThemeConfig = JSON.parse(persistedThemeConfig);
        themeConfig = parsedThemeConfig;
      }
    } catch (e) {
      console.warn(
        "Theme initialization: Failed to read/parse localStorage:",
        e,
      );
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const localStorageMode = localStorage.getItem("${LOCAL_STORAGE_KEYS.nextThemesMode}");
    let resolvedMode = localStorageMode;

    if (resolvedMode === "system" || resolvedMode === null) {
      resolvedMode = prefersDark ? "dark" : "light"
    }

    const mode = resolvedMode;

    const activeThemeObjectStyles =
      mode === "dark"
        ? themeConfig?.themeObject.dark || defaultDarkStyles
        : themeConfig?.themeObject.light || defaultLightStyles;

    const activeRadius = themeConfig?.radius || defaultRadius;

    const activeFonts = {
      sans: themeConfig?.fonts?.sans ?? defaultFonts.sans,
      serif: themeConfig?.fonts?.serif ?? defaultFonts.serif,
      mono: themeConfig?.fonts?.mono ?? defaultFonts.mono,
    };

    // Function to fetch fonts up-front for the initial load
    const loadFont = (href) => {
      if (href) {
        const link = document.createElement("link");
        link.href = href;
        link.rel = "stylesheet";
        link.precedence = "high";
        document.head.appendChild(link);
      }
    };

    const activeFontSansHref = [
      ...${JSON.stringify(sansFontsArray)},
      ...${JSON.stringify(serifFontsArray)},
      ...${JSON.stringify(monoFontsArray)}].find((font) => font.value === activeFonts.sans)?.href
    const activeFontSerifHref = ${JSON.stringify(serifFontsArray)}.find(
        (font) => font.value === activeFonts.serif,
      )?.href;
    const activeFontMonoHref = ${JSON.stringify(monoFontsArray)}.find(
        (font) => font.value === activeFonts.mono,
      )?.href;

    loadFont(activeFontSansHref);
    loadFont(activeFontSerifHref);
    loadFont(activeFontMonoHref);

    const themeProperties = {
      ...activeThemeObjectStyles,
      radius: activeRadius,
      "font-sans": activeFonts.sans,
      "font-serif": activeFonts.serif,
      "font-mono": activeFonts.mono,
    };

    let cssVars = [];
    for (const [key, value] of Object.entries(themeProperties)) {
      cssVars[\`--\${key}\`] = value;
    }

    // Set the CSS variables on the root element
    console.log("Theme initialization. CSS variables set:", cssVars);
    for (const [key, value] of Object.entries(cssVars)) {
      root.style.setProperty(key, value);
    }
  })()`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: loadThemeScriptContent }}
      suppressHydrationWarning
    />
  );
}
