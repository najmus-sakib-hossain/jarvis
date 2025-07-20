export type OrbPalette = {
  mainBgStart: string;
  mainBgEnd: string;
  shadowColor1: string;
  shadowColor2: string;
  shadowColor3: string;
  shadowColor4: string;
  shapeAStart: string;
  shapeAEnd: string;
  shapeBStart: string;
  shapeBMiddle: string;
  shapeBEnd: string;
  shapeCStart: string;
  shapeCMiddle: string;
  shapeCEnd: string;
  shapeDStart: string;
  shapeDMiddle: string;
  shapeDEnd: string;
};

export type PaletteNames =
  | "cosmicNebula"
  | "caribean"
  | "galaxy"
  | "oceanDepths"
  | "emerald"
  | "cherryBlossom"
  | "goldenGlow"
  | "volcanic";

export type OrbPalettes = {
  [K in PaletteNames]: OrbPalette;
};

export type ReactAIOrbProps = {
  palette?: OrbPalette;
  baseOrbSize?: number;
  baseShapeSize?: number;
  size?: number;
  animationSpeedBase?: number;
  animationSpeedHue?: number;
  hueRotation?: number;
  mainOrbHueAnimation?: boolean;
  blobAOpacity?: number;
  blobBOpacity?: number;
  noShadow?: boolean;
  className?: string;
};
