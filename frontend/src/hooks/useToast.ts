// src/hooks/useToast.ts
import { toast } from 'sonner';
import { useTranslation } from './useTranslation';

type ToastOptions = {
  duration?: number;
  position?: 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right';
  className?: string;
  [key: string]: any;
};

export const useToast = () => {
  const { t, isRTL } = useTranslation();

  const showToast = {
    success: (message: string, options?: ToastOptions) => {
      return toast.success(message, {
        duration: 3000,
        position: 'top-center',
        className: isRTL ? 'rtl:text-right' : 'ltr:text-left',
        ...options,
      });
    },

    error: (message: string, options?: ToastOptions) => {
      return toast.error(message, {
        duration: 4000,
        position: 'top-center',
        className: isRTL ? 'rtl:text-right' : 'ltr:text-left',
        ...options,
      });
    },

    info: (message: string, options?: ToastOptions) => {
      return toast.info(message, {
        duration: 3000,
        position: 'top-center',
        className: isRTL ? 'rtl:text-right' : 'ltr:text-left',
        ...options,
      });
    },

    warning: (message: string, options?: ToastOptions) => {
      return toast.warning(message, {
        duration: 3500,
        position: 'top-center',
        className: isRTL ? 'rtl:text-right' : 'ltr:text-left',
        ...options,
      });
    },

    loading: (message: string, options?: ToastOptions) => {
      return toast.loading(message, {
        position: 'top-center',
        className: isRTL ? 'rtl:text-right' : 'ltr:text-left',
        ...options,
      });
    },

    dismiss: (toastId?: string | number) => {
      if (toastId !== undefined) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },

    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      },
      options?: ToastOptions
    ) => {
      return toast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
        position: 'top-center',
        className: isRTL ? 'rtl:text-right' : 'ltr:text-left',
        ...options,
      });
    },
  };

  return showToast;
};