"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { useColorFormat } from "@/trash/preferences-store";
import { ColorProperty } from "@/types/theme";
import { colorFormatter } from "@/lib/theme/color-converter";
import { Check, Clipboard } from "lucide-react";
import { ComponentProps } from "react";

export function Token({
  colorProperty,
  color,
}: {
  colorProperty: ColorProperty;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <TokenDisplay color={color} />
      <TokenInfo colorProperty={colorProperty} color={color} />
    </div>
  );
}

export function TokenDisplay({
  color,
  className,
}: ComponentProps<"div"> & { color: string }) {
  return (
    <div
      className={cn("aspect-square size-8 rounded-lg border shadow", className)}
      style={{
        backgroundColor: color,
      }}
    />
  );
}

export function TokenInfo({
  colorProperty,
  color,
}: {
  colorProperty: ColorProperty;
  color: string;
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const colorFormat = useColorFormat();
  const colorValue = colorFormatter(color, colorFormat, "4");

  const handleCopyColor = () => {
    copyToClipboard(colorValue);
  };

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div>
        <p className="font-mono text-xs font-semibold">
          {`--${colorProperty}`}
        </p>
        <p className="text-muted-foreground font-mono text-xs">{colorValue}</p>
      </div>

      <button
        className="hover:bg-foreground/10 ml-auto cursor-pointer rounded-lg p-1 transition"
        onClick={handleCopyColor}
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
      </button>
    </div>
  );
}
