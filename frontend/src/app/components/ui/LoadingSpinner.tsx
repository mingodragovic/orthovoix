// src/components/ui/LoadingSpinner.tsx
import { useTranslation } from '@/hooks/useTranslation';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  label?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  fullScreen = false, 
  label 
}: LoadingSpinnerProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full border-primary border-t-transparent animate-spin
        `}
      />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return spinner;
}