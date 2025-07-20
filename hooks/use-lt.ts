"use client";

import { useLocaleStore } from '@/trash/locale';
import { lt, preloadLocale } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';

export function useLt() {
  const locale = useLocaleStore(state => state.locale);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let subscribed = true;
    preloadLocale(locale).then(() => {
      if (subscribed) {
        forceUpdate(c => c + 1);
      }
    });
    return () => { subscribed = false; };
  }, [locale]);

  const translate = useCallback((key: string, fallback?: string) => {
    return lt(key, fallback, locale);
  }, [locale]);

  return translate;
}
