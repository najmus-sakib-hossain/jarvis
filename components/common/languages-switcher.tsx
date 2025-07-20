"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe, Check } from "lucide-react";
import { useState } from "react";
import { i18n, type Locale } from "@/lib/i18n/i18n-config";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Language names mapping for better UX
const languageNames: Record<string, string> = {
  af: "Afrikaans",
  ak: "Akan",
  am: "Amharic",
  ar: "العربية",
  as: "Assamese",
  ay: "Aymara",
  az: "Azərbaycan",
  be: "Беларуская",
  bg: "Български",
  bho: "Bhojpuri",
  bm: "Bamanankan",
  bn: "বাংলা",
  bs: "Bosanski",
  ca: "Català",
  ceb: "Cebuano",
  ckb: "کوردی",
  co: "Corsu",
  cs: "Čeština",
  cy: "Cymraeg",
  da: "Dansk",
  de: "Deutsch",
  dv: "Dhivehi",
  ee: "Eʋegbe",
  el: "Ελληνικά",
  en: "English",
  eo: "Esperanto",
  es: "Español",
  et: "Eesti",
  eu: "Euskera",
  fa: "فارسی",
  fi: "Suomi",
  fr: "Français",
  fy: "Frysk",
  ga: "Gaeilge",
  gd: "Gàidhlig",
  gl: "Galego",
  gn: "Guaraní",
  gu: "ગુજરાતી",
  ha: "Hausa",
  haw: "Hawaiian",
  he: "עברית",
  hi: "हिन्दी",
  hmn: "Hmong",
  hr: "Hrvatski",
  ht: "Kreyòl",
  hu: "Magyar",
  hy: "Հայերեն",
  id: "Indonesia",
  ig: "Igbo",
  is: "Íslenska",
  it: "Italiano",
  ja: "日本語",
  jw: "Basa Jawa",
  ka: "ქართული",
  kk: "Қазақша",
  km: "ខ្មែរ",
  kn: "ಕನ್ನಡ",
  ko: "한국어",
  kri: "Krio",
  ku: "Kurdî",
  ky: "Кыргызча",
  la: "Latina",
  lb: "Lëtzebuergesch",
  lg: "Luganda",
  ln: "Lingála",
  lo: "ລາວ",
  lt: "Lietuvių",
  lus: "Mizo",
  lv: "Latviešu",
  mai: "Maithili",
  mg: "Malagasy",
  mi: "Māori",
  mk: "Македонски",
  ml: "മലയാളം",
  mn: "Монгол",
  mr: "मराठी",
  ms: "Bahasa Melayu",
  mt: "Malti",
  my: "မြန်မာ",
  ne: "नेपाली",
  nl: "Nederlands",
  no: "Norsk",
  nso: "Sepedi",
  ny: "Chichewa",
  om: "Oromoo",
  or: "ଓଡ଼ିଆ",
  pa: "ਪੰਜਾਬੀ",
  pl: "Polski",
  ps: "پښتو",
  pt: "Português",
  qu: "Runasimi",
  ro: "Română",
  ru: "Русский",
  rw: "Kinyarwanda",
  sa: "संस्कृतम्",
  sd: "سنڌي",
  si: "සිංහල",
  sk: "Slovenčina",
  sl: "Slovenščina",
  sm: "Gagana Samoa",
  sn: "ChiShona",
  so: "Soomaali",
  sq: "Shqip",
  sr: "Српски",
  st: "Sesotho",
  su: "Basa Sunda",
  sv: "Svenska",
  sw: "Kiswahili",
  ta: "தமிழ்",
  te: "తెలుగు",
  tg: "Тоҷикӣ",
  th: "ไทย",
  ti: "ትግርኛ",
  tk: "Türkmen",
  tl: "Filipino",
  tr: "Türkçe",
  ts: "Xitsonga",
  tt: "Татарча",
  tw: "Twi",
  ug: "ئۇيغۇرچە",
  uk: "Українська",
  ur: "اردو",
  uz: "O'zbek",
  vi: "Tiếng Việt",
  xh: "isiXhosa",
  yi: "ייִדיש",
  yo: "Yorùbá",
  zh: "中文",
  zu: "isiZulu",
};

export default function LocaleSwitcher() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  
  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  const getCurrentLocale = (): Locale => {
    if (!pathname) return i18n.defaultLocale;
    const segments = pathname.split("/");
    const localeFromPath = segments[1];
    return i18n.locales.includes(localeFromPath as Locale) 
      ? (localeFromPath as Locale)
      : i18n.defaultLocale;
  };

  const currentLocale = getCurrentLocale();
  const currentLanguageName = languageNames[currentLocale] || currentLocale.toUpperCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="truncate">{currentLanguageName}</span>
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            {currentLocale.toUpperCase()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {i18n.locales.map((locale) => (
                <CommandItem
                  key={locale}
                  value={`${locale} ${languageNames[locale] || locale}`}
                  onSelect={() => {
                    setOpen(false);
                    // Navigate to the new locale
                    window.location.href = redirectedPathname(locale);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentLocale === locale ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <span>{languageNames[locale] || locale}</span>
                    <span className="text-xs text-muted-foreground">
                      {locale.toUpperCase()}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
