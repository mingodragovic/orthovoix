// src/contexts/TranslationContext.tsx
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useIntl, IntlProvider } from 'react-intl';
import { useLanguage } from './LanguageContext';

// Import messages
import frMessages from '@/messages/fr.json';
import enMessages from '@/messages/en.json';
import arMessages from '@/messages/ar.json';

const messages: Record<string, any> = {
  fr: frMessages,
  en: enMessages,
  ar: arMessages,
};

interface TranslationContextType {
  t: (id: string, values?: Record<string, any> | string) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  language: string;
  isRTL: boolean;
  locale: string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

function TranslationProviderInner({ children }: { children: ReactNode }) {
  const intl = useIntl();
  const { language, isRTL } = useLanguage();

  const t = useMemo(() => {
    return (id: string, values?: Record<string, any> | string): string => {
      try {
        if (typeof values === 'string') {
          try {
            const message = intl.formatMessage({ id, defaultMessage: id });
            return message === id ? values : message;
          } catch {
            return values;
          }
        }
        return intl.formatMessage({ id, defaultMessage: id }, values || {});
      } catch (error) {
        if (import.meta.env.MODE === 'development') {
          console.warn(`Translation missing for key: ${id}`);
        }
        return typeof values === 'string' ? values : id;
      }
    };
  }, [intl, language]);

  const formatDate = useMemo(() => {
    return (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      return intl.formatDate(date, options);
    };
  }, [intl, language]);

  const formatNumber = useMemo(() => {
    return (number: number, options?: Intl.NumberFormatOptions) => {
      return intl.formatNumber(number, options);
    };
  }, [intl, language]);

  const formatTime = useMemo(() => {
    return (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      return intl.formatTime(date, options);
    };
  }, [intl, language]);

  const value = {
    t,
    formatDate,
    formatNumber,
    formatTime,
    language,
    isRTL,
    locale: language,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  
  // Use a key that changes with language to force IntlProvider remount
  const key = useMemo(() => `i18n-${language}`, [language]);

  return (
    <IntlProvider
      key={key}
      locale={language}
      messages={messages[language] || messages.fr}
      defaultLocale="fr"
    >
      <TranslationProviderInner>{children}</TranslationProviderInner>
    </IntlProvider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}