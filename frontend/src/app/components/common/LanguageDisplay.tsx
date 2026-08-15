// src/app/components/common/LanguageDisplay.tsx
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';

export function LanguageDisplay() {
  const { language, isRTL } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-20 right-4 bg-white p-3 rounded-lg shadow-lg border border-border z-50 text-xs">
      <p>Current: {language}</p>
      <p>Direction: {isRTL ? 'RTL' : 'LTR'}</p>
      <p>Translation: {t('app.title')}</p>
    </div>
  );
}