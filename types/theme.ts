export type ThemeMode = "light" | "dark";

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export type TailwindVersion = "3" | "4";

export type RemValue = `${number}rem`; // For rem values, i.e. "0.625rem"

export type OklchValue =
  | `oklch(${number} ${number} ${number})` // For oklch values without an alpha channel, i.e., 'oklch(0.145 0 0)'
  | `oklch(${number} ${number} ${number} / ${number}%)` // For oklch values with with the alpha channel in %, i.e., 'oklch(1 0 0 / 15%)'
  | `oklch(${number} ${number} ${number} / ${number})`; // For oklch values with with the alpha channel in decimal, i.e., 'oklch(1 0 0 / 0.15)'

export type ColorProperties = {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground"?: string;
  border: string;
  input: string;
  ring: string;
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
  sidebar: string;
  "sidebar-foreground": string;
  "sidebar-primary": string;
  "sidebar-primary-foreground": string;
  "sidebar-accent": string;
  "sidebar-accent-foreground": string;
  "sidebar-border": string;
  "sidebar-ring": OklchValue | string;
  "shadow-color"?: string;
};

export type ThemeProperties = {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground"?: string;
  border: string;
  input: string;
  ring: string;
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
  sidebar: string;
  "sidebar-foreground": string;
  "sidebar-primary": string;
  "sidebar-primary-foreground": string;
  "sidebar-accent": string;
  "sidebar-accent-foreground": string;
  "sidebar-border": string;
  "sidebar-ring": string;
  "font-sans"?: string;
  "font-serif"?: string;
  "font-mono"?: string;
  radius?: string | RemValue;
  "shadow-color"?: string;
  "shadow-opacity"?: string;
  "shadow-blur"?: string;
  "shadow-spread"?: string;
  "shadow-offset-x"?: string;
  "shadow-offset-y"?: string;
  spacing?: string;
  "letter-spacing"?: string;
};
export type ThemeProperty = keyof ThemeProperties;

export type Fonts = {
  sans?: string;
  serif?: string;
  mono?: string;
};

export type ColorProperty = keyof ColorProperties;

export type PresetV4 = "stone" | "zinc" | "neutral" | "gray" | "slate";

export type ColorfulPreset =
  | "red"
  | "rose"
  | "orange"
  | "green"
  | "blue"
  | "yellow"
  | "violet";

export type OtherPresets =
  | "modern-minimal"
  | "t3-chat"
  | "twitter"
  | "mocha-mousse"
  | "bubblegum"
  | "doom-64"
  | "catppuccin"
  | "graphite"
  | "perpetuity"
  | "kodama-grove"
  | "cosmic-night"
  | "tangerine"
  | "quantum-rose"
  | "nature"
  | "bold-tech"
  | "elegant-luxury"
  | "amber-minimal"
  | "supabase"
  | "neo-brutalism"
  | "solar-dusk"
  | "claymorphism"
  | "cyberpunk"
  | "pastel-dreams"
  | "clean-slate"
  | "caffeine"
  | "ocean-breeze"
  | "retro-arcade"
  | "midnight-bloom"
  | "candyland"
  | "northern-lights"
  | "vintage-paper"
  | "sunset-horizon"
  | "starry-night"
  | "claude"
  | "vercel"
  | "mono"
  | "notebook"
  | "amethyst-haze"
  | "ghibli-studio"
  | (string & {});

export type Preset = PresetV4 | ColorfulPreset | OtherPresets | (string & {});

export type ThemeObject = {
  name: Preset;
  label: string;
  radius?: string;
  fonts?: Fonts;
  light: Partial<ThemeProperties>;
  dark: Partial<ThemeProperties>;
};

export type ThemeConfig = {
  radius: RemValue | string;
  surface?: SurfaceShadesPreset;
  fonts?: Fonts;
  themeObject: ThemeObject;
};

// Surface shades
export type SurfaceShadesPreset =
  | "neutro"
  | "grayish"
  | "boring"
  | (string & {});

export type SurfaceShadesThemeObject = {
  name: SurfaceShadesPreset;
  label: string;
  light: SurfaceShades;
  dark: SurfaceShades;
};

export type SurfaceShades = {
  background: OklchValue | string;
  foreground: OklchValue | string;

  card: OklchValue | string;
  "card-foreground": OklchValue | string;
  popover: OklchValue | string;
  "popover-foreground": OklchValue | string;

  muted: OklchValue | string;
  "muted-foreground": OklchValue | string;

  accent: OklchValue | string;
  "accent-foreground": OklchValue | string;

  border: OklchValue | string;
  input: OklchValue | string;

  sidebar: OklchValue | string;
  "sidebar-foreground": OklchValue | string;

  "sidebar-accent": OklchValue | string;
  "sidebar-accent-foreground": OklchValue | string;

  "sidebar-border": OklchValue | string;
};
