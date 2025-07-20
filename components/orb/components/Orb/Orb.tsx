import React, { useMemo } from "react";
import "./styles.css";
import { SvgElements } from "@/components/orb/components/SvgElements/SvgElements";
import { colorPalettes } from "@/components/orb/palette/colorPalettes";
import {
  defaultBaseOrbSize,
  defaultBaseShapeSize,
  defaultAnimationSpeedBase,
  defaultAnimationSpeedHue,
  defaultBlobAOpacity,
  defaultBlobBOpacity,
  defaultHueRotation,
  defaultMainOrbHueAnimation,
  defaultNoShadowValue,
  defaultSize,
} from "@/components/orb/constants";
import { ReactAIOrbProps } from "@/components/orb/types";
import { cn } from "@/lib/utils";

export const Orb = ({
  className,
  palette = colorPalettes.cosmicNebula,
  size = defaultSize,
  baseOrbSize = defaultBaseOrbSize,
  baseShapeSize = defaultBaseShapeSize,
  animationSpeedBase = defaultAnimationSpeedBase,
  animationSpeedHue = defaultAnimationSpeedHue,
  hueRotation = defaultHueRotation,
  mainOrbHueAnimation = defaultMainOrbHueAnimation,
  blobAOpacity = defaultBlobAOpacity,
  blobBOpacity = defaultBlobBOpacity,
  noShadow = defaultNoShadowValue,
}: ReactAIOrbProps) => {
  const cssVariables = useMemo(
    () =>
      ({
        "--react-ai-orb-size": `${size * baseOrbSize}px`,
        "--shapes-size": `${size * baseShapeSize}px`,
        "--main-bg-start": palette.mainBgStart,
        "--main-bg-end": palette.mainBgEnd,
        "--shadow-color-1": palette.shadowColor1,
        "--shadow-color-2": palette.shadowColor2,
        "--shadow-color-3": palette.shadowColor3,
        "--shadow-color-4": palette.shadowColor4,
        "--main-shadow": noShadow
          ? "none"
          : `var(--shadow-color-1) 0px 4px 6px 0px,
             var(--shadow-color-2) 0px 5px 10px 0px,
             var(--shadow-color-3) 0px 0px 1px 0px inset,
             var(--shadow-color-4) 0px 1px 7px 0px inset`,
        "--shape-a-start": palette.shapeAStart,
        "--shape-a-end": palette.shapeAEnd,
        "--shape-b-start": palette.shapeBStart,
        "--shape-b-middle": palette.shapeBMiddle,
        "--shape-b-end": palette.shapeBEnd,
        "--shape-c-start": palette.shapeCStart,
        "--shape-c-middle": palette.shapeCMiddle,
        "--shape-c-end": palette.shapeCEnd,
        "--shape-d-start": palette.shapeDStart,
        "--shape-d-middle": palette.shapeDMiddle,
        "--shape-d-end": palette.shapeDEnd,
        "--blob-a-opacity": blobAOpacity,
        "--blob-b-opacity": blobBOpacity,
        "--animation-rotation-speed-base": `${1 / (animationSpeedBase * 0.5)}s`,
        "--animation-hue-speed-base": `${1 / (animationSpeedHue * 0.5)}s`,
        "--hue-rotation": `${hueRotation}deg`,
        "--main-hue-animation": mainOrbHueAnimation
          ? "hueShift var(--animation-hue-speed-base) linear infinite"
          : "none",
      } as React.CSSProperties),
    [
      palette,
      size,
      animationSpeedBase,
      animationSpeedHue,
      hueRotation,
      mainOrbHueAnimation,
      blobAOpacity,
      blobBOpacity,
      baseOrbSize,
      baseShapeSize,
      noShadow,
    ]
  );

  return (
    <div
      style={{
        ...cssVariables,
      }}
      className={cn(className)}
    >
      <div className="orb-main">
        <div className="glass loc-glass" />
        <div className="shape-a loc-a" />
        <div className="shape-b loc-b" />
        <div className="shape-c loc-c" />
        <div className="shape-d loc-d" />

        <SvgElements color1={palette.mainBgStart} color2={palette.mainBgEnd} />
      </div>
    </div>
  );
};

export default Orb;
