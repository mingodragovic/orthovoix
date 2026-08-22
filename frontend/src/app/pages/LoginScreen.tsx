// src/app/pages/LoginScreen.tsx

import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, ChevronDown, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { useTranslation } from '@/contexts/TranslationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useValidationSchemas, LoginFormValues } from '@/utils/validators';
import { Role } from '@/types/api.types';
import { toast } from 'sonner';

export function LoginScreen() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('orthophoniste');
  const { language, setLanguage, isRTL } = useLanguage();
  const [showLang, setShowLang] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ✅ Use dynamic translated schema
  const schemas = useValidationSchemas(t);
  const loginSchema = schemas.loginSchema;

  const displayLang = useMemo(() => language.toUpperCase(), [language]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    setValue,
    getValues,
    watch,
  } = useForm<LoginFormValues>({
    // @ts-ignore - Type mismatch between Zod schema and React Hook Form
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Watch form values to clear error when user types
  const emailValue = watch('email');
  const passwordValue = watch('password');

  // Clear error when user starts typing
  useEffect(() => {
    if (loginError) {
      setLoginError(null);
    }
  }, [emailValue, passwordValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowLang(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock credentials for demo
  const mockCredentials = {
    orthophoniste: { email: 'dr.sarah@ortho.fr', password: 'password' },
    parent: { email: 'david.martin@email.com', password: 'password' },
  };

  const fillCredentials = (role: Role) => {
    setRole(role);
    setValue('email', mockCredentials[role].email);
    setValue('password', mockCredentials[role].password);
    setLoginError(null);
  };

  const handleLanguageChange = (locale: string) => {
    const normalizedLocale = locale.toLowerCase();
    // Save current form values before language change
    const currentEmail = getValues('email');
    const currentPassword = getValues('password');
    
    setLanguage(normalizedLocale);
    setShowLang(false);
    
    // Restore form values after language change
    setTimeout(() => {
      setValue('email', currentEmail);
      setValue('password', currentPassword);
    }, 0);
  };

  /**
   * Get user-friendly error message based on error type
   */
  const getErrorMessage = (error: any): string => {
    // Check if error has a response from the server
    if (error?.response?.data) {
      const data = error.response.data;
      
      // Check for specific error messages
      if (data.message) {
        const message = data.message;
        
        // Map server error messages to user-friendly translations
        if (typeof message === 'string') {
          // Invalid credentials
          if (message.toLowerCase().includes('invalid') || 
              message.toLowerCase().includes('credentials') ||
              message.toLowerCase().includes('password') ||
              message.toLowerCase().includes('email')) {
            return t('auth.login.error');
          }
          
          // Account deactivated
          if (message.toLowerCase().includes('deactivated') || 
              message.toLowerCase().includes('disabled')) {
            return t('auth.login.accountDeactivated');
          }
          
          // Account not found
          if (message.toLowerCase().includes('not found') || 
              message.toLowerCase().includes('does not exist')) {
            return t('auth.login.error');
          }
        }
        
        // If it's an array of messages
        if (Array.isArray(message)) {
          const firstMessage = message[0];
          if (typeof firstMessage === 'string') {
            if (firstMessage.toLowerCase().includes('invalid') || 
                firstMessage.toLowerCase().includes('credentials')) {
              return t('auth.login.error');
            }
            if (firstMessage.toLowerCase().includes('deactivated')) {
              return t('auth.login.accountDeactivated');
            }
          }
        }
      }
      
      // Check status codes
      if (data.statusCode) {
        switch (data.statusCode) {
          case 401:
            return t('auth.login.error');
          case 403:
            return t('auth.login.accountDeactivated');
          case 404:
            return t('auth.login.error');
          default:
            break;
        }
      }
    }
    
    // Check if it's a network error
    if (error?.message?.toLowerCase().includes('network') || 
        error?.code === 'ERR_NETWORK') {
      return t('common.networkError', 'Network error. Please check your connection.');
    }
    
    // Fallback error message
    return t('auth.login.error');
  };

  const onSubmit = async (data: LoginFormValues) => {
    // Clear previous errors
    setLoginError(null);
    
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      // On success, navigation happens in the mutation
    } catch (error: any) {
      // Get user-friendly error message
      const errorMessage = getErrorMessage(error);
      setLoginError(errorMessage);
      
      // Show toast for better UX
      toast.error(errorMessage);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #4A90D9 0%, #6EC6A0 100%)',
      }}
    >
      <div className="w-full max-w-md lg:max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 md:mb-10">
          <img
            src="/ortho-voix.png"
            alt="OrthoVoix Logo"
            className="w-20 h-20 md:w-24 md:h-24 object-contain mb-4 drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 8px 32px rgba(74,144,217,0.3))' }}
          />
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
          {/* Language selector */}
          <div className="flex justify-end mb-4 relative">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowLang(!showLang);
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-xl px-3 py-1.5"
            >
              <Globe size={14} />
              {displayLang}
              <ChevronDown size={12} />
            </button>
            
            {/* Dropdown - positioned dynamically based on RTL */}
            {showLang && (
              <div 
                ref={dropdownRef}
                className={`absolute top-10 ${
                  isRTL ? 'left-0' : 'right-0'
                } bg-white border border-border rounded-xl shadow-lg z-10 overflow-hidden min-w-[100px]`}
              >
                {['FR', 'EN', 'AR'].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLanguageChange(l)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                      displayLang === l ? 'text-primary font-medium' : 'text-foreground'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role selector */}
          <div className="flex rounded-2xl bg-muted p-1 mb-6">
            {(['orthophoniste', 'parent'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => fillCredentials(r)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: role === r ? '#4A90D9' : 'transparent',
                  color: role === r ? '#fff' : '#718096',
                  boxShadow: role === r ? '0 2px 8px rgba(74,144,217,0.3)' : 'none',
                }}
              >
                {r === 'orthophoniste'
                  ? t('auth.login.role.orthophoniste')
                  : t('auth.login.role.parent')}
              </button>
            ))}
          </div>

          {/* Global error message */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-4 mb-6">
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
                    placeholder="dr.sarah@ortho.fr"
                    className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 md:py-3.5 text-sm outline-none transition-all ${
                      errors.email ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                    }`}
                    disabled={loginMutation.isPending}
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

              {/* Password Field with Eye Toggle */}
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
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full bg-muted rounded-xl pl-10 pr-10 py-3 md:py-3.5 text-sm outline-none transition-all ${
                      errors.password ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                    }`}
                    disabled={loginMutation.isPending}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="flex justify-between items-center mb-6">
              <Link
                to="/register"
                className="text-xs text-primary font-medium hover:underline"
              >
                {t('auth.register.title')}
              </Link>
              <Link
                to="/forgot-password"
                className="text-xs text-primary font-medium hover:underline"
              >
                {t('auth.login.forgot')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || !isDirty || isSubmitting || loginMutation.isPending}
              className="w-full py-3.5 md:py-4 rounded-2xl text-white font-semibold text-sm md:text-base transition-all duration-150 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: !isValid || !isDirty || loginMutation.isPending
                  ? '#CBD5E0'
                  : 'linear-gradient(135deg, #4A90D9, #6EC6A0)',
                boxShadow: !isValid || !isDirty || loginMutation.isPending
                  ? 'none'
                  : '0 4px 16px rgba(74,144,217,0.4)',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {isSubmitting || loginMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.loading')}
                </div>
              ) : (
                t('auth.login.button')
              )}
            </button>

       
          </form>
        </div>
      </div>
    </div>
  );
}