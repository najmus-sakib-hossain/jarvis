import { ThemeConfig, ThemeProperties } from "@/types/theme";
import { basePresetsV4 } from "@/constants/colors";
import { otherPresets } from "@/constants/presets";

export function getCssVarsFromThemeObject(
  themeProperties: Partial<ThemeProperties>,
) {
  const cssVars = {} as Record<string, string>;

  for (const [key, value] of Object.entries(themeProperties)) {
    cssVars[`--${key}`] = value;
  }

  return cssVars;
}

export const DEFAULT_RADIUS = "0.5rem"; // 10px
// export const DEFAULT_RADIUS = "0.625rem"; // 10px

export const DEFAULT_SURFACE = "default";

// from  @node_modules/tailwindcss/theme.css
export const DEFAULT_FONTS = {
  "font-sans": `ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji'`,
  "font-serif": `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
  "font-mono": `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace`,
};

// from  @node_modules/tailwindcss/theme.css
// --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
export const DEFAULT_SHADOWS = {
  "shadow-color": "hsl(0 0% 0%)",
  "shadow-opacity": "0.18",
  "shadow-blur": "2px",
  "shadow-spread": "0px",
  "shadow-offset-x": "0px",
  "shadow-offset-y": "1px"
};
// export const DEFAULT_SHADOWS = {
//   "shadow-color": `hsl(0 0% 0%)`, // Base color from rgb(0 0 0 / 0.1)
//   "shadow-opacity": `0.1`, // Opacity from rgb(0 0 0 / 0.1)
//   "shadow-blur": `3px`, // Blur radius
//   "shadow-spread": `0px`, // Spread radius
//   "shadow-offset-x": `0`, // X offset
//   "shadow-offset-y": `1px`, // Y offset
// };

// export const initialThemeConfig: ThemeConfig = {
//   radius: DEFAULT_RADIUS,
//   surface: DEFAULT_SURFACE,
//   fonts: {
//     sans: basePresetsV4.neutral.fonts?.sans || DEFAULT_FONTS["font-sans"],
//     serif: basePresetsV4.neutral.fonts?.serif || DEFAULT_FONTS["font-serif"],
//     mono: basePresetsV4.neutral.fonts?.mono || DEFAULT_FONTS["font-mono"],
//   },
//   themeObject: {
//     ...basePresetsV4.neutral,
//     light: {
//       ...basePresetsV4.neutral.light,
//       ...DEFAULT_SHADOWS,
//     },
//     dark: {
//       ...basePresetsV4.neutral.dark,
//       "shadow-color": DEFAULT_SHADOWS["shadow-color"],
//     },
//   },
// };

export const initialThemeConfig: ThemeConfig = {
  radius: DEFAULT_RADIUS,
  surface: DEFAULT_SURFACE,
  fonts: {
    sans: otherPresets.vercel.fonts?.sans || DEFAULT_FONTS["font-sans"],
    serif: otherPresets.vercel.fonts?.serif || DEFAULT_FONTS["font-serif"],
    mono: otherPresets.vercel.fonts?.mono || DEFAULT_FONTS["font-mono"],
  },
  themeObject: {
    ...otherPresets.vercel,
    light: {
      ...otherPresets.vercel.light,
      ...DEFAULT_SHADOWS,
    },
    dark: {
      ...otherPresets.vercel.dark,
      "shadow-color": DEFAULT_SHADOWS["shadow-color"],
    },
  },
};
