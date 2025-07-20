import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { i18n, type Locale } from '@/lib/i18n/i18n-config';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: i18n.defaultLocale,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'locale-storage', // name of the item in the storage (must be unique)
    }
  )
);
