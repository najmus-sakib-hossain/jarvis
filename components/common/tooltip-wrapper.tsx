"use client";

import { cn } from "@/lib/utils";
import { useShowTooltips } from "@/trash/preferences-store";
import { ComponentProps } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function TooltipWrapper({
  label,
  className,
  children,
  ...props
}: ComponentProps<typeof TooltipTrigger> & {
  label: string;
}) {
  const showTootips = useShowTooltips();

  return (
    <Tooltip delayDuration={500} key={label} defaultOpen={false}>
      <TooltipTrigger className={cn(className)} {...props}>
        {children}
      </TooltipTrigger>

      {showTootips && (
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
