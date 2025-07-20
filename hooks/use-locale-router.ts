"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from '@/store/locale-store';
import { Locale } from '@/lib/i18n/i18n-config';

/**
 * Hook that integrates the Zustand locale store with Next.js routing
 * Automatically redirects to the detected language route when language changes
 */
export function useLocaleRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentLocale, detectedLocale, isAutoDetected } = useLocale();

  useEffect(() => {
    // Extract current locale from pathname (e.g., /en/page -> en)
    const currentPathLocale = pathname.split('/')[1] as Locale;
    
    // If the store locale differs from the URL locale, navigate to the correct route
    if (currentLocale !== currentPathLocale) {
      // Build new path with the correct locale
      const pathSegments = pathname.split('/');
      pathSegments[1] = currentLocale; // Replace locale segment
      const newPath = pathSegments.join('/');
      
      // Navigate to the new path
      router.push(newPath);
    }
  }, [currentLocale, pathname, router]);

  // Auto-redirect to detected language on first visit
  useEffect(() => {
    if (isAutoDetected && detectedLocale) {
      const currentPathLocale = pathname.split('/')[1] as Locale;
      
      if (detectedLocale !== currentPathLocale) {
        const pathSegments = pathname.split('/');
        pathSegments[1] = detectedLocale;
        const newPath = pathSegments.join('/');
        
        router.replace(newPath); // Use replace to avoid adding to history
      }
    }
  }, [isAutoDetected, detectedLocale, pathname, router]);

  return {
    currentLocale,
    detectedLocale,
    isAutoDetected,
  };
}

/**
 * Component that automatically handles locale routing
 * Add this to your root layout or pages where you want automatic locale detection
 */
export function LocaleRouter() {
  useLocaleRouter();
  return null; // This component doesn't render anything
}
