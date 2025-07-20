import { Label } from "@/components/ui/label";
import { useThemeConfig } from "@/hooks/use-theme-config";
import { cn } from "@/lib/utils";
import { monoFontsArray, sansFontsArray, serifFontsArray } from "@/constants/fonts";
import { Check, Ligature } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ControlSection } from "@/components/customizer/customizer-controls";

export function Typography({ className }: React.ComponentProps<"div">) {
  const { setConfig, currentFonts } = useThemeConfig();

  return (
    <section className={cn("space-y-1.5", className)}>
      <Label className="flex items-center gap-1 pb-2">
        <Ligature className="size-4" /> Typography
      </Label>

      <ControlSection title="Sans font" id="sans-font" className="p-0" expanded>
        <Command className={cn("bg-background", className)}>
          <CommandInput className="text-base" />

          <ScrollArea className="flex max-h-72 flex-col">
            <CommandEmpty>
              <span className="text-muted-foreground">No fonts found.</span>
            </CommandEmpty>
            <CommandGroup className="font-sans" heading="Sans fonts">
              {sansFontsArray.map((font) => {
                const isActive = font.value === currentFonts?.sans;
                return (
                  <CommandItem
                    key={font.key}
                    onSelect={() =>
                      setConfig((prev) => {
                        return {
                          ...prev,
                          fonts: {
                            ...prev.fonts,
                            sans: font.value,
                          },
                        };
                      })
                    }
                    className="group/item flex items-center gap-4 py-2 font-sans"
                    style={{ "--font-sans": font.value }}
                  >
                    <span className="text-nowrap">{font.key}</span>
                    <span
                      className={cn(
                        "text-muted-foreground/80 line-clamp-1 text-xs opacity-0 transition",
                        "group-hover/item:opacity-100",
                      )}
                    >
                      This is just sample text
                    </span>
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

            <CommandGroup className="w-full font-serif" heading="Serif fonts">
              {serifFontsArray.map((font) => {
                const isActive = font.value === currentFonts?.sans;
                return (
                  <CommandItem
                    key={font.key}
                    onSelect={() =>
                      setConfig((prev) => {
                        return {
                          ...prev,
                          fonts: {
                            ...prev.fonts,
                            sans: font.value,
                          },
                        };
                      })
                    }
                    className="group/item flex items-center gap-4 py-2 font-sans"
                    style={{ "--font-sans": font.value }}
                  >
                    <span className="text-nowrap">{font.key}</span>
                    <span
                      className={cn(
                        "text-muted-foreground/80 line-clamp-1 text-xs opacity-0 transition",
                        "group-hover/item:opacity-100",
                      )}
                    >
                      This is just sample text
                    </span>
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

            <CommandGroup className="font-mono" heading="Mono fonts">
              {monoFontsArray.map((font) => {
                const isActive = font.value === currentFonts?.sans;
                return (
                  <CommandItem
                    key={font.key}
                    onSelect={() =>
                      setConfig((prev) => {
                        return {
                          ...prev,
                          fonts: {
                            ...prev.fonts,
                            sans: font.value,
                          },
                        };
                      })
                    }
                    className="group/item flex items-center gap-4 py-2 font-mono"
                    style={{ "--font-mono": font.value }}
                  >
                    <span className="text-nowrap">{font.key}</span>
                    <span
                      className={cn(
                        "text-muted-foreground/80 line-clamp-1 text-xs opacity-0 transition",
                        "group-hover/item:opacity-100",
                      )}
                    >
                      let sampleText = "Hello!";
                    </span>
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
          </ScrollArea>
        </Command>
      </ControlSection>

      <ControlSection
        title="Serif font"
        id="serif-font"
        className="p-0 font-serif"
      >
        <Command className={cn("bg-background", className)}>
          <CommandInput className="text-base" />

          <ScrollArea className="flex max-h-47 flex-col">
            <CommandEmpty>
              <span className="text-muted-foreground">No fonts found.</span>
            </CommandEmpty>
            <CommandGroup>
              {serifFontsArray.map((font) => {
                const isActive = font.value === currentFonts?.serif;
                return (
                  <CommandItem
                    key={font.key}
                    onSelect={() =>
                      setConfig((prev) => {
                        return {
                          ...prev,
                          fonts: {
                            ...prev.fonts,
                            serif: font.value,
                          },
                        };
                      })
                    }
                    className="group/item flex items-center gap-4 py-2 font-serif"
                    style={{ "--font-serif": font.value }}
                  >
                    <span className="text-nowrap">{font.key}</span>
                    <span
                      className={cn(
                        "text-muted-foreground/80 line-clamp-1 text-xs opacity-0 transition",
                        "group-hover/item:opacity-100",
                      )}
                    >
                      This is just sample text
                    </span>
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
          </ScrollArea>
        </Command>
      </ControlSection>

      <ControlSection
        title="Mono font"
        id="mono-font"
        className="p-0 font-mono"
      >
        <Command className={cn("bg-background", className)}>
          <CommandInput className="text-base" />

          <ScrollArea className="flex max-h-47 flex-col">
            <CommandEmpty>
              <span className="text-muted-foreground">No fonts found.</span>
            </CommandEmpty>
            <CommandGroup>
              {monoFontsArray.map((font) => {
                const isActive = font.value === currentFonts?.mono;
                return (
                  <CommandItem
                    key={font.key}
                    onSelect={() =>
                      setConfig((prev) => {
                        return {
                          ...prev,
                          fonts: {
                            ...prev.fonts,
                            mono: font.value,
                          },
                        };
                      })
                    }
                    className="group/item relative flex w-full items-center gap-4 py-2 font-mono"
                    style={{ "--font-mono": font.value }}
                  >
                    <span className="text-nowrap">{font.key}</span>
                    <span
                      className={cn(
                        "text-muted-foreground/80 line-clamp-1 text-xs opacity-0 transition",
                        "group-hover/item:opacity-100",
                      )}
                    >
                      echo "hello world"
                    </span>
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
          </ScrollArea>
        </Command>
      </ControlSection>
    </section>
  );
}
