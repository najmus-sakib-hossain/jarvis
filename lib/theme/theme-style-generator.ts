import { DEFAULT_FONTS } from "@/constants/themes";
import {
  ColorFormat,
  TailwindVersion,
  ThemeConfig,
  ThemeMode,
  ThemeObject,
  ThemeProperties,
} from "@/types/theme";
import { colorFormatter } from "@/lib/theme/color-converter";
import { getShadowMap } from "@/lib/theme/shadow-generator";

function generateColorVariables(
  themeObject: ThemeObject,
  mode: ThemeMode,
  colorFormat: ColorFormat,
  tailwindVersion: TailwindVersion = "4",
): string {
  const styles = themeObject[mode] as ThemeProperties;

  const formatColor = (color: string) =>
    colorFormatter(color, colorFormat, tailwindVersion);

  const colorVars = `
  --background: ${formatColor(styles.background)};
  --foreground: ${formatColor(styles.foreground)};
  --card: ${formatColor(styles.card)};
  --card-foreground: ${formatColor(styles["card-foreground"])};
  --popover: ${formatColor(styles.popover)};
  --popover-foreground: ${formatColor(styles["popover-foreground"])};
  --primary: ${formatColor(styles.primary)};
  --primary-foreground: ${formatColor(styles["primary-foreground"])};
  --secondary: ${formatColor(styles.secondary)};
  --secondary-foreground: ${formatColor(styles["secondary-foreground"])};
  --muted: ${formatColor(styles.muted)};
  --muted-foreground: ${formatColor(styles["muted-foreground"])};
  --accent: ${formatColor(styles.accent)};
  --accent-foreground: ${formatColor(styles["accent-foreground"])};
  --destructive: ${formatColor(styles.destructive)};
  ${
    styles["destructive-foreground"] && tailwindVersion === "3"
      ? `--destructive-foreground: ${formatColor(styles["destructive-foreground"])};`
      : ``
  }
  --border: ${formatColor(styles.border)};
  --input: ${formatColor(styles.input)};
  --ring: ${formatColor(styles.ring)};
  --chart-1: ${formatColor(styles["chart-1"])};
  --chart-2: ${formatColor(styles["chart-2"])};
  --chart-3: ${formatColor(styles["chart-3"])};
  --chart-4: ${formatColor(styles["chart-4"])};
  --chart-5: ${formatColor(styles["chart-5"])};
  --sidebar: ${formatColor(styles.sidebar)};
  --sidebar-foreground: ${formatColor(styles["sidebar-foreground"])};
  --sidebar-primary: ${formatColor(styles["sidebar-primary"])};
  --sidebar-primary-foreground: ${formatColor(styles["sidebar-primary-foreground"])};
  --sidebar-accent: ${formatColor(styles["sidebar-accent"])};
  --sidebar-accent-foreground: ${formatColor(styles["sidebar-accent-foreground"])};
  --sidebar-border: ${formatColor(styles["sidebar-border"])};
  --sidebar-ring: ${formatColor(styles["sidebar-ring"])};`
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");

  return colorVars.trimStart();
}

const generateFontVariables = (themeConfig: ThemeConfig): string => {
  const fonts = themeConfig.fonts;

  const fontVars = `\n  --font-sans: ${fonts?.sans ?? DEFAULT_FONTS["font-sans"]};
  --font-serif: ${fonts?.serif ?? DEFAULT_FONTS["font-serif"]};
  --font-mono: ${fonts?.mono ?? DEFAULT_FONTS["font-mono"]};\n`;

  return fontVars;
};

const generateShadowVariables = (
  shadowMap: Record<string, string>,
  themeObject: ThemeObject,
  mode: ThemeMode,
  colorFormat: ColorFormat = "oklch",
): string => {
  const formatColor = (color: string) =>
    colorFormatter(color, colorFormat, "4");

  let shadowVars = `
  \n  --shadow-color: ${formatColor(themeObject[mode]["shadow-color"] || "#000000")};`;

  if (mode === "light") {
    shadowVars += `
  --shadow-2xs: ${shadowMap["shadow-2xs"]};
  --shadow-xs: ${shadowMap["shadow-xs"]};
  --shadow-sm: ${shadowMap["shadow-sm"]};
  --shadow: ${shadowMap["shadow"]};
  --shadow-md: ${shadowMap["shadow-md"]};
  --shadow-lg: ${shadowMap["shadow-lg"]};
  --shadow-xl: ${shadowMap["shadow-xl"]};
  --shadow-2xl: ${shadowMap["shadow-2xl"]};`;
  }

  return shadowVars;
};

function generateThemeVariables(
  themeConfig: ThemeConfig,
  mode: ThemeMode,
  colorFormat: ColorFormat = "oklch",
  tailwindVersion: TailwindVersion = "4",
  themeVarsSettings: ThemeVarsOptions,
): string {
  const radiusVar = `\n  --radius: ${themeConfig.radius};`;

  const colorVars = generateColorVariables(
    themeConfig.themeObject,
    mode,
    colorFormat,
    tailwindVersion,
  );
  const fontVars = themeVarsSettings.fontVars
    ? generateFontVariables(themeConfig)
    : ``;

  const shadowMap = getShadowMap(themeConfig.themeObject, mode, {
    varOutput: true,
  });

  const shadowVars = themeVarsSettings.shadowVars
    ? generateShadowVariables(
        shadowMap,
        themeConfig.themeObject,
        mode,
        colorFormat,
      )
    : ``;

  if (mode === "light") {
    return `:root {${fontVars}${radiusVar}\n  ${colorVars}${shadowVars}\n}`;
  }

  return `.dark {\n  ${colorVars}${shadowVars}\n}`;
}

type ThemeVarsOptions = {
  fontVars?: boolean | undefined;
  shadowVars?: boolean | undefined;
};

function generateTailwindV4ThemeInline(
  themeConfig: ThemeConfig,
  { fontVars = false, shadowVars = false }: ThemeVarsOptions,
): string {
  const colorVarsInline = `--color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);`;

  const radiusVarsInline = `--radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);`;

  // Embeds the themeConfig font vars in the @theme inline{}
  // this is where you'd do --font-sans: var(--font-custom-name) if you wanted to
  const fontVarsFromTheme = generateFontVariables(themeConfig);

  const fontVarsInline = fontVars
    ? fontVarsFromTheme
    : `\n  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);\n`;

  const shadowVarsInline = shadowVars
    ? `\n\n  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);`
    : ``;

  return `@theme inline {${fontVarsInline}
  ${radiusVarsInline}
  ${colorVarsInline}${shadowVarsInline}
}`;
}

export function generateThemeCode({
  themeConfig,
  colorFormat = "oklch",
  tailwindVersion = "4",
  tailwindInlineOptions,
}: {
  themeConfig: ThemeConfig;
  colorFormat?: ColorFormat;
  tailwindVersion?: TailwindVersion;
  tailwindInlineOptions?: ThemeVarsOptions;
}): string {
  if (
    !themeConfig ||
    !("light" in themeConfig.themeObject) ||
    !("dark" in themeConfig.themeObject)
  ) {
    throw new Error("Invalid theme styles: missing light or dark mode");
  }

  const lightTheme = generateThemeVariables(
    themeConfig,
    "light",
    colorFormat,
    tailwindVersion,
    {
      fontVars: tailwindInlineOptions?.fontVars,
      shadowVars: tailwindInlineOptions?.shadowVars,
    },
  );
  const darkTheme = generateThemeVariables(
    themeConfig,
    "dark",
    colorFormat,
    tailwindVersion,
    {
      fontVars: tailwindInlineOptions?.fontVars,
      shadowVars: tailwindInlineOptions?.shadowVars,
    },
  );

  let v4Options = {};

  if (tailwindVersion === "4" && tailwindInlineOptions) {
    v4Options = tailwindInlineOptions;
  }

  if (tailwindVersion === "4") {
    return `${lightTheme}\n\n${darkTheme}\n\n${generateTailwindV4ThemeInline(themeConfig, { ...v4Options })}`;
  }

  return `${lightTheme}\n\n${darkTheme}`;
}
