"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { ColorFormat } from "@/types/theme";
import { colorFormatter } from "@/lib/theme/color-converter";
import { Check, Clipboard } from "lucide-react";
import { ComponentProps } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function Color({
  color,
  isActive,
  className,
  onClick,
  ...props
}: { color: string; isActive?: boolean } & ComponentProps<typeof Button>) {
  const isMounted = useMounted();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const handleCopyColor = (colorFormat: ColorFormat) => {
    const formatedColor = colorFormatter(color, colorFormat, "4");
    copyToClipboard(formatedColor);
    toast.success(`${formatedColor} copied to clipboard!`);
  };

  if (!isMounted) {
    return (
      <Button
        variant={"ghost"}
        className={cn("size-fit cursor-pointer rounded-lg p-0.5")}
      >
        <Skeleton
          className={cn(
            "bg-muted ring-border relative flex size-3.5 shrink-0 items-center justify-center overflow-hidden rounded-lg ring",
          )}
        />
      </Button>
    );
  }

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <Button
          variant={"ghost"}
          className={cn(
            "size-fit cursor-pointer rounded-lg p-0.5",
            className,
            isActive &&
              "text-foreground border-primary/50 ring-primary/50 ring-[2px]",
          )}
          style={{ "--primary": color }}
          onClick={onClick}
          {...props}
        >
          <span
            className={cn(
              "bg-primary ring-foreground/20 relative flex size-3.5 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-xs ring",
            )}
          />
        </Button>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem
          className="hover:bg-accent flex items-center justify-between transition"
          onClick={() => handleCopyColor("oklch")}
        >
          oklch
          <>
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
          </>
        </ContextMenuItem>
        <ContextMenuItem
          className="hover:bg-accent flex items-center justify-between transition"
          onClick={() => handleCopyColor("hsl")}
        >
          hsl
          <>
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
          </>
        </ContextMenuItem>
        <ContextMenuItem
          className="hover:bg-accent flex items-center justify-between transition"
          onClick={() => handleCopyColor("rgb")}
        >
          rgb
          <>
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
          </>
        </ContextMenuItem>
        <ContextMenuItem
          className="hover:bg-accent flex items-center justify-between transition"
          onClick={() => handleCopyColor("hex")}
        >
          hex
          <>
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
          </>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
