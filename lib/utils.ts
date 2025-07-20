import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Locale, i18n } from '@/lib/i18n/i18n-config';
import { useLocaleStore } from "@/trash/locale";
import type { Message } from "@/types/chat";

/**
 * Sanitizes a message for database storage without removing special characters
 * This only handles potential JSON serialization issues, not character removal
 */
export function sanitizeForDrizzle(message: any): any {
  if (!message) return message;
  
  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(message));
  
  // Ensure content is properly handled but not modified
  if (typeof sanitized.content === 'string') {
    // Don't modify content - preserve all characters
    // Just ensure it's properly JSON serializable
  }
  
  return sanitized;
}

/**
 * Strips command prefixes but preserves all other characters
 */
export function stripPrefixes(text: string): string {
  // Only remove specific prefixes, leave all other characters intact
  if (!text) return text;
  const prefixRegex = /^\/[a-z]+\s+/i;
  return text.replace(prefixRegex, '');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const copyToClipboard = (text: string) => {
  if (window === undefined) return;
  window.navigator.clipboard.writeText(text);
};

export function getComponentName(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getRandomIndex(array: any[]) {
  return Math.floor(Math.random() * array.length);
}

type LocaleKeys = {
  home: string;
  contents: string;
  about: string;
  "start-project": string;
  headline: string;
  description: string;
  now: string;
  "now-description": string;
  previously: string;
  "previously-description": string;
  name: string;
  from: string;
  highlights: string;
  "see-all-contents": string;
  "footer-copyright": string;
  [key: string]: any;
};

let localeCache: any = {};

export async function loadLocaleData(locale: Locale): Promise<LocaleKeys> {
  if (localeCache[locale]) {
    return localeCache[locale]!;
  }

  try {
    const localeData = await import(`@/locales/${locale}.json`);
    localeCache[locale] = localeData.default;
    return localeData.default;
  } catch (error) {
    console.warn(`Failed to load locale ${locale}, falling back to English`);
    if (!localeCache.en) {
      const fallback = await import('@/locales/en.json');
      localeCache.en = fallback.default;
    }
    return localeCache.en!;
  }
}

function getCurrentLocale(): Locale {
  if (typeof window !== 'undefined') {
    return useLocaleStore.getState().locale;
  }

  return i18n.defaultLocale;
}

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

export function lt(key: string, fallback?: string, locale?: Locale): string {
  const effectiveLocale = locale || getCurrentLocale();
  const translations = localeCache[effectiveLocale];

  if (!translations) {
    const enTranslations = localeCache.en;
    if (enTranslations) {
      const text = getNestedValue(enTranslations, key);
      if (text) {
        return text;
      }
    }
    return fallback || key;
  }

  const text = getNestedValue(translations, key);
  return text || fallback || key;
}

export async function lta(key: string, fallback?: string): Promise<string> {
  const currentLocale = getCurrentLocale();
  const localeData = await loadLocaleData(currentLocale);
  
  const value = getNestedValue(localeData, key);
  return value !== undefined ? value : (fallback || key.split('.').pop() || key);
}

export async function preloadCurrentLocale(): Promise<void> {
  const currentLocale = getCurrentLocale();
  await loadLocaleData(currentLocale);
}

export async function preloadLocale(locale: Locale): Promise<void> {
  await loadLocaleData(locale);
}

export function clearLocaleCache(): void {
  localeCache = {};
}

export function initializeLocale(): void {
  if (typeof window !== 'undefined') {
    preloadCurrentLocale().catch(console.error);
  }
}

export const DATA_KEYS = {
  preset: "data-preset",
  primary: "data-primary",
  surface: "data-surface",
  variant: "data-variant",
  "font-sans": "data-font-sans",
  "font-serif": "data-font-serif",
  "font-mono": "data-font-mono",
} as const;

export type DataKey = (typeof DATA_KEYS)[keyof typeof DATA_KEYS];

export function setStyleProperty({
  element,
  value,
  key,
}: {
  element: HTMLElement;
  key: string;
  value: string;
}) {
  element.style.setProperty(key, value);
}

export function setAttributeToElement({
  element,
  attribute,
  value,
}: {
  element: HTMLElement;
  attribute: DataKey | (string & {});
  value: string;
}) {
  if (element) {
    element.setAttribute(attribute, value);
  }
}

export function getAttributeFromElement({
  element,
  attribute,
}: {
  element: HTMLElement;
  attribute: DataKey;
}) {
  if (element) {
    return element.getAttribute(attribute);
  }
}
