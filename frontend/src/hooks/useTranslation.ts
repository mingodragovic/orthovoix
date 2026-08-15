// src/hooks/useTranslation.ts
import { useIntl } from 'react-intl';
import { useLanguage } from './useLanguage';
import { isRTL } from '@/utils/rtl.utils';

export const useTranslation = () => {
  const intl = useIntl();
  const { language } = useLanguage();

  const t = (id: string, values?: Record<string, any> | string): string => {
    try {
      // If values is a string, treat it as fallback
      if (typeof values === 'string') {
        try {
          const message = intl.formatMessage({ id, defaultMessage: id });
          return message === id ? values : message;
        } catch {
          return values;
        }
      }
      
      // Normal usage with values object
      return intl.formatMessage({ id, defaultMessage: id }, values || {});
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        console.warn(`Translation missing for key: ${id}`);
      }
      return typeof values === 'string' ? values : id;
    }
  };

  // RTL-aware date formatting
  const formatDate = (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    return intl.formatDate(date, options);
  };

  // RTL-aware number formatting
  const formatNumber = (
    number: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    return intl.formatNumber(number, options);
  };

  // RTL-aware time formatting
  const formatTime = (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    return intl.formatTime(date, options);
  };

  return {
    t,
    formatDate,
    formatNumber,
    formatTime,
    language,
    isRTL: isRTL(language),
    locale: language,
  };
};