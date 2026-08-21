// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { isRTL, getDirection, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/utils/rtl.utils';

const COOKIE_KEY = 'orthovoix_language';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  isRTL: boolean;
  direction: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Use ref to track if this is the first render
  const isFirstRender = useRef(true);
  
  // Initialize from cookie or browser
  const getInitialLanguage = () => {
    const cookieLang = Cookies.get(COOKIE_KEY);
    if (cookieLang && SUPPORTED_LANGUAGES.includes(cookieLang)) {
      return cookieLang;
    }
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }
    return DEFAULT_LANGUAGE;
  };

  const [language, setLanguageState] = useState<string>(getInitialLanguage);

  // Apply language to document
  const applyLanguageToDocument = useCallback((lang: string) => {
    const dir = getDirection(lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    
    if (isRTL(lang)) {
      document.documentElement.classList.add('rtl');
      document.documentElement.classList.remove('ltr');
    } else {
      document.documentElement.classList.add('ltr');
      document.documentElement.classList.remove('rtl');
    }
  }, []);

  // Apply on mount and when language changes
  useEffect(() => {
    applyLanguageToDocument(language);
  }, [language, applyLanguageToDocument]);

  const setLanguage = useCallback((lang: string) => {
    const normalizedLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
    
    // Update state
    setLanguageState(normalizedLang);
    
    // Persist
    Cookies.set(COOKIE_KEY, normalizedLang, { expires: 365, path: '/' });
    localStorage.setItem('orthovoix_language', normalizedLang);
    
    // Apply to document immediately
    applyLanguageToDocument(normalizedLang);
    
    // Dispatch event for any non-React listeners
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: normalizedLang } }));
  }, [applyLanguageToDocument]);

  const value = {
    language,
    setLanguage,
    isRTL: isRTL(language),
    direction: getDirection(language),
  };

  return (
    <LanguageContext.Provider value={value}>
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