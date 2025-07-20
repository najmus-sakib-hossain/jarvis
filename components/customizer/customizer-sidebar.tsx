"use client";
import { useLocaleStore } from "@/trash/locale";
import { i18n } from "@/lib/i18n/i18n-config";
import { cn, lt } from "@/lib/utils";
import { FileSliders, LanguagesIcon, LetterText, Menu, PaintBucket, Palette, PanelLeftDashed, SlidersHorizontal, SwatchBook, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActionButtons } from "@/components/customizer/action-buttons";
import { ColorTokens } from "@/components/customizer/color-tokens";
import { ComingSoon } from "@/components/customizer/coming-soon";
import {
  AllPresetsControl,
  ControlSection,
  ControlsSkeleton,
  RadiusSliderControl,
  ShadowsControl,
  SurfaceShadesControl,
} from "@/components/customizer/customizer-controls";


import { Typography } from "@/components/customizer/typography";
import Link from "next/link"
import {
  AudioWaveform,
  Blocks,
  BookOpen,
  Bot,
  Calendar,
  CircleSlash2,
  Ellipsis,
  Frame,
  GalleryVerticalEnd,
  Gift,
  Heart,
  Home,
  Info,
  LibraryBig,
  Map,
  MessageCircleQuestion,
  PanelRight,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from "lucide-react"
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { History } from "@/components/layout/sidebar/history"
import { TeamSwitcher } from "@/components/layout/sidebar/team-switcher"
import { useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Banner } from "@/components/layout/banner"
import { usePathname } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { useState } from "react";
import { NavDesktopActions, NavMobileActions } from "../layout/header/nav-actions";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";

const languageNames: Record<string, string> = {
  ab: "abkhaz",
  ace: "acehnese",
  ach: "acholi",
  aa: "afar",
  af: "afrikaans",
  sq: "albanian",
  aaz: "alur",
  am: "amharic",
  ar: "arabic",
  hy: "armenian",
  as: "assamese",
  av: "avar",
  awa: "awadhi",
  ay: "aymara",
  az: "azerbaijani",
  ban: "balinese",
  bal: "baluchi",
  bm: "bambara",
  bci: "baoulé",
  ba: "bashkir",
  eu: "basque",
  btx: "batak karo",
  bts: "batak simalungun",
  bbc: "batak toba",
  be: "belarusian",
  bem: "bemba",
  bn: "bengali",
  bew: "betawi",
  bho: "bhojpuri",
  bik: "bikol",
  bs: "bosnian",
  br: "breton",
  bg: "bulgarian",
  bua: "buryat",
  yue: "cantonese",
  ca: "catalan",
  ceb: "cebuano",
  ch: "chamorro",
  ce: "chechen",
  ny: "chichewa",
  "zh-cn": "chinese (simplified)",
  "zh-tw": "chinese (traditional)",
  chk: "chuukese",
  cv: "chuvash",
  co: "corsican",
  "crh-cyrl": "crimean tatar (cyrillic)",
  "crh-latn": "crimean tatar (latin)",
  hr: "croatian",
  cs: "czech",
  da: "danish",
  prs: "dari",
  dv: "dhivehi",
  din: "dinka",
  doi: "dogri",
  dov: "dombe",
  nl: "dutch",
  dyu: "dyula",
  dz: "dzongkha",
  en: "english",
  eo: "esperanto",
  et: "estonian",
  ee: "ewe",
  fo: "faroese",
  fj: "fijian",
  fil: "filipino",
  fi: "finnish",
  fon: "fon",
  fr: "french",
  "fr-ca": "french (canada)",
  fy: "frisian",
  fur: "friulian",
  ff: "fulani",
  gaa: "ga",
  gl: "galician",
  ka: "georgian",
  de: "german",
  el: "greek",
  gn: "guarani",
  gu: "gujarati",
  ht: "haitian creole",
  cnh: "hakha chin",
  ha: "hausa",
  haw: "hawaiian",
  he: "hebrew",
  hil: "hiligaynon",
  hi: "hindi",
  hmn: "hmong",
  hu: "hungarian",
  hrx: "hunsrik",
  iba: "iban",
  is: "icelandic",
  ig: "igbo",
  ilo: "ilocano",
  id: "indonesian",
  "iu-latn": "inuktut (latin)",
  iu: "inuktut (syllabics)",
  ga: "irish",
  it: "italian",
  jam: "jamaican patois",
  ja: "japanese",
  jv: "javanese",
  kac: "jingpo",
  kl: "kalaallisut",
  kn: "kannada",
  kr: "kanuri",
  pam: "kapampangan",
  kk: "kazakh",
  kha: "khasi",
  km: "khmer",
  cgg: "kiga",
  kg: "kikongo",
  rw: "kinyarwanda",
  ktu: "kituba",
  trp: "kokborok",
  kv: "komi",
  gom: "konkani",
  ko: "korean",
  kri: "krio",
  ku: "kurdish (kurmanji)",
  ckb: "kurdish (sorani)",
  ky: "kyrgyz",
  lo: "lao",
  ltg: "latgalian",
  la: "latin",
  lv: "latvian",
  lij: "ligurian",
  li: "limburgish",
  ln: "lingala",
  lt: "lithuanian",
  lmo: "lombard",
  lg: "luganda",
  luo: "luo",
  lb: "luxembourgish",
  mk: "macedonian",
  mad: "madurese",
  mai: "maithili",
  mak: "makassar",
  mg: "malagasy",
  ms: "malay",
  "ms-arab": "malay (jawi)",
  ml: "malayalam",
  mt: "maltese",
  mam: "mam",
  gv: "manx",
  mi: "maori",
  mr: "marathi",
  mh: "marshallese",
  mwr: "marwadi",
  mfe: "mauritian creole",
  mhr: "meadow mari",
  mni: "meiteilon (manipuri)",
  min: "minang",
  lus: "mizo",
  mn: "mongolian",
  my: "myanmar (burmese)",
  nhe: "nahuatl (eastern huasteca)",
  ndc: "ndau",
  nr: "ndebele (south)",
  new: "nepalbhasa (newari)",
  ne: "nepali",
  nqo: "nko",
  no: "norwegian",
  nus: "nuer",
  oc: "occitan",
  or: "odia (oriya)",
  om: "oromo",
  os: "ossetian",
  pag: "pangasinan",
  pap: "papiamento",
  ps: "pashto",
  fa: "persian",
  pl: "polish",
  "pt-br": "portuguese (brazil)",
  "pt-pt": "portuguese (portugal)",
  "pa-guru": "punjabi (gurmukhi)",
  "pa-arab": "punjabi (shahmukhi)",
  qu: "quechua",
  kek: "qʼeqchiʼ",
  rom: "romani",
  ro: "romanian",
  rn: "rundi",
  ru: "russian",
  se: "sami (north)",
  sm: "samoan",
  sg: "sango",
  sa: "sanskrit",
  "sat-latn": "santali (latin)",
  sat: "santali (ol chiki)",
  gd: "scots gaelic",
  nso: "sepedi",
  sr: "serbian",
  st: "sesotho",
  crs: "seychellois creole",
  shn: "shan",
  sn: "shona",
  scn: "sicilian",
  szl: "silesian",
  sd: "sindhi",
  si: "sinhala",
  sk: "slovak",
  sl: "slovenian",
  so: "somali",
  es: "spanish",
  su: "sundanese",
  sus: "susu",
  sw: "swahili",
  ss: "swati",
  sv: "swedish",
  ty: "tahitian",
  tg: "tajik",
  zgh: "tamazight",
  "zgh-tfng": "tamazight (tifinagh)",
  ta: "tamil",
  tt: "tatar",
  te: "telugu",
  tet: "tetum",
  th: "thai",
  bo: "tibetan",
  ti: "tigrinya",
  tiv: "tiv",
  tpi: "tok pisin",
  to: "tongan",
  lua: "tshiluba",
  ts: "tsonga",
  tn: "tswana",
  tcy: "tulu",
  tum: "tumbuka",
  tr: "turkish",
  tk: "turkmen",
  tyv: "tuvan",
  ak: "twi",
  udm: "udmurt",
  uk: "ukrainian",
  ur: "urdu",
  ug: "uyghur",
  uz: "uzbek",
  ve: "venda",
  vec: "venetian",
  vi: "vietnamese",
  war: "waray",
  cy: "welsh",
  wo: "wolof",
  xh: "xhosa",
  sah: "yakut",
  yi: "yiddish",
  yo: "yoruba",
  yua: "yucatec maya",
  zap: "zapotec",
  zu: "zulu",
};

export function CustomizerSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { locale, setLocale } = useLocaleStore();
  const [mounted, setMounted] = useState(false);
  const { open, toggleSidebar, openMobile, state } = useSidebar();
  const currentLanguageName = languageNames[locale] || locale.toUpperCase();

  return (
    <Sidebar collapsible="icon" className="overflow-hidden" {...props}>
      <Tabs
        defaultValue="sidebar"
        className="flex flex-1 flex-col gap-0 overflow-hidden"
      >
        <SidebarHeader>
          <TeamSwitcher />
          <NavDesktopActions />
        </SidebarHeader>

        <SidebarContent className="@container relative my-0 max-h-svh pt-2 pb-0 group-data-[collapsible=icon]:invisible [&>button]:hidden">
          <ScrollArea className="flex flex-col overflow-hidden">
            <TabsContent
              value="sidebar"
              className="mx-1 mb-2 flex flex-col space-y-4"
            >
              <NavMobileActions />
            </TabsContent>

            <TabsContent
              value="languages"
              className="mx-2.5 mb-2 gap-4"
            >
              <Command className="bg-background">
                <CommandInput className="!h-14" placeholder={lt("search-languages", "Search Languages")} />
                <CommandList className="min-h-[80vh] lg:min-h-[71.5vh]">
                  <CommandEmpty>No language found.</CommandEmpty>
                  <CommandGroup>
                    {i18n.locales.map((lang) => (
                      <CommandItem
                        key={lang}
                        value={`${lang} ${languageNames[lang] || lang}`}
                        onSelect={() => setLocale(lang)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            locale === lang ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-1 items-center justify-between">
                          <span>{languageNames[lang].charAt(0).toUpperCase() + languageNames[lang].slice(1) || ""}</span>
                          <span className="text-xs text-muted-foreground">
                            {lang.toUpperCase()}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </TabsContent>

            <TabsContent
              value="palette"
              className="mx-2.5 mb-2 flex flex-col space-y-4"
            >
              <section className="flex-1 space-y-1.5 max-sm:w-full max-sm:max-w-full">
                <ActionButtons />
                <Label className="flex items-center gap-1 pb-2">
                  <PaintBucket className="size-4" /> Theme presets
                </Label>
                <AllPresetsControl />
              </section>
              <ColorTokens />
            </TabsContent>

            <TabsContent value="tokens" className="mx-2.5 mb-2">
              <section className="space-y-1.5">
                <Label className="flex items-center gap-1 pb-2">
                  <SlidersHorizontal className="size-4" /> Other tokens
                </Label>

                <ControlSection title="Surface" expanded className="p-0">
                  <SurfaceShadesControl className="bg-transparent" />
                  <div className="text-muted-foreground mb-3 truncate px-3 text-xs">
                    For background, card, popover, muted, accent...
                  </div>
                </ControlSection>

                <ControlSection title="Radius" expanded>
                  <RadiusSliderControl />
                </ControlSection>

                <ControlSection title="Shadows">
                  <ShadowsControl />
                </ControlSection>

                <ControlSection title="Spacing">
                  <ComingSoon />
                </ControlSection>

              </section>
            </TabsContent>

            <TabsContent value="typography" className="mx-2.5 mb-2">
              <Typography />
            </TabsContent>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="px-2">
          {state === "expanded" ? (
            <>
              <Banner title={lt("info-title", "Info")} message={lt("info-description", "Friday is still in beta so it can make mistakes.")} />
              <TabsList className="w-full p-1">
                <TabsTrigger value="sidebar">
                  <PanelLeftDashed />
                </TabsTrigger>
                <TabsTrigger value="languages">
                  <LanguagesIcon />
                </TabsTrigger>
                <TabsTrigger value="palette">
                  <SwatchBook />
                </TabsTrigger>
                <TabsTrigger value="tokens">
                  <FileSliders />
                </TabsTrigger>
                <TabsTrigger value="typography">
                  <LetterText />
                </TabsTrigger>
              </TabsList>
            </>
          ) : (
            <>
              <div className="inline md:hidden">
                <TabsList className="w-full p-1">
                  <TabsTrigger value="sidebar">
                    <PanelLeftDashed />
                  </TabsTrigger>
                  <TabsTrigger value="languages">
                    <LanguagesIcon />
                  </TabsTrigger>
                  <TabsTrigger value="palette">
                    <SwatchBook />
                  </TabsTrigger>
                  <TabsTrigger value="tokens">
                    <FileSliders />
                  </TabsTrigger>
                  <TabsTrigger value="typography">
                    <LetterText />
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="md:flex flex-col gap-2 hidden">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => {
                          toggleSidebar()
                        }}
                        className="flex min-h-8 min-w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground items-center justify-center rounded-md"
                      >
                        <PanelRight className="size-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Expand Sidebar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex min-h-8 min-w-8 items-center justify-center rounded-md">
                        <Info className="size-[18.5px]" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Friday is still in beta so it can make mistakes.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          )}
        </SidebarFooter>
      </Tabs>
      <SidebarRail />
    </Sidebar>
  );
}

export function CustomizerSidebarToggle({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open, toggleSidebar, openMobile } = useSidebar();
  return (
    <>
      <Button
        size={"sm"}
        variant="outline"
        className="size-8 md:hidden"
        onClick={toggleSidebar}

      >
        <Menu className="size-4" />
      </Button>
    </>
  );
}
