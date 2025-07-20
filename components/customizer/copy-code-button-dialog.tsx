"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useThemeConfig } from "@/hooks/use-theme-config";
import { cn } from "@/lib/utils";
import {
  useColorFormat,
  useFontVars,
  usePreferencesActions,
  useShadowVars,
  useTailwindVersion,
} from "@/trash/preferences-store";
import { TailwindVersion } from "@/types/theme";
import { generateThemeCode } from "@/lib/theme/theme-style-generator";
import { Check, Clipboard, Code, Terminal } from "lucide-react";
import React, { useMemo } from "react";
import { TooltipWrapper } from "@/components/common/tooltip-wrapper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// import { CopyThemeCLI } from "@/components/customizer/copy-theme-cli";

export function CopyCodeButtonDialog({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <>
      {/* A Drawer trigger for smaller screens */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            className={cn("flex cursor-pointer md:hidden", className)}
            {...props}
          >
            <Code className="text-primary-foreground" />
            Copy
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="leading-none font-semibold tracking-tight">
              Generated theme
            </DrawerTitle>

            <DrawerDescription className="text-muted-foreground text-xs">
              Copy and paste the following code into your CSS file.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-4">
            <Alert className="bg-muted">
              <Terminal className="h-4 w-4" />
              <AlertDescription>
                You can apply your custom theme styles with a command. Or do it
                manually for more control.
              </AlertDescription>
            </Alert>
            <GeneratedCodeOptions />
          </div>

          <CustomizerCode className="max-h-[375px] sm:max-h-[450px]" />
        </DrawerContent>
      </Drawer>

      {/* A Dialog trigger for larger screens */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className={cn("hidden cursor-pointer md:flex", className)}
            {...props}
          >
            <Code className="text-primary-foreground" />
            Copy code
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-background min-h-[400px] space-y-2 overflow-hidden rounded-lg outline-none sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="leading-none font-semibold tracking-tight">
              Generated theme
            </DialogTitle>

            <DialogDescription className="text-muted-foreground text-xs">
              Copy and paste the following code into your CSS file.
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-muted">
            <Terminal className="h-4 w-4" />
            <AlertDescription>
              You can apply your custom theme styles with a command. Or do it
              manually for more control.
            </AlertDescription>
          </Alert>

          <GeneratedCodeOptions />

          <CustomizerCode />
        </DialogContent>
      </Dialog>
    </>
  );
}

function GeneratedCodeOptions() {
  const colorFormat = useColorFormat();
  const tailwindVersion = useTailwindVersion();
  const showFontVars = useFontVars();
  const showShadowVars = useShadowVars();

  const {
    setColorFormat,
    setTailwindVersion,
    setShowFontVars,
    setShowShadowsVars,
  } = usePreferencesActions();

  const changeTailwindVersion = (tailwindVersion: TailwindVersion) => {
    setTailwindVersion(tailwindVersion);

    if (tailwindVersion === "4") setColorFormat("oklch");
    else if (tailwindVersion === "3") setColorFormat("hsl");
  };

  return (
    <div className="flex flex-wrap items-baseline-last gap-x-4 gap-y-2">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <Label className="text-muted-foreground text-xs">Color format</Label>
          <ToggleGroup
            className="border shadow-sm"
            type="single"
            value={colorFormat}
            onValueChange={setColorFormat}
          >
            <ToggleGroupItem
              value="oklch"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              oklch
            </ToggleGroupItem>

            <ToggleGroupItem
              value="hsl"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              hsl
            </ToggleGroupItem>

            <ToggleGroupItem
              value="rgb"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              rgb
            </ToggleGroupItem>

            <ToggleGroupItem
              value="hex"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              hex
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex flex-col items-start gap-1">
          <Label className="text-muted-foreground text-xs">Tailwind</Label>
          <ToggleGroup
            className="border shadow-sm"
            type="single"
            value={tailwindVersion}
            onValueChange={changeTailwindVersion}
          >
            <ToggleGroupItem
              value="4"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              v4
            </ToggleGroupItem>

            <ToggleGroupItem
              value="3"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              v3
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <Label className="text-muted-foreground text-xs">Font vars</Label>
          <ToggleGroup
            className="border shadow-sm"
            type="single"
            value={showFontVars ? "on" : "off"}
            onValueChange={(v) => setShowFontVars(v === "on")}
          >
            <ToggleGroupItem
              value="on"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              on
            </ToggleGroupItem>

            <ToggleGroupItem
              value="off"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              off
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col items-start gap-1">
          <Label className="text-muted-foreground text-xs">Shadow vars</Label>
          <ToggleGroup
            className="border shadow-sm"
            type="single"
            value={showShadowVars ? "on" : "off"}
            onValueChange={(v) => setShowShadowsVars(v === "on")}
          >
            <ToggleGroupItem
              value="on"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              on
            </ToggleGroupItem>

            <ToggleGroupItem
              value="off"
              className="h-fit px-3 py-1.5 text-xs md:text-sm"
            >
              off
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <TooltipWrapper label="View shadcn CLI registry command" asChild>
        {/* <CopyThemeCLI size="sm" variant="outline" className="grow" /> */}
      </TooltipWrapper>
    </div>
  );
}

function CustomizerCode({ className }: React.ComponentProps<"div">) {
  const { config } = useThemeConfig();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const colorFormat = useColorFormat();
  const tailwindVersion = useTailwindVersion();
  const showFontVars = useFontVars();
  const showShadowsVars = useShadowVars();

  const themeCode = useMemo(
    () =>
      generateThemeCode({
        themeConfig: config,
        colorFormat,
        tailwindVersion,
        tailwindInlineOptions: {
          fontVars: showFontVars,
          shadowVars: showShadowsVars,
        },
      }),
    [config, colorFormat, tailwindVersion, showFontVars, showShadowsVars],
  );

  const handleCopyThemeStylesCode = () => {
    copyToClipboard(themeCode);
  };

  return (
    <div
      className={cn(
        "bg-card relative h-[450px] w-full overflow-hidden rounded-lg border",
        className,
      )}
    >
      <ScrollArea className="h-full">
        <pre className="p-4">
          <code className="relative border border-none p-0 font-mono text-xs md:text-sm">
            {themeCode}
          </code>
          <ScrollBar orientation="horizontal" />
        </pre>
      </ScrollArea>

      {/* Copy code button */}
      <div className="absolute top-3 right-3 isolate">
        <div className="relative overflow-hidden rounded-lg p-[2px]">
          <div className="from-primary to-secondary via-muted absolute inset-0 size-full bg-linear-45 opacity-40" />
          <Button
            size="sm"
            variant={"ghost"}
            onClick={handleCopyThemeStylesCode}
            className="bg-muted/80 relative isolate flex cursor-pointer items-center justify-start overflow-hidden"
          >
            <Clipboard
              className={cn(
                "size-4 transition duration-200",
                isCopied ? "absolute scale-0" : "scale-100",
              )}
            />
            <Check
              className={cn(
                "size-4 transition duration-200",
                !isCopied ? "absolute scale-0" : "scale-100",
              )}
            />
            Copy code
          </Button>
        </div>
      </div>
    </div>
  );
}
