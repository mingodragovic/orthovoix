// src/app/pages/LoginScreen.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, ChevronDown, User, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import { loginSchema, LoginFormValues } from '@/utils/validators';
import { Role } from '@/types/api.types';

interface LoginScreenProps {
  onLogin?: (email: string, password: string, role: Role) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('orthophoniste');
  const [lang, setLang] = useState(() => {
    const savedLang = localStorage.getItem('orthovoix_language') || 'fr';
    return savedLang.toUpperCase();
  });
  const [showLang, setShowLang] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const { setLanguage } = useLanguage();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Mock credentials for demo
  const mockCredentials = {
    orthophoniste: { email: 'dr.sarah@ortho.fr', password: 'password' },
    parent: { email: 'david.martin@email.com', password: 'password' },
  };

  const fillCredentials = (role: Role) => {
    setRole(role);
    setValue('email', mockCredentials[role].email);
    setValue('password', mockCredentials[role].password);
  };

  const handleLanguageChange = (locale: string) => {
    const normalizedLocale = locale.toLowerCase();
    setLang(locale.toUpperCase());
    setLanguage(normalizedLocale);
    setShowLang(false);
  };

  const onSubmit = async (data: LoginFormValues) => {
    await loginMutation.mutateAsync({
      email: data.email,
      password: data.password,
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
              disabled={!isValid || isSubmitting || loginMutation.isPending}
              className="w-full py-3.5 md:py-4 rounded-2xl text-white font-semibold text-sm md:text-base transition-all duration-150 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: !isValid || loginMutation.isPending
                  ? '#CBD5E0'
                  : 'linear-gradient(135deg, #4A90D9, #6EC6A0)',
                boxShadow: !isValid || loginMutation.isPending
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

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                {role === 'orthophoniste' ? '👩‍⚕️' : '👨‍👧'}
                <span className="ml-1">
                  {t(`auth.login.role.${role}`)} {t('common.loading')?.toLowerCase()}
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}