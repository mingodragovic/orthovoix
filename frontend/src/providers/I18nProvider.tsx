// src/providers/I18nProvider.tsx
import { IntlProvider } from 'react-intl';
import { ReactNode, useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

// Import messages
import frMessages from '@/messages/fr.json';
import enMessages from '@/messages/en.json';
import arMessages from '@/messages/ar.json';

console.log('🔵 [I18nProvider] Module loaded');

const messages: Record<string, any> = {
  fr: frMessages,
  en: enMessages,
  ar: arMessages,
};

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  console.log('🔵 [I18nProvider] Component rendering');
  
  const { language } = useLanguage();
  console.log('🔵 [I18nProvider] Language from useLanguage:', language);
  
  // IMPORTANT: Use a unique key that changes with language
  // This forces React to unmount and remount the IntlProvider
  const [key, setKey] = useState(() => `i18n-${language}-${Date.now()}`);
  
  useEffect(() => {
    console.log('🟢 [I18nProvider] Language changed to:', language);
    // Update key to force remount
    setKey(`i18n-${language}-${Date.now()}`);
  }, [language]);

  const messagesForLocale = useMemo(() => {
    console.log('🔵 [I18nProvider] Computing messages for locale:', language);
    return messages[language] || messages.fr;
  }, [language]);

  console.log('🔵 [I18nProvider] Messages for locale:', language, Object.keys(messagesForLocale).length, 'keys');
  console.log('🔵 [I18nProvider] Sample messages:', {
    'app.title': messagesForLocale['app.title'],
    'auth.login.button': messagesForLocale['auth.login.button'],
  });

  console.log('🔵 [I18nProvider] Rendering IntlProvider with:');
  console.log('  - key:', key);
  console.log('  - locale:', language);

  // The key prop on IntlProvider forces React to treat it as a new component
  // and remount it completely when the key changes
  return (
    <IntlProvider
      key={key}
      locale={language}
      messages={messagesForLocale}
      defaultLocale="fr"
      onError={(err) => {
        console.error('🔴 [I18nProvider] IntlProvider error:', err);
        if (import.meta.env.MODE === 'development') {
          console.warn('⚠️ Translation missing:', err);
        }
      }}
    >
      {children}
    </IntlProvider>
  );
}