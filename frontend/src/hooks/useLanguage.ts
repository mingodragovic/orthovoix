// src/hooks/useLanguage.ts
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { isRTL, getDirection, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/utils/rtl.utils';

const COOKIE_KEY = 'orthovoix_language';

export const useLanguage = () => {
  const [language, setLanguageState] = useState<string>(() => {
    // Get from cookie on initial render
    const cookieLang = Cookies.get(COOKIE_KEY);
    
    if (cookieLang && SUPPORTED_LANGUAGES.includes(cookieLang)) {
     
      return cookieLang;
    }
    
    // Try browser language
    const browserLang = navigator.language.split('-')[0];
    
    if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }
    
    return DEFAULT_LANGUAGE;
  });

// In the setLanguage function, add this:
const setLanguage = useCallback((lang: string) => {
  const normalizedLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
  
  // Update state - this triggers re-render immediately
  setLanguageState(normalizedLang);
  
  // Persist to cookie
  Cookies.set(COOKIE_KEY, normalizedLang, { expires: 365, path: '/' });

  // Update document direction
  const dir = getDirection(normalizedLang);
  document.documentElement.dir = dir;
  document.documentElement.lang = normalizedLang;
  
  if (isRTL(normalizedLang)) {
    document.documentElement.classList.add('rtl');
    document.documentElement.classList.remove('ltr');
  } else {
    document.documentElement.classList.add('ltr');
    document.documentElement.classList.remove('rtl');
  }
  
  // Store in localStorage for API header
  localStorage.setItem('orthovoix_language', normalizedLang);
  
  // Dispatch custom event to notify all components
  window.dispatchEvent(new Event('languageChanged'));
}, [language]);

  // Sync with document on mount
  useEffect(() => {
    const dir = getDirection(language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    if (isRTL(language)) {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, [language]);

  return {
    language,
    setLanguage,
    isRTL: isRTL(language),
    direction: getDirection(language),
  };
};