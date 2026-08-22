// src/app/pages/RegisterScreen.tsx

import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, ArrowLeft, Globe, ChevronDown, CheckCircle, AlertCircle, Calendar, Baby } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import { useValidationSchemas, RegisterFormValues } from '@/utils/validators';
import { z } from 'zod';

export function RegisterScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLanguage } = useLanguage();
  const registerMutation = useRegister();
  const schemas = useValidationSchemas(t);
  
  const [lang, setLang] = useState(() => {
    const savedLang = localStorage.getItem('orthovoix_language') || 'fr';
    return savedLang.toUpperCase();
  });
  const [showLang, setShowLang] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Use zodResolver with the schema directly - no casting needed
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    reset,
  } = useForm<RegisterFormValues>({
    // @ts-ignore - Ignore type mismatch between Zod schema and React Hook Form
    resolver: zodResolver(schemas.registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'parent',
      childName: '',
      childDateOfBirth: '',
      childId: '',
      avatar: '',
    },
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const handleLanguageChange = (locale: string) => {
    const normalizedLocale = locale.toLowerCase();
    setLang(locale.toUpperCase());
    setLanguage(normalizedLocale);
    setShowLang(false);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    // Prevent multiple submissions
    if (registerMutation.isPending) return;
    
    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'parent',
        childName: data.childName,
        childDateOfBirth: data.childDateOfBirth,
      });
      
      // Show success state
      setRegistrationSuccess(true);
      
      // Reset form after success
      reset();
      
      // Navigate to login after 3 seconds with a countdown
      let countdown = 3;
      submitTimeoutRef.current = setInterval(() => {
        countdown -= 1;
        if (countdown === 0) {
          if (submitTimeoutRef.current) {
            clearInterval(submitTimeoutRef.current);
          }
          navigate('/login');
        }
      }, 1000);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Registration error:', error);
    }
  };

  // Show success message
  if (registrationSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 md:p-8"
        style={{
          background: 'linear-gradient(135deg, #4A90D9 0%, #6EC6A0 100%)',
        }}
      >
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl text-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {t('auth.register.success')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('auth.register.redirectMessage')}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">
                {t('auth.register.redirecting')}...
              </span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 text-primary font-medium hover:underline"
            >
              {t('auth.login.button')}
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          <h2 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('auth.register.title')}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 mb-6">
              {/* Parent Name Field */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {t('auth.register.name')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="John Doe"
                    className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 md:py-3.5 text-sm outline-none transition-all ${
                      errors.name ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                    }`}
                    disabled={registerMutation.isPending}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {t('auth.login.email')} <span className="text-red-500">*</span>
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
                    className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 md:py-3.5 text-sm outline-none transition-all ${
                      errors.email ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                    }`}
                    disabled={registerMutation.isPending}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {t('auth.login.password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 md:py-3.5 text-sm outline-none transition-all ${
                      errors.password ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                    }`}
                    disabled={registerMutation.isPending}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {t('auth.register.passwordRequirements')}
                </p>
              </div>

              {/* Child Name Field - Required */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {t('auth.register.childName')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Baby
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    {...register('childName')}
                    placeholder="Emma"
                    className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 md:py-3.5 text-sm outline-none transition-all ${
                      errors.childName ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                    }`}
                    disabled={registerMutation.isPending}
                    aria-invalid={!!errors.childName}
                    aria-describedby={errors.childName ? 'childName-error' : undefined}
                  />
                </div>
                {errors.childName && (
                  <p id="childName-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.childName.message}
                  </p>
                )}
              </div>

              {/* Child Date of Birth Field - Required */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {t('auth.register.childDateOfBirth')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="date"
                    {...register('childDateOfBirth')}
                    className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 md:py-3.5 text-sm outline-none transition-all ${
                      errors.childDateOfBirth ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                    }`}
                    disabled={registerMutation.isPending}
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    aria-invalid={!!errors.childDateOfBirth}
                    aria-describedby={errors.childDateOfBirth ? 'childDateOfBirth-error' : undefined}
                  />
                </div>
                {errors.childDateOfBirth && (
                  <p id="childDateOfBirth-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.childDateOfBirth.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {t('auth.register.childDateOfBirthHint')}
                </p>
              </div>
            </div>

            {/* Password Requirements Hint */}
            <div className="bg-muted/30 rounded-xl p-3 mb-6">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">💡 {t('auth.register.passwordHint')}</span>
                <br />
                • {t('auth.register.passwordMinLength')}
              </p>
            </div>

            {/* Loading State Indicator */}
            {registerMutation.isPending && (
              <div className="mb-4 p-3 bg-primary/10 rounded-xl flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-primary font-medium">
                  {t('auth.register.loading')}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isValid || !isDirty || isSubmitting || registerMutation.isPending}
              className="w-full py-3.5 md:py-4 rounded-2xl text-white font-semibold text-sm md:text-base transition-all duration-150 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{
                background: !isValid || !isDirty || registerMutation.isPending 
                  ? '#CBD5E0' 
                  : 'linear-gradient(135deg, #4A90D9, #6EC6A0)',
                boxShadow: !isValid || !isDirty || registerMutation.isPending 
                  ? 'none' 
                  : '0 4px 16px rgba(74,144,217,0.4)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {isSubmitting || registerMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.loading')}
                </div>
              ) : (
                t('auth.register.button')
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