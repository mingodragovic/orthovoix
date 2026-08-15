// src/components/ui/ConfirmationModal.tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger',
  isLoading = false,
}: ConfirmationModalProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const getIcon = () => {
    switch(type) {
      case 'danger':
        return <AlertTriangle className="w-12 h-12 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-600" />;
      case 'info':
        return <AlertTriangle className="w-12 h-12 text-blue-600" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch(type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-600';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-600';
      default:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-600';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex items-start gap-4 py-4">
                  <div className={`flex-shrink-0 rounded-full p-2 ${
                    type === 'danger' ? 'bg-red-100' :
                    type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {getIcon()}
                  </div>
                  <div className="flex-1">
                    <Dialog.Description className="text-sm text-gray-600">
                      {message}
                    </Dialog.Description>
                  </div>
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
                    type="button"
                    className={`inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClass()}`}
                    onClick={onConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('common.loading', {})}
                      </div>
                    ) : (
                      confirmText || t('common.confirm', {})
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}