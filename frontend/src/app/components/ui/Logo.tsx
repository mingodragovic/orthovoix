// src/components/ui/Logo.tsx
import { useTranslation } from '@/hooks/useTranslation';

interface LogoProps {
  showText?: boolean;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ 
  showText = true, 
  showSubtitle = true, 
  size = 'md',
  className = '' 
}: LogoProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: {
      logo: 'w-12 h-12 md:w-14 md:h-14',
      badge: 'w-5 h-5',
      text: 'text-lg md:text-xl',
      iconText: 'text-xl md:text-2xl',
      badgeText: 'text-[8px]',
    },
    md: {
      logo: 'w-20 h-20 md:w-24 md:h-24',
      badge: 'w-8 h-8',
      text: 'text-2xl md:text-3xl',
      iconText: 'text-3xl md:text-4xl',
      badgeText: 'text-sm',
    },
    lg: {
      logo: 'w-28 h-28 md:w-32 md:h-32',
      badge: 'w-10 h-10',
      text: 'text-3xl md:text-4xl',
      iconText: 'text-4xl md:text-5xl',
      badgeText: 'text-base',
    },
    xl: {
      logo: 'w-36 h-36 md:w-40 md:h-40',
      badge: 'w-12 h-12',
      text: 'text-4xl md:text-5xl',
      iconText: 'text-5xl md:text-6xl',
      badgeText: 'text-lg',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`${sizes.logo} rounded-full bg-white flex items-center justify-center shadow-lg mb-4 relative`}
        style={{ boxShadow: '0 8px 32px rgba(74,144,217,0.3)' }}
      >
        <span
          className={`${sizes.iconText} font-bold`}
          style={{ color: '#4A90D9', fontFamily: 'Poppins, sans-serif' }}
        >
          O
        </span>
        <div className={`absolute -bottom-1 -right-1 ${sizes.badge} rounded-full bg-[#F5A623] flex items-center justify-center text-white`}>
          <span className={sizes.badgeText}>💬</span>
        </div>
      </div>
      {showText && (
        <h1
          className={`${sizes.text} font-bold text-white`}
          style={{
            fontFamily: 'Poppins, sans-serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {t('app.title')}
        </h1>
      )}
      {showSubtitle && (
        <p className="text-white/80 text-sm md:text-base mt-1">
          {t('app.subtitle')}
        </p>
      )}
    </div>
  );
}