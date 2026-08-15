// src/app/pages/ForgotPasswordScreen.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Globe, ChevronDown } from 'lucide-react';
import { useForgotPassword } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/utils/validators';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLanguage } = useLanguage();
  const forgotPasswordMutation = useForgotPassword();
  
  const [lang, setLang] = useState(() => {
    const savedLang = localStorage.getItem('orthovoix_language') || 'fr';
    return savedLang.toUpperCase();
  });
  const [showLang, setShowLang] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleLanguageChange = (locale: string) => {
    const normalizedLocale = locale.toLowerCase();
    setLang(locale.toUpperCase());
    setLanguage(normalizedLocale);
    setShowLang(false);
  };

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await forgotPasswordMutation.mutateAsync({
      email: data.email,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #4A90D9 0%, #6EC6A0 100%)',
      }}
      onClick={() => setShowLang(false)}
    >
      <div className="w-full max-w-md lg:max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 md:mb-10">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-lg mb-4 relative"
            style={{ boxShadow: '0 8px 32px rgba(74,144,217,0.3)' }}
          >
            <span
              className="text-3xl md:text-4xl font-bold"
              style={{ color: '#4A90D9', fontFamily: 'Poppins, sans-serif' }}
            >
              O
            </span>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-white text-sm">
              💬
            </div>
          </div>
          <h1
            className="text-white text-2xl md:text-3xl font-bold"
            style={{
              fontFamily: 'Poppins, sans-serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {t('app.title')}
          </h1>
          <p className="text-white/80 text-sm md:text-base mt-1">
            {t('app.subtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Back button */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">{t('common.back')}</span>
            </button>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLang(!showLang);
                }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-xl px-3 py-1.5"
              >
                <Globe size={14} />
                {lang}
                <ChevronDown size={12} />
              </button>
              {showLang && (
                <div className="absolute top-10 right-0 bg-white border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  {['FR', 'EN', 'AR'].map((l) => (
                    <button
                      key={l}
                      onClick={() => handleLanguageChange(l)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                        lang === l ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('auth.forgotPassword.title')}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {t('auth.forgotPassword.description')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {t('auth.forgotPassword.email')}
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="user@example.com"
                    className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 md:py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || forgotPasswordMutation.isPending}
              className="w-full py-3.5 md:py-4 rounded-2xl text-white font-semibold text-sm md:text-base transition-all duration-150 active:scale-95 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #4A90D9, #6EC6A0)',
                boxShadow: '0 4px 16px rgba(74,144,217,0.4)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {isSubmitting || forgotPasswordMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.loading')}
                </div>
              ) : (
                t('auth.forgotPassword.button')
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.register.alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  {t('auth.login.button')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}