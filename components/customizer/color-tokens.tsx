"use client";

import { useTokens } from "@/hooks/use-tokens";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ControlSection } from "@/components/customizer/customizer-controls";
import { TokenColorPicker } from "@/components/customizer/token-color-picker";

export function ColorTokens({ className }: React.ComponentProps<"div">) {
  return (
    <section className="h-full space-y-1.5">
      <Label className="flex items-center gap-1 pb-2">
        <Palette className="size-4" /> Color tokens
      </Label>

      <TokensList className={className} />
    </section>
  );
}

function TokensList({ className }: React.ComponentProps<"div">) {
  const {
    getColorToken,
    setPrimaryColorTokens,
    setColorToken,
    setColorTokenWithForeground,
  } = useTokens();

  return (
    <div className={cn("space-y-2", className)}>
      <ControlSection title="Base colors" id="base-colors" expanded>
        <TokenColorPicker
          colorProperty="background"
          color={getColorToken({
            property: "background",
          })}
          setColorTokens={setColorTokenWithForeground}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="foreground"
          color={getColorToken({
            property: "foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
      </ControlSection>

      <ControlSection title="Primary colors" id="primary-colors" expanded>
        <TokenColorPicker
          colorProperty="primary"
          color={getColorToken({
            property: "primary",
          })}
          setColorTokens={setPrimaryColorTokens}
        />
        <TokenColorPicker
          colorProperty="primary-foreground"
          color={getColorToken({
            property: "primary-foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
      </ControlSection>

      <ControlSection title="Secondary colors" id="secondary-colors">
        <TokenColorPicker
          colorProperty="secondary"
          color={getColorToken({
            property: "secondary",
          })}
          setColorTokens={setColorTokenWithForeground}
        />
        <TokenColorPicker
          colorProperty="secondary-foreground"
          color={getColorToken({
            property: "secondary-foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
      </ControlSection>

      <ControlSection title="Card colors" id="card-colors">
        <TokenColorPicker
          colorProperty="card"
          color={getColorToken({
            property: "card",
          })}
          setColorTokens={setColorTokenWithForeground}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="card-foreground"
          color={getColorToken({
            property: "card-foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
      </ControlSection>

      <ControlSection title="Popover colors" id="popover-colors">
        <TokenColorPicker
          colorProperty="popover"
          color={getColorToken({
            property: "popover",
          })}
          setColorTokens={setColorTokenWithForeground}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="popover-foreground"
          color={getColorToken({
            property: "popover-foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
      </ControlSection>

      <ControlSection title="Muted colors" id="muted-colors">
        <TokenColorPicker
          colorProperty="muted"
          color={getColorToken({
            property: "muted",
          })}
          setColorTokens={setColorTokenWithForeground}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="muted-foreground"
          color={getColorToken({
            property: "muted-foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
      </ControlSection>

      <ControlSection title="Accent colors" id="accent-colors">
        <TokenColorPicker
          colorProperty="accent"
          color={getColorToken({
            property: "accent",
          })}
          setColorTokens={setColorTokenWithForeground}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="accent-foreground"
          color={getColorToken({
            property: "accent-foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
      </ControlSection>

      <ControlSection title="Destructive colors" id="destructive-colors">
        <TokenColorPicker
          colorProperty="destructive"
          color={getColorToken({
            property: "destructive",
          })}
          setColorTokens={setColorTokenWithForeground}
          syncModes={false}
        />
        {getColorToken({
          property: "destructive-foreground",
        }) && (
          <TokenColorPicker
            colorProperty="destructive-foreground"
            color={getColorToken({
              property: "destructive-foreground",
            })}
            setColorTokens={setColorToken}
            syncModes={false}
          />
        )}
      </ControlSection>

      <ControlSection
        title="Border/Input/Ring colors"
        id="border-input-ring-colors"
      >
        <TokenColorPicker
          colorProperty="border"
          color={getColorToken({
            property: "border",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="input"
          color={getColorToken({
            property: "input",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="ring"
          color={getColorToken({
            property: "ring",
          })}
          setColorTokens={setColorToken}
        />
      </ControlSection>

      <ControlSection title="Chart colors" id="chart-colors">
        <TokenColorPicker
          colorProperty="chart-1"
          color={getColorToken({
            property: "chart-1",
          })}
          setColorTokens={setColorToken}
        />
        <TokenColorPicker
          colorProperty="chart-2"
          color={getColorToken({
            property: "chart-2",
          })}
          setColorTokens={setColorToken}
        />
        <TokenColorPicker
          colorProperty="chart-3"
          color={getColorToken({
            property: "chart-3",
          })}
          setColorTokens={setColorToken}
        />
        <TokenColorPicker
          colorProperty="chart-4"
          color={getColorToken({
            property: "chart-4",
          })}
          setColorTokens={setColorToken}
        />
        <TokenColorPicker
          colorProperty="chart-5"
          color={getColorToken({
            property: "chart-5",
          })}
          setColorTokens={setColorToken}
        />
      </ControlSection>

      <ControlSection title="Sidebar colors" id="sidebar-colors">
        <TokenColorPicker
          colorProperty="sidebar"
          color={getColorToken({
            property: "sidebar",
          })}
          setColorTokens={setColorTokenWithForeground}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="sidebar-foreground"
          color={getColorToken({
            property: "sidebar-foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="sidebar-primary"
          color={getColorToken({
            property: "sidebar-primary",
          })}
          setColorTokens={setColorTokenWithForeground}
        />
        <TokenColorPicker
          colorProperty="sidebar-primary-foreground"
          color={getColorToken({
            property: "sidebar-primary-foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="sidebar-accent"
          color={getColorToken({
            property: "sidebar-accent",
          })}
          setColorTokens={setColorTokenWithForeground}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="sidebar-accent-foreground"
          color={getColorToken({
            property: "sidebar-accent-foreground",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="sidebar-border"
          color={getColorToken({
            property: "sidebar-border",
          })}
          setColorTokens={setColorToken}
          syncModes={false}
        />
        <TokenColorPicker
          colorProperty="sidebar-ring"
          color={getColorToken({
            property: "sidebar-ring",
          })}
          setColorTokens={setColorToken}
        />
      </ControlSection>
    </div>
  );
}
