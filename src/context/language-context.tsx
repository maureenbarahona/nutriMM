'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';

const messages: Record<string, any> = {
  en: enMessages,
  es: esMessages,
};

type LanguageContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState('es'); // Default to Spanish as requested

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'es')) {
      setLocaleState(storedLocale);
    }
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: string) => {
    if (newLocale === 'en' || newLocale === 'es') {
      localStorage.setItem('locale', newLocale);
      setLocaleState(newLocale);
    }
  };

  const t = useMemo(() => (key: string, values?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result = messages[locale];
    try {
        for (const k of keys) {
            result = result[k];
        }
    } catch(e) {
        result = undefined;
    }

    if (result === undefined) {
        // Fallback to English
        result = messages['en'];
        try {
            for (const k of keys) {
                result = result[k];
            }
        } catch (e) {
            return key;
        }
    }
    
    if (typeof result === 'string' && values) {
      return result.replace(/\{(\w+)\}/g, (_, g) => values[g]?.toString() || g);
    }

    return typeof result === 'string' ? result : key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
