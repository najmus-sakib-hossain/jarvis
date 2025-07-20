"use client";

import { useMounted } from "@/hooks/use-mounted";
import { useTokens } from "@/hooks/use-tokens";
import { TAILWIND_SHADES, TailwindShadeKey } from "@/constants/palettes";
import { useModesInSync } from "@/trash/preferences-store";
import {
  ClipboardPaste,
  Paintbrush,
  PaintBucket,
  SquareRoundCorner,
  Palette, // Added Palette icon
} from "lucide-react";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AllPresetsControl,
  PasteColorControl,
  RadiusControls,
} from "@/components/customizer/customizer-controls";
import { MemoizedTailwindV4ColorPalette } from "@/components/customizer/tailwind-v4-palette";
// import { GradientPicker } from "@/components/customizer/gradient-picker"; // Import GradientPicker
// import { PREDEFINED_GRADIENTS } from "@/lib/gradient-palettes"; // Import gradients
import React from "react"; // Import React

export function QuickCustomizer() {
  const [shade, setShade] = useState<TailwindShadeKey>("500");
  // const [selectedGradient, setSelectedGradient] = useState<string>(
  //   PREDEFINED_GRADIENTS.length > 0 ? PREDEFINED_GRADIENTS[0].id : ""
  // );
  const isMounted = useMounted();

  const { getColorToken, setPrimaryColorTokens } = useTokens();
  const modesInSync = useModesInSync();

  // useEffect(() => {
  //   if (!selectedGradient) {
  //     // Optionally, clear the --primary variable or set a default solid color
  //     // document.documentElement.style.removeProperty("--primary"); 
  //     return;
  //   }

  //   const predefined = PREDEFINED_GRADIENTS.find(g => g.id === selectedGradient);
  //   if (predefined) {
  //     document.documentElement.style.setProperty("--primary", predefined.css);
  //   } else if (selectedGradient.startsWith("linear-gradient") || selectedGradient.startsWith("radial-gradient") || selectedGradient.startsWith("conic-gradient")) {
  //     document.documentElement.style.setProperty("--primary", selectedGradient);
  //   } else {
  //     // Fallback or error for unknown selectedGradient value
  //     // console.warn("Unknown gradient value:", selectedGradient);
  //     // Optionally set a default solid color if the value is unrecognized
  //     // document.documentElement.style.setProperty("--primary", "oklch(0.205 0 0)"); // Example fallback
  //   }
  // }, [selectedGradient]);

  return (
    <div className="space-y-4">
      <div className="@container flex flex-wrap items-start gap-x-6 gap-y-4 sm:flex-row">
        <section className="max-w-80 min-w-72 flex-1 space-y-1.5 max-sm:w-full max-sm:max-w-full">
          <Label className="flex items-center gap-1 pb-2">
            <PaintBucket className="size-4" /> Theme presets
          </Label>
          <AllPresetsControl />
          <span className="text-muted-foreground truncate text-xs">
            {`Complete theme presets`}
          </span>
        </section>

        {/* Paste your primary color */}
        <section className="max-w-66 min-w-62 space-y-1.5 max-sm:w-full max-sm:max-w-full sm:flex-1">
          <Label className="flex items-center gap-1 pb-2">
            <ClipboardPaste className="size-4" /> Paste your primary color
          </Label>
          <PasteColorControl
            setColorTokens={setPrimaryColorTokens}
            modesInSync={modesInSync}
            property={"primary"}
          />
          <span className="text-muted-foreground text-xs">
            {`oklch(), hsl(), rbg() and #hex`}
          </span>
        </section>

        {/* Primary color */}
        <section className="max-w-80 min-w-72 flex-2 space-y-1.5 max-sm:w-full max-sm:max-w-full">
          <div className="flex items-start justify-between gap-2 pb-1">
            <Label className="flex items-center gap-1">
              <Paintbrush className="size-4" /> Primary color
            </Label>
            <Label className="text-muted-foreground flex gap-1">
              Shade
              <Select
                value={shade}
                onValueChange={(v: TailwindShadeKey) => setShade(v)}
              >
                <SelectTrigger
                  size="sm"
                  className="data-[size=sm]:h-5 data-[size=sm]:px-2 data-[size=sm]:text-xs"
                >
                  {isMounted ? (
                    <SelectValue defaultValue={shade} />
                  ) : (
                    <Skeleton className="h-[1ch] w-[3ch]" />
                  )}
                </SelectTrigger>
                <SelectContent className="w-fit min-w-0">
                  <SelectGroup>
                    <SelectLabel>Shade</SelectLabel>
                    {TAILWIND_SHADES.map((shade) => (
                      <SelectItem value={shade} key={shade}>
                        {shade}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          </div>
          <div className="grid grid-cols-11 gap-1.5">
            <MemoizedTailwindV4ColorPalette
              currentColor={getColorToken({
                property: "primary",
              })}
              shade={shade}
              className="contents"
              modesInSync={modesInSync}
            />
          </div>
          <span className="text-muted-foreground truncate text-xs">
            Tailwind v4 color palette
          </span>
        </section>

        {/* Primary gradient colors */}
        {/* <section className="w-full flex-2 space-y-1.5 max-sm:w-full max-sm:max-w-full">
          <div className="flex items-center justify-between gap-2 pb-1">
            <Label className="flex items-center gap-1">
              <Palette className="size-4" /> Gradient colors
            </Label>
            <GradientPicker
              value={selectedGradient}
              onValueChange={setSelectedGradient}
            />
          </div>
          <div className="grid grid-cols-11 gap-1.5">
            {PREDEFINED_GRADIENTS.map((gradient) => (
              <button
                key={gradient.id}
                className={`h-4 w-4 rounded-full ${selectedGradient === gradient.id && 'ring-2'}`}
                style={{ background: gradient.css }}
                onClick={() => setSelectedGradient(gradient.id)}
                title={gradient.name}
              />
            ))}
          </div>
        </section> */}

        {/* Radius */}
        <section className="min-w-62 space-y-1.5 max-sm:w-full max-sm:max-w-full sm:flex-1">
          <Label className="flex items-center gap-1 pb-2">
            <SquareRoundCorner className="size-4" /> Radius
          </Label>
          <RadiusControls className="flex flex-wrap gap-2 @max-lg:[&>*]:flex-1" />
        </section>
      </div>
    </div>
  );
}

