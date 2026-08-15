// src/components/ui/FormModal.tsx
import { ReactNode, FormEvent } from 'react';
import { BaseModal } from './BaseModal';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  isSubmitDisabled?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText,
  cancelText,
  isLoading = false,
  size = 'md',
  isSubmitDisabled = false,
}: FormModalProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form onSubmit={handleSubmit}>
        <div className="mt-2 space-y-4">
          {children}
        </div>

        <div className="mt-6 flex justify-end gap-3" dir={isRTL ? 'rtl' : 'ltr'}>
          <button
            type="button"
            className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText || t('common.cancel', {})}
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isSubmitDisabled}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('common.loading', {})}
              </div>
            ) : (
              submitText || t('common.save', {})
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}