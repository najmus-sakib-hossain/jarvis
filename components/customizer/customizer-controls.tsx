"use client";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useMounted } from "@/hooks/use-mounted";
import { useSurfaceShades } from "@/hooks/use-surface-shades";
import { useThemeConfig } from "@/hooks/use-theme-config";
import { useTokens } from "@/hooks/use-tokens";
import {
  basePresetsV4Array,
  colorfulPresetsArray,
  surfaceShadesPresetArray,
  surfaceShadesPresets,
} from "@/constants/colors";
import { otherPresetsArray } from "@/constants/presets";
import { cn } from "@/lib/utils";
import {
  ColorProperty,
  SurfaceShades,
  SurfaceShadesPreset,
  ThemeMode,
  ThemeProperties,
} from "@/types/theme";
import { getOptimalForegroundColor, isValidColor } from "@/lib/theme/color-utils";
import { RADIUS_VALUES } from "@/lib/theme/theme-constants";
import { Check, ChevronDown, ChevronDownIcon, ChevronUp, SendHorizontal } from "lucide-react";
import { useTheme } from "@/lib/theme";
import {
  ChangeEvent,
  ComponentProps,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Color } from "@/components/customizer/color";
import { TokenColorPicker } from "@/components/customizer/token-color-picker";

const PLACEHOLDERS = [
  "oklch(0.685 0.169 237.323)",
  "hsl(199.18 100% 47.843%)",
  "rgb(0, 166, 244)",
  "#00a6f4",
];

export function PasteColorControl({
  className,
  property,
  setColorTokens,
  modesInSync,
  ...props
}: {
  setColorTokens: (obj: {
    property: ColorProperty;
    color: string;
    modesInSync?: boolean;
  }) => void;
  property: ColorProperty;
  modesInSync: boolean;
} & ComponentProps<"div">) {
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [pastedColor, setPastedColor] = useState("");
  const isValidPastedColor = isValidColor(pastedColor);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) => {
        const index = PLACEHOLDERS.indexOf(prev);
        return PLACEHOLDERS[(index + 1) % PLACEHOLDERS.length];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmitColorPaste = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pastedColor === "") return;

    const normalizedColor = pastedColor.trim().toLowerCase();

    const allowedStartWith = ["oklch", "hsl", "rgb", "#"];
    const colorStartsWithAnyAllowed = allowedStartWith.some((c) =>
      normalizedColor.startsWith(c),
    );

    if (!colorStartsWithAnyAllowed || !isValidPastedColor) {
      toast.error("Invalid color format.");
      return;
    }

    setColorTokens({
      color: normalizedColor,
      property: property,
      modesInSync: modesInSync,
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim().toLowerCase();
    setPastedColor(value);
  };

  return (
    <div className={cn("rounded-lg shadow", className)} {...props}>
      <form
        className="relative flex items-center"
        onSubmit={handleSubmitColorPaste}
      >
        <Input
          type="text"
          id="pasted-color"
          onChange={handleInputChange}
          className={cn(
            "border-border relative h-10 bg-transparent px-0 py-2 pr-10 pl-2 font-mono lowercase shadow outline transition dark:bg-transparent",
            !isValidColor && "outline-destructive",
          )}
          placeholder={placeholder}
          value={pastedColor}
        />
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute right-2 size-6 rounded-lg transition",
            isValidPastedColor ? "text-(--pasted-color)" : "",
          )}
          style={{
            "--pasted-color": isValidPastedColor ? pastedColor : "",
            "--pasted-color-foreground": isValidPastedColor
              ? getOptimalForegroundColor(pastedColor)
              : "",
          }}
        >
          <SendHorizontal className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function SurfaceShadesControl({ className }: ComponentProps<"div">) {
  const { setSurfaceShadesColorTokens, getActiveSurfaceShades } = useTokens();
  const { currentSurfacePreset } = useThemeConfig();

  const isMounted = useMounted();
  const resolvedTheme = useTheme().resolvedTheme as ThemeMode;

  const setSelectedBackgroundShadePreset = (preset: SurfaceShadesPreset) => {
    const bgShadesThemeObject = surfaceShadesPresets[preset];
    setSurfaceShadesColorTokens({ bgShadesThemeObject, modesInSync: true });
  };

  const {
    getDefaultSurfaceShades,
    getInvertedSurfaceShades,
    getPlainSurfaceShades,
  } = useSurfaceShades();

  const currentPresetShadesArray = [
    getDefaultSurfaceShades(),
    getInvertedSurfaceShades(),
    getPlainSurfaceShades(),
  ];

  return (
    <Command className={cn(className)}>
      {isMounted && (
        <>
          <CommandEmpty>No surface shades found.</CommandEmpty>

          <CommandGroup heading="Current preset">
            {currentPresetShadesArray.map((bgShadesThemeObject) => {
              const properties = bgShadesThemeObject[resolvedTheme];
              const { name, label } = bgShadesThemeObject;
              const isActive = name === currentSurfacePreset;

              return (
                <CommandItem
                  key={bgShadesThemeObject.name}
                  onSelect={() =>
                    setSurfaceShadesColorTokens({
                      bgShadesThemeObject: bgShadesThemeObject,
                      modesInSync: true,
                    })
                  }
                  className="flex items-center gap-2 py-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="pointer-events-none flex">
                      <SurfaceColorTokens properties={properties} />
                    </div>
                    <span className="min-w-18 text-sm">{label}</span>
                  </div>

                  <Check
                    className={cn(
                      "ml-auto size-4 shrink-0 transition",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Neutralize">
            {surfaceShadesPresetArray.map((bgShadesThemeObject) => {
              const properties = bgShadesThemeObject[resolvedTheme];
              const { name, label } = bgShadesThemeObject;
              const isActive = name === currentSurfacePreset;
              return (
                <CommandItem
                  key={bgShadesThemeObject.name}
                  onSelect={() => setSelectedBackgroundShadePreset(name)}
                  className="flex items-center gap-2 py-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="pointer-events-none flex">
                      <SurfaceColorTokens properties={properties} />
                    </div>
                    <span className="min-w-18 text-sm">{label}</span>
                  </div>

                  <Check
                    className={cn(
                      "ml-auto size-4 shrink-0 transition",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </>
      )}
    </Command>
  );
}

function SurfaceColorTokens({ properties }: { properties: SurfaceShades }) {
  return (
    <>
      <Color color={properties["background"]} className="pointer-events-none" />
      <Color color={properties["foreground"]} className="pointer-events-none" />
      <Color color={properties["card"]} className="pointer-events-none" />
      <Color color={properties["popover"]} className="pointer-events-none" />
      <Color color={properties["muted"]} className="pointer-events-none" />
      <Color color={properties["accent"]} className="pointer-events-none" />
      <Color color={properties["border"]} className="pointer-events-none" />
      <Color color={properties["sidebar"]} className="pointer-events-none" />
    </>
  );
}

export function RadiusControls({ className, ...props }: ComponentProps<"div">) {
  const { currentRadius, setConfig } = useThemeConfig();
  const isMounted = useMounted();

  return (
    <div className={cn("text-muted-foreground", className)} {...props}>
      {RADIUS_VALUES.map((value) => {
        const isActive = currentRadius === value;
        const valueWithoutRem = value.replace("rem", "");

        if (!isMounted) {
          return (
            <Button
              variant={"ghost"}
              size="sm"
              key={value}
              className={cn(
                "ring-border h-fit cursor-pointer rounded-lg p-1 text-xs shadow ring",
                "w-full max-w-[75px] pr-1.5 @max-md:max-w-full",
              )}
              style={{
                "--radius": `${value}`,
              }}
            >
              <span className="hidden @lg:inline-flex">{value}</span>
              <span className="inline-flex @lg:hidden">{valueWithoutRem}</span>
            </Button>
          );
        }

        return (
          <Button
            variant={"ghost"}
            size="sm"
            key={value}
            onClick={() => {
              setConfig((prev) => {
                return {
                  ...prev,
                  radius: value,
                };
              });
            }}
            className={cn(
              "ring-border h-fit cursor-pointer rounded-lg p-1 text-xs shadow ring",
              "w-full max-w-[75px] pr-1.5 @max-md:max-w-full",
              isActive &&
              "text-foreground border-primary/50 ring-primary/50 ring-[2px]",
            )}
            style={{
              "--radius": `${value}`,
            }}
          >
            <span className="hidden @lg:inline-flex">{value}</span>
            <span className="inline-flex @lg:hidden">{valueWithoutRem}</span>
          </Button>
        );
      })}
    </div>
  );
}

export function RadiusSliderControl() {
  const { currentRadius, setConfig } = useThemeConfig();
  const currentRadiusValue = Number.parseFloat(
    currentRadius.replace("rem", ""),
  );

  const handleChange = useDebouncedCallback((v: number) => {
    setConfig((prev) => ({ ...prev, radius: `${v}rem` }));
  }, 100);

  return (
    <SliderWithInput
      value={currentRadiusValue}
      label="--radius"
      unit="rem"
      max={2}
      min={0}
      step={0.025}
      onValueChange={handleChange}
      className="font-mono"
    />
  );
}

interface AllPresetsControlProps extends ComponentProps<"div"> { }

export function AllPresetsControl({ className }: AllPresetsControlProps) {
  const { getActiveThemeColorToken } = useTokens();
  const { currentThemeObject, updateThemeConfig } = useThemeConfig();

  const isMounted = useMounted();
  const resolvedTheme = useTheme().resolvedTheme as ThemeMode;
  const activePresetName = currentThemeObject.name;

  const baseShadcnPresets = basePresetsV4Array;
  const colorShadcnPresets = colorfulPresetsArray;
  const otherPresets = otherPresetsArray;

  const allPresets = [
    ...otherPresets,
    ...baseShadcnPresets,
    ...colorShadcnPresets,
  ];

  const activeThemeInArray = allPresets.find(
    (p) => p.name === activePresetName,
  );

  return (
    <Popover>
      <PopoverTrigger asChild className="rounded-lg border shadow">
        <div className="group/control bg-background hover:bg-muted/40 flex h-10 w-full cursor-pointer items-center justify-between gap-4 p-2.5 transition-colors duration-300 ease-in-out *:shrink-0">
          <div className="flex items-center gap-2">
            {activeThemeInArray ? (
              <div className="flex">
                <Color
                  color={
                    isMounted
                      ? getActiveThemeColorToken({
                        property: "primary",
                        mode: resolvedTheme,
                      })
                      : ""
                  }
                  className="pointer-events-none"
                />
                <Color
                  color={
                    isMounted
                      ? getActiveThemeColorToken({
                        property: "background",
                        mode: resolvedTheme,
                      })
                      : ""
                  }
                  className="pointer-events-none"
                />
                <Color
                  color={
                    isMounted
                      ? getActiveThemeColorToken({
                        property: "secondary",
                        mode: resolvedTheme,
                      })
                      : ""
                  }
                  className="pointer-events-none"
                />
                <Color
                  color={
                    isMounted
                      ? getActiveThemeColorToken({
                        property: "muted",
                        mode: resolvedTheme,
                      })
                      : ""
                  }
                  className="pointer-events-none"
                />
                <Color
                  color={
                    isMounted
                      ? getActiveThemeColorToken({
                        property: "card",
                        mode: resolvedTheme,
                      })
                      : ""
                  }
                  className="pointer-events-none"
                />
              </div>
            ) : null}

            <h3
              className={cn(
                "group-hover/control:text-foreground text-muted-foreground text-sm font-medium",
                activeThemeInArray && "text-foreground",
              )}
            >
              {!isMounted ? (
                <Skeleton className="h-4 w-full" />
              ) : activeThemeInArray ? (
                activeThemeInArray.label
              ) : (
                "Select a preset"
              )}
            </h3>
          </div>
          <button
            type="button"
            className="text-muted-foreground group-hover/control:text-foreground transition-colors"
            aria-label="Expand section"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </PopoverTrigger>

      <PopoverContent className="p-0 z-[10000000000000000000000000]">
        <Command className={cn(className)}>
          <CommandInput placeholder="Search Themes" className="text-base" />


          <ScrollArea className="flex max-h-81 flex-col">
            <CommandEmpty>
              <span className="text-muted-foreground">
                No theme presets found.
              </span>
            </CommandEmpty>
            {isMounted && (
              <>
                <CommandGroup heading="Community">
                  {otherPresets.map((presetThemeObject) => {
                    const properties = presetThemeObject[resolvedTheme];
                    const { name, label } = presetThemeObject;
                    const isActive = name === activePresetName;
                    return (
                      <CommandItem
                        key={presetThemeObject.name}
                        onSelect={() => updateThemeConfig(presetThemeObject)}
                        className="flex items-center gap-4 py-2"
                      >
                        <ThemePresetColors
                          label={label}
                          properties={properties}
                        />

                        <Check
                          className={cn(
                            "ml-auto size-4 shrink-0 transition",
                            isActive ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Shadcn/ui base">
                  {baseShadcnPresets.map((presetThemeObject) => {
                    const properties = presetThemeObject[resolvedTheme];
                    const { name, label } = presetThemeObject;
                    const isActive = name === activePresetName;
                    return (
                      <CommandItem
                        key={presetThemeObject.name}
                        onSelect={() => updateThemeConfig(presetThemeObject)}
                        className="flex items-center gap-4 py-2"
                      >
                        <ThemePresetColors
                          label={label}
                          properties={properties}
                        />

                        <Check
                          className={cn(
                            "ml-auto size-4 shrink-0 transition",
                            isActive ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />
                
                <CommandGroup heading="Shadcn/ui color">
                  {colorShadcnPresets.map((presetThemeObject) => {
                    const properties = presetThemeObject[resolvedTheme];
                    const { name, label } = presetThemeObject;
                    const isActive = name === activePresetName;
                    return (
                      <CommandItem
                        key={presetThemeObject.name}
                        onSelect={() => updateThemeConfig(presetThemeObject)}
                        className="flex items-center gap-4 py-2"
                      >
                        <ThemePresetColors
                          label={label}
                          properties={properties}
                        />

                        <Check
                          className={cn(
                            "ml-auto size-4 shrink-0 transition",
                            isActive ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ThemePresetColors({
  properties,
  label,
}: {
  properties: Partial<ThemeProperties>;
  label: ColorProperty | (string & {});
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="pointer-events-none flex">
        <Color color={properties["primary"]!} className="pointer-events-none" />
        <Color
          color={properties["background"]!}
          className="pointer-events-none"
        />
        <Color
          color={properties["secondary"]!}
          className="pointer-events-none"
        />
        <Color color={properties["muted"]!} className="pointer-events-none" />
        <Color color={properties["card"]!} className="pointer-events-none" />
      </div>
      <span>{label}</span>
    </div>
  );
}

// Building blocks
export function ControlSection({
  id,
  title,
  expanded = false,
  className,
  children,
}: {
  title: string;
  expanded?: boolean;
  id?: string;
} & ComponentProps<"div">) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  return (
    <div
      id={id}
      className={cn("overflow-hidden rounded-lg border shadow", className)}
    >
      <div
        className={cn(
          "group/control bg-background hover:bg-muted/40 flex h-10 w-full shrink-0 cursor-pointer items-center justify-between gap-4 border-b p-2.5 transition-colors duration-300 ease-in-out",
          isExpanded ? "border-border" : "border-transparent",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3
          className={cn(
            "group-hover/control:text-foreground text-muted-foreground text-sm font-medium",
            isExpanded && "text-foreground",
          )}
        >
          {title}
        </h3>
        <button
          type="button"
          className="text-muted-foreground group-hover/control:text-foreground transition-colors"
          aria-label={isExpanded ? "Collapse section" : "Expand section"}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="bg-background overflow-hidden">
          <div className={cn("space-y-2 p-2.5", className)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ControlsSkeleton({ className }: ComponentProps<"div">) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-1">
        <Skeleton className="bg-muted size-4" />
        <Skeleton className="bg-muted h-4 w-24" />
      </div>
      <Skeleton className={cn("bg-muted h-48", className)} />
    </div>
  );
}

export function ShadowsControl() {
  const { getToken, setToken, setColorToken } = useTokens();

  const shadowColor = getToken({
    property: "shadow-color",
  });
  const shadowOpacity = parseFloat(getToken({ property: "shadow-opacity" }));
  const shadowBlur = parseFloat(
    getToken({ property: "shadow-blur" }).replace("px", ""),
  );
  const shadowSpread = parseFloat(
    getToken({ property: "shadow-spread" }).replace("px", ""),
  );
  const shadowOffsetX = parseFloat(
    getToken({ property: "shadow-offset-x" }).replace("px", ""),
  );
  const shadowOffsetY = parseFloat(
    getToken({ property: "shadow-offset-y" }).replace("px", ""),
  );

  return (
    <div className="space-y-4 font-mono">
      <div>
        <TokenColorPicker
          colorProperty="shadow-color"
          color={shadowColor}
          setColorTokens={setColorToken}
          syncModes={false}
        />
      </div>

      <div>
        <SliderWithInput
          value={shadowOpacity}
          onValueChange={(value) =>
            setToken({
              property: "shadow-opacity",
              value: `${value}`,
              modesInSync: true,
            })
          }
          min={0}
          max={1}
          step={0.01}
          unit=""
          label="--shadow-opacity"
        />
      </div>

      <div>
        <SliderWithInput
          value={shadowBlur}
          onValueChange={(value) =>
            setToken({
              property: "shadow-blur",
              value: `${value}px`,
              modesInSync: true,
            })
          }
          min={0}
          max={50}
          step={0.5}
          unit="px"
          label="--shadow-blur"
        />
      </div>

      <div>
        <SliderWithInput
          value={shadowSpread}
          onValueChange={(value) =>
            setToken({
              property: "shadow-spread",
              value: `${value}px`,
              modesInSync: true,
            })
          }
          min={-50}
          max={50}
          step={0.5}
          unit="px"
          label="--shadow-spread"
        />
      </div>

      <div>
        <SliderWithInput
          value={shadowOffsetX}
          onValueChange={(value) =>
            setToken({
              property: "shadow-offset-x",
              value: `${value}px`,
              modesInSync: true,
            })
          }
          min={-50}
          max={50}
          step={0.5}
          unit="px"
          label="--shadow-offset-x"
        />
      </div>

      <div>
        <SliderWithInput
          value={shadowOffsetY}
          onValueChange={(value) =>
            setToken({
              property: "shadow-offset-y",
              value: `${value}px`,
              modesInSync: true,
            })
          }
          min={-50}
          max={50}
          step={0.5}
          unit="px"
          label="--shadow-offset-y"
        />
      </div>
    </div>
  );
}

interface SliderWithInputProps extends ComponentProps<"div"> {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
}

function SliderWithInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  label,
  unit = "px",
  className,
  ...props
}: SliderWithInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (localValue !== value) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <div className={cn("space-y-2 pb-2", className)} {...props}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={`slider-${label.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-xs font-medium"
        >
          {label}
        </Label>
        <div className="flex items-center gap-1">
          <Input
            id={`input-${label.replace(/\s+/g, "-").toLowerCase()}`}
            type="number"
            value={localValue}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setLocalValue(newValue);
              onValueChange(newValue);
            }}
            min={min}
            max={max}
            step={step}
            className="h-6 w-18 px-2 pr-0 text-xs"
          />
          <span className="text-muted-foreground text-xs">{unit}</span>
        </div>
      </div>
      <Slider
        id={`slider-${label.replace(/\s+/g, "-").toLowerCase()}`}
        value={[localValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values) => {
          setLocalValue(values[0]);
          onValueChange(values[0]);
        }}
        className="py-1"
      />
    </div>
  );
}
