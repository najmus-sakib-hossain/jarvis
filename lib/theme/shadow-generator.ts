import { initialThemeConfig } from "@/constants/themes";
import {
  ThemeMode,
  ThemeObject,
  ThemeProperties,
  ThemeProperty,
} from "@/types/theme";
import { colorFormatter } from "@/lib/theme/color-converter";
import { setStyleProperty } from "@/lib/utils";

export function getShadowProperty(
  themeObject: ThemeObject,
  property: ThemeProperty,
  mode: ThemeMode,
) {
  return (
    themeObject[mode][property] ||
    themeObject.light[property] ||
    initialThemeConfig.themeObject[mode][property] ||
    initialThemeConfig.themeObject.light[property]
  );
}

export function getShadowMap(
  themeObject: ThemeObject,
  mode: ThemeMode,
  { varOutput } = { varOutput: false },
) {
  const styles: Partial<ThemeProperties> = {
    ...initialThemeConfig.themeObject[mode],
    ...themeObject[mode],
    "shadow-color": getShadowProperty(themeObject, "shadow-color", mode),
    "shadow-opacity": getShadowProperty(themeObject, "shadow-opacity", mode),
    "shadow-blur": getShadowProperty(themeObject, "shadow-blur", mode),
    "shadow-spread": getShadowProperty(themeObject, "shadow-spread", mode),
    "shadow-offset-x": getShadowProperty(themeObject, "shadow-offset-x", mode),
    "shadow-offset-y": getShadowProperty(themeObject, "shadow-offset-y", mode),
  };

  const shadowColor = styles["shadow-color"];
  const hsl = colorFormatter(shadowColor!, "hsl", "3");
  const offsetX = styles["shadow-offset-x"];
  const offsetY = styles["shadow-offset-y"];
  const blur = styles["shadow-blur"];
  const spread = styles["shadow-spread"];
  const opacity = parseFloat(styles["shadow-opacity"]!);

  const colorConvertedToHsl = (opacityMultiplier: number) => {
    // This is the default implementation, where the color gets embedded in the shadow
    // as an HSL value with the opacity applied.
    return `hsl(${hsl} / ${opacity * opacityMultiplier})`;
  };

  const colorVarWithOpacity = (opacityMultiplier: number) => {
    // This is the implementation for varOutput, where the color is set as a CSS variable
    // and the opacity is applied to the variable.
    // the shadow var looks like => 1px 2px 0px 0px rgb(from var(--shadow-color) r g b / 1)
    return `rgb(from var(--shadow-color) r g b / ${opacity * opacityMultiplier})`;
  };

  const color = varOutput ? colorVarWithOpacity : colorConvertedToHsl;

  const secondLayer = (fixedOffsetY: string, fixedBlur: string): string => {
    const offsetX2 = offsetX; // Use the same offsetX as the first layer
    const offsetY2 = fixedOffsetY; // Use the fixed offsetY specific to the shadow size
    const blur2 = fixedBlur; // Use the fixed blur specific to the shadow size
    // Calculate spread relative to the first layer's spread variable
    const spread2 =
      (parseFloat(spread?.replace("px", "") ?? "0") - 1).toString() + "px";
    // Use the same color function (opacity can still be overridden by --shadow-opacity)
    const color2 = color(1.0); // Default opacity for second layer is 0.1 in examples

    return `${offsetX2} ${offsetY2} ${blur2} ${spread2} ${color2}`;
  };

  // Map shadow names to their CSS variable string structures
  const shadowMap: { [key: string]: string } = {
    // Single layer shadows - use base variables directly
    "shadow-2xs": `${offsetX} ${offsetY} ${blur} ${spread} ${color(0.5)}`, // Assumes vars set appropriately (e.g., y=1, blur=0, spread=0)
    "shadow-xs": `${offsetX} ${offsetY} ${blur} ${spread} ${color(0.5)}`, // Assumes vars set appropriately (e.g., y=1, blur=2, spread=0)
    "shadow-2xl": `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}`, // Assumes vars set appropriately (e.g., y=25, blur=50, spread=-12)

    // Two layer shadows - use base vars for layer 1, mix fixed/calculated for layer 2
    "shadow-sm": `${offsetX} ${offsetY} ${blur} ${spread} ${color(
      1.0,
    )}, ${secondLayer("1px", "2px")}`,
    shadow: `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer(
      "1px",
      "2px",
    )}`, // Alias for the 'shadow:' example line

    "shadow-md": `${offsetX} ${offsetY} ${blur} ${spread} ${color(
      1.0,
    )}, ${secondLayer("2px", "4px")}`,

    "shadow-lg": `${offsetX} ${offsetY} ${blur} ${spread} ${color(
      1.0,
    )}, ${secondLayer("4px", "6px")}`,

    "shadow-xl": `${offsetX} ${offsetY} ${blur} ${spread} ${color(
      1.0,
    )}, ${secondLayer("8px", "10px")}`,
  };

  return shadowMap;
}

// Function to set shadow CSS variables
export function setShadowVariables(
  element: HTMLElement,
  themeObject: ThemeObject,
  mode: ThemeMode,
) {
  // I'll leave the 'varOutput' set to true for now. In case this brings issues to
  // browser compatibility, we can always change it to false o remove the 3rd argument.
  // for it to work as it did before.
  const shadows = getShadowMap(themeObject, mode, { varOutput: true });
  Object.entries(shadows).forEach(([name, value]) => {
    setStyleProperty({ element, key: `--${name}`, value });
  });
}
