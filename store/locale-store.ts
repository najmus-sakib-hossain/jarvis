import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Locale } from '@/lib/i18n/i18n-config';
import React from 'react';

// Country to language mapping based on common primary languages
const countryToLanguageMap: Record<string, Locale> = {
  // English speaking countries
  'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en',
  
  // Arabic speaking countries
  'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'MA': 'ar', 'DZ': 'ar', 'TN': 'ar', 'LY': 'ar',
  'SY': 'ar', 'JO': 'ar', 'LB': 'ar', 'IQ': 'ar', 'KW': 'ar', 'QA': 'ar', 'BH': 'ar',
  'OM': 'ar', 'YE': 'ar', 'PS': 'ar', 'SO': 'ar', 'SD': 'ar', 'DJ': 'ar', 'KM': 'ar',
  'MR': 'ar', 'TD': 'ar',
  
  // Spanish speaking countries
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es',
  'EC': 'es', 'BO': 'es', 'PY': 'es', 'UY': 'es', 'CR': 'es', 'PA': 'es', 'DO': 'es',
  'CU': 'es', 'GT': 'es', 'HN': 'es', 'SV': 'es', 'NI': 'es', 'GQ': 'es',
  
  // Portuguese speaking countries
  // 'BR': 'pt', 'PT': 'pt', 'AO': 'pt', 'MZ': 'pt', 'GW': 'pt', 'ST': 'pt', 'CV': 'pt',
  // 'TL': 'pt', 'MO': 'pt',
  
  // French speaking countries
  'FR': 'fr', 'MC': 'fr', 'SN': 'fr', 'CI': 'fr',
  'ML': 'fr', 'BF': 'fr', 'NE': 'fr', 'GN': 'fr', 'CM': 'fr',
  'CF': 'fr', 'CG': 'fr', 'GA': 'fr', 'BI': 'fr', 'RW': 'fr',
  'VU': 'fr', 'NC': 'fr', 'PF': 'fr', 'WF': 'fr', 'RE': 'fr', 'YT': 'fr', 'GP': 'fr',
  'MQ': 'fr', 'GF': 'fr', 'PM': 'fr',
  
  // German speaking countries
  'DE': 'de', 'AT': 'de', 'LI': 'de',
  
  // Asian languages
  // 'CN': 'zh-CN', 'TW': 'zh-TW', 'HK': 'zh-CN', 'SG': 'zh-CN',
  'JP': 'ja',
  'KR': 'ko',
  'IN': 'hi', 'BD': 'bn', 'PK': 'ur',
  // 'TH': 'th', 'VN': 'vi', 'ID': 'id', 'MY': 'ms', 'PH': 'tl',
  'MM': 'my', 'KH': 'km', 'LA': 'lo', 'MN': 'mn', 'KZ': 'kk',
  'KG': 'ky', 'TJ': 'tg', 'TM': 'tk', 'UZ': 'uz',
  'AF': 'fa', 'IR': 'fa',
  'AM': 'hy', 'AZ': 'az', 'GE': 'ka',
  
  // European languages
  'RU': 'ru', 'BY': 'be', 'UA': 'uk',
  'PL': 'pl', 'CZ': 'cs', 'SK': 'sk', 'HU': 'hu',
  'RO': 'ro', 'MD': 'ro', 'BG': 'bg',
  'HR': 'hr', 'RS': 'sr', 'BA': 'bs', 'ME': 'sr', 'MK': 'mk',
  'SI': 'sl', 'AL': 'sq', 'XK': 'sq',
  'GR': 'el', 'CY': 'el',
  'TR': 'tr',
  'IT': 'it', 'SM': 'it', 'VA': 'it',
  'NL': 'nl', 'SR': 'nl',
  'DK': 'da', 'NO': 'no', 'SE': 'sv', 'FI': 'fi', 'IS': 'is',
  'EE': 'et', 'LV': 'lv', 'LT': 'lt',
  
  // Special cases for multilingual countries
  'BE': 'nl', // Belgium - Dutch is most common, but could also be French
  'CH': 'de', // Switzerland - German is most common, but could also be French or Italian
  'LU': 'fr', // Luxembourg - French is administrative language
  'MT': 'mt', // Malta
  
  // African languages
  'ET': 'am', 'ER': 'ti',
  'GH': 'ak', 'BJ': 'yo', 'NG': 'yo',
  'KE': 'sw', 'TZ': 'sw', 'UG': 'sw',
  'ZW': 'sn', 'MW': 'en', // Malawi uses English as official language
  'BW': 'en', 'LS': 'st', 'SZ': 'en', // Using English as fallback for unsupported locales
  'NA': 'af',
  'MG': 'fr', // Madagascar - French is more widely known internationally
  
  // Other regions
  // 'IL': 'iw',
  'MV': 'dv', 'LK': 'si',
  'NP': 'ne', 'BT': 'en', // Bhutan - using English as fallback
  'FJ': 'en', 'TO': 'en', 'WS': 'sm', // Using English as fallback for most Pacific islands
};

// Browser language to our supported locale mapping
const browserLanguageToLocaleMap: Record<string, Locale> = {
  'en': 'en', 'en-US': 'en', 'en-GB': 'en', 'en-CA': 'en', 'en-AU': 'en',
  'es': 'es', 'es-ES': 'es', 'es-MX': 'es', 'es-AR': 'es',
  'fr': 'fr', 'fr-FR': 'fr', 'fr-CA': 'fr',
  'de': 'de', 'de-DE': 'de', 'de-AT': 'de',
  // 'pt': 'pt', 'pt-BR': 'pt', 'pt-PT': 'pt',
  // 'zh': 'zh-CN', 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', 'zh-HK': 'zh-CN',
  'ja': 'ja', 'ko': 'ko',
  'ar': 'ar', 'hi': 'hi', 'bn': 'bn', 'ur': 'ur',
  'ru': 'ru', 'it': 'it', 'nl': 'nl', 'sv': 'sv', 'da': 'da', 'no': 'no',
  'fi': 'fi', 'pl': 'pl', 'tr': 'tr', 'el': 'el',
  'th': 'th', 'vi': 'vi', 'id': 'id', 'ms': 'ms',
  // 'he': 'iw', 'fa': 'fa', 'uk': 'uk', 'cs': 'cs', 'sk': 'sk',
  'hu': 'hu', 'ro': 'ro', 'bg': 'bg', 'hr': 'hr', 'sr': 'sr',
  'sl': 'sl', 'et': 'et', 'lv': 'lv', 'lt': 'lt', 'mt': 'mt',
  'is': 'is', 'ga': 'ga', 'cy': 'cy', 'eu': 'eu', 'ca': 'ca',
  'gl': 'gl'
};

interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

interface LocaleState {
  currentLocale: Locale;
  detectedLocale: Locale | null;
  browserLanguage: string | null;
  locationInfo: LocationInfo | null;
  isAutoDetected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setLocale: (locale: Locale) => void;
  detectUserLanguage: () => Promise<void>;
  resetToDetected: () => void;
  clearError: () => void;
}

// Utility functions
const detectBrowserLanguage = (): string | null => {
  if (typeof navigator === 'undefined') return null;
  
  return (
    navigator.language ||
    (navigator as any).userLanguage ||
    (navigator.languages && navigator.languages[0]) ||
    null
  );
};

const getLocationInfo = async (): Promise<LocationInfo | null> => {
  try {
    // Try to get location from IP (using a free service)
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    
    const data = await response.json();
    
    return {
      country: data.country_code,
      region: data.region,
      city: data.city,
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.warn('Could not detect location:', error);
    return null;
  }
};

const determineLocaleFromInfo = (
  browserLang: string | null,
  locationInfo: LocationInfo | null
): Locale => {
  // First try to match browser language
  if (browserLang) {
    const normalizedLang = browserLang.toLowerCase();
    const localeFromBrowser = browserLanguageToLocaleMap[normalizedLang] ||
                             browserLanguageToLocaleMap[normalizedLang.split('-')[0]];
    
    if (localeFromBrowser) {
      return localeFromBrowser;
    }
  }
  
  // Then try to match by country
  if (locationInfo?.country) {
    const localeFromCountry = countryToLanguageMap[locationInfo.country.toUpperCase()];
    if (localeFromCountry) {
      return localeFromCountry;
    }
  }
  
  // Default to English
  return 'en';
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      currentLocale: 'en',
      detectedLocale: null,
      browserLanguage: null,
      locationInfo: null,
      isAutoDetected: false,
      isLoading: false,
      error: null,

      setLocale: (locale: Locale) => {
        set({
          currentLocale: locale,
          isAutoDetected: false,
          error: null,
        });
      },

      detectUserLanguage: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Detect browser language
          const browserLang = detectBrowserLanguage();
          
          // Get location info
          const locationInfo = await getLocationInfo();
          
          // Determine the best locale
          const detectedLocale = determineLocaleFromInfo(browserLang, locationInfo);
          
          set({
            browserLanguage: browserLang,
            locationInfo,
            detectedLocale,
            currentLocale: detectedLocale,
            isAutoDetected: true,
            isLoading: false,
            error: null,
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          set({
            error: errorMessage,
            isLoading: false,
            // Still try to set a locale based on browser language only
            ...(get().browserLanguage && {
              detectedLocale: determineLocaleFromInfo(get().browserLanguage, null),
              currentLocale: determineLocaleFromInfo(get().browserLanguage, null),
              isAutoDetected: true,
            }),
          });
        }
      },

      resetToDetected: () => {
        const { detectedLocale } = get();
        if (detectedLocale) {
          set({
            currentLocale: detectedLocale,
            isAutoDetected: true,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'locale-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data, not loading states
      partialize: (state) => ({
        currentLocale: state.currentLocale,
        detectedLocale: state.detectedLocale,
        browserLanguage: state.browserLanguage,
        locationInfo: state.locationInfo,
        isAutoDetected: state.isAutoDetected,
      }),
    }
  )
);

// Helper hook for easier usage
export const useLocale = () => {
  const store = useLocaleStore();
  
  // Auto-detect on first load if not already detected
  React.useEffect(() => {
    if (!store.detectedLocale && !store.isLoading) {
      store.detectUserLanguage();
    }
  }, [store.detectedLocale, store.isLoading, store.detectUserLanguage]);
  
  return store;
};

// Export utility functions for external use
export {
  determineLocaleFromInfo,
  detectBrowserLanguage,
  getLocationInfo,
  countryToLanguageMap,
  browserLanguageToLocaleMap,
};
