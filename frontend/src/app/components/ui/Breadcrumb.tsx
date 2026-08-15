// src/components/ui/Breadcrumb.tsx
import { ChevronLeft, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';

interface BreadcrumbProps {
  items?: { label: string; path: string }[];
  showHome?: boolean;
  showBack?: boolean;
}

export function Breadcrumb({ items = [], showHome = true, showBack = true }: BreadcrumbProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/ortho-dashboard');
  };

  // If no items provided, generate from current path
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs(location.pathname, t);

  return (
    <nav className="flex items-center gap-2 text-sm mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {showBack && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} className={isRTL ? 'rotate-180' : ''} />
          <span>{t('common.back')}</span>
        </button>
      )}
      
      {showBack && showHome && <span className="text-muted-foreground">|</span>}
      
      {showHome && (
        <button
          onClick={handleHome}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home size={16} />
          <span>{t('sidebar.home')}</span>
        </button>
      )}

      {breadcrumbItems.length > 0 && (
        <>
          <span className="text-muted-foreground">/</span>
          {breadcrumbItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-muted-foreground">/</span>}
              {index === breadcrumbItems.length - 1 ? (
                <span className="font-medium text-foreground">{item.label}</span>
              ) : (
                <button
                  onClick={() => navigate(item.path)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </nav>
  );
}

// Helper to generate breadcrumbs from path
function generateBreadcrumbs(path: string, t: (key: string) => string) {
  const pathMap: Record<string, string> = {
    '/ortho-dashboard': t('sidebar.home'),
    '/patients': t('sidebar.patients'),
    '/exercise-create': t('sidebar.exercises'),
    '/ortho-progress': t('sidebar.reports'),
    '/users': t('sidebar.users'),
    '/settings': t('sidebar.settings'),
    '/parent-dashboard': t('sidebar.home'),
    '/parent-progress': t('sidebar.reports'),
  };

  const segments = path.split('/').filter(Boolean);
  
  return segments.map((segment, index) => {
    const fullPath = '/' + segments.slice(0, index + 1).join('/');
    return {
      label: pathMap[fullPath] || segment,
      path: fullPath,
    };
  });
}