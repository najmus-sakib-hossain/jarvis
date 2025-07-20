"use client";

import { useEffect } from 'react';
import { Locale } from '@/lib/i18n/i18n-config';

// Import the internal functions
async function loadLocaleData(locale: Locale) {
  try {
    const localeData = await import(`@/locales/${locale}.json`);
    return localeData.default;
  } catch (error) {
    console.warn(`Failed to load locale ${locale}, falling back to English`);
    const fallback = await import('@/locales/en.json');
    return fallback.default;
  }
}

// Initialize locale cache on client side
let clientLocaleCache: any = {};

export function LocaleInitializer({ locale, data }: { locale: Locale; data: any }) {
  useEffect(() => {
    // Set the locale data in client cache
    clientLocaleCache[locale] = data;
    
    // Also set it in window for the lt function to access
    if (typeof window !== 'undefined') {
      (window as any).__LOCALE_CACHE__ = clientLocaleCache;
    }
  }, [locale, data]);

  return null; // This component doesn't render anything
}
