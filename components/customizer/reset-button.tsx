"use client";

import { useThemeConfig } from "@/hooks/use-theme-config";
import { cn } from "@/lib/utils";
import { RotateCcw, Undo } from "lucide-react";
import { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ResetButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const {
    resetToDefault,
    resetToLatestThemePreset,
    hasDefaultThemeChanged,
    hasCurrentPresetChanged,
  } = useThemeConfig();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("", className)} {...props}>
          <RotateCcw />
          <span className="hidden @xl:inline-flex">Reset</span>
          <span className="sr-only">Reset</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit" align="start">
        <DropdownMenuItem
          className={cn(hasDefaultThemeChanged() && "cursor-pointer")}
          onClick={resetToDefault}
          disabled={!hasDefaultThemeChanged()}
        >
          <RotateCcw />
          To default
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(hasCurrentPresetChanged() && "cursor-pointer")}
          onClick={resetToLatestThemePreset}
          disabled={!hasCurrentPresetChanged()}
        >
          <Undo />
          To latest preset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
