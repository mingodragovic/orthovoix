// src/app/components/common/BottomNav.tsx
import { Home, Users, BookOpen, ClipboardList, User, LogOut, Calendar, Bell } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocation } from 'react-router-dom';
import { Role } from '@/types/api.types';

interface BottomNavProps {
  role: Role;
  active: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export function BottomNav({ role, active, onNavigate, onLogout }: BottomNavProps) {
  const { t, isRTL } = useTranslation();
  const { direction } = useLanguage();
  const location = useLocation();

  const orthoItems = [
    { icon: Home, label: t('bottomNav.home'), path: '/ortho-dashboard' },
    { icon: Users, label: t('bottomNav.patients'), path: '/patients' },
    { icon: BookOpen, label: t('bottomNav.exercises'), path: '/exercises' },
    { icon: ClipboardList, label: t('bottomNav.submissions'), path: '/admin/submissions' },
  ];

  const parentItems = [
    { icon: Home, label: t('bottomNav.home'), path: '/parent' },
    { icon: BookOpen, label: t('bottomNav.exercises'), path: '/parent/exercises' },
    { icon: Calendar, label: t('bottomNav.appointments'), path: '/parent/appointments' },
    { icon: ClipboardList, label: t('bottomNav.submissions'), path: '/parent/submissions' },
    { icon: User, label: t('bottomNav.profile'), path: '/parent/profile' },
  ];

  const items = role === 'orthophoniste' ? orthoItems : parentItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around items-center h-16 z-50 px-2"
      style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {items.map((item) => {
        const isActive = active === item.path || location.pathname.startsWith(item.path);
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.path)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 transition-all relative"
            style={{ color: isActive ? '#4A90D9' : '#718096' }}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {isActive && (
              <div className="absolute -top-0.5 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        );
      })}

      {/* Logout button on mobile */}
      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-0.5 px-2 py-1 transition-all text-red-500"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium">{t('bottomNav.logout')}</span>
      </button>
    </nav>
  );
}