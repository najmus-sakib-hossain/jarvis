"use client";

import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import { ModeSwitcher } from "@/components/customizer/mode-switcher";
import { TooltipWrapper } from "@/components/common/tooltip-wrapper";
import { Separator } from "@/components/ui/separator";
import { ContrastChecker } from "@/components/customizer/contrast-checker";
import { CopyCodeButtonDialog } from "@/components/customizer/copy-code-button-dialog";
// import { CopyThemeCLI } from "@/components/customizer/copy-theme-cli";
import { CustomizerSettings } from "@/components/customizer/customizer-settings";
import { ResetButton } from "@/components/customizer/reset-button";

interface ActionButtonsProps extends ComponentProps<"section"> {
  className?: string;
}

export function ActionButtons({ className }: ActionButtonsProps) {
  return (
    <div
      className={cn(
        "@container flex min-h-0 w-full flex-wrap items-center justify-between gap-2 border p-1 rounded-md mb-4",
        className,
      )}
    >
      {/* <section className="flex grow items-center gap-2">
        <TooltipWrapper label="View generated code" asChild>
          <CopyCodeButtonDialog
            size="sm"
            className="flex-2"
            variant="default"
          />
        </TooltipWrapper>
        <TooltipWrapper label="View shadcn CLI registry command" asChild>
          <CopyThemeCLI size="sm" variant="outline" className="flex-1" />
        </TooltipWrapper>
      </section>

      <Separator
        orientation="vertical"
        className="hidden min-h-6 @xl:inline-flex"
      /> */}
      <section className="flex items-center justify-between gap-2 @max-[375px]:w-full">
        <TooltipWrapper label="Options to reset tokens" asChild>
          <ResetButton size="sm" variant="ghost" />
        </TooltipWrapper>

        <div className="@md:hidden">
          <TooltipWrapper label="Toggle light/dark" asChild>
            <ModeSwitcher />
          </TooltipWrapper>
        </div>

        <TooltipWrapper label="Check contrast ratio" asChild>
          <ContrastChecker />
        </TooltipWrapper>

        {/* TODO: Import CSS variables button */}
        {/* <TooltipWrapper label="Bring your CSS variables" asChild>
          <Button size="sm" variant="ghost" disabled>
            <FileCode2 />
            <span className="hidden @xl:inline-flex">Import</span>
            <span className="sr-only">Import CSS variables</span>
          </Button>
        </TooltipWrapper> */}

        {/* <TooltipWrapper label="Configure the customizer" asChild>
          <CustomizerSettings variant="ghost" />
        </TooltipWrapper> */}
      </section>
    </div>
  );
}
