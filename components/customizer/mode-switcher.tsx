"use client";

import { META_THEME_COLORS, useMetaColor } from "@/hooks/use-meta-colors";
import { Check, Monitor, Moon, MoonIcon, Sun, SunIcon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function ModeSwitcher({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const { setMetaColor } = useMetaColor();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    setMetaColor(
      resolvedTheme === "dark"
        ? META_THEME_COLORS.light
        : META_THEME_COLORS.dark,
    );
  }, [resolvedTheme, setTheme, setMetaColor]);

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className={className}
          {...props}
        >
          <SunIcon className="hidden size-4 [html.dark_&]:block" />
          <MoonIcon className="hidden size-4 [html.light_&]:block" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => setTheme("light")}>
          <Sun /> Light {theme === "light" && <Check className="ml-auto" />}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setTheme("dark")}>
          <Moon />
          Dark
          {theme === "dark" && <Check className="ml-auto" />}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setTheme("system")}>
          <Monitor /> System
          {theme === "system" && <Check className="ml-auto" />}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
