// src/app/components/common/Sidebar.tsx
import {
  Home,
  Users,
  BookOpen,
  BarChart2,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Bell,
  ClipboardList,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import { UserProfile } from '@/types/auth.types';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Avatar } from './Avatar';

interface SidebarProps {
  active: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export function Sidebar({
  active,
  onNavigate,
  isOpen,
  onToggle,
  user,
  onLogout,
}: SidebarProps) {
  const isMobile = useIsMobile();
  const { t, isRTL } = useTranslation();
  const { direction } = useLanguage();

  const menuItems = [
    {
      icon: Home,
      label: t('sidebar.home', 'Home'),
      path: '/ortho-dashboard',
    },
    {
      icon: Users,
      label: t('sidebar.patients', 'Patients'),
      path: '/patients',
    },
    {
      icon: BookOpen,
      label: t('sidebar.exercises', 'Exercises'),
      path: '/exercises',
    },
    {
      icon: ClipboardList,
      label: t('sidebar.submissions', 'Submissions'),
      path: '/admin/submissions',
    },
    {
      icon: Users,
      label: t('sidebar.users', 'Users'),
      path: '/users',
    },
    {
      icon: FileText,
      label: t('sidebar.assignments', 'Assignments'),
      path: '/patient-exercises',
    },
    {
      icon: Calendar,
      label: t('sidebar.appointments', 'Appointments'),
      path: '/appointments',
    },
    {
      icon: Bell,
      label: t('sidebar.notifications', 'Notifications'),
      path: '/notifications',
      badge: true,
    },
    {
      icon: Settings,
      label: t('sidebar.settings', 'Settings'),
      path: '/settings',
    },
  ];

  // Flip chevron icons based on RTL
  const ToggleIcon = isRTL
    ? isOpen
      ? ChevronRight
      : ChevronLeft
    : isOpen
    ? ChevronLeft
    : ChevronRight;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onToggle} />
      )}

      <aside
        className={`
          fixed top-0 h-full bg-white border-r border-border
          transition-all duration-300 ease-in-out z-50
          ${isOpen ? 'w-[240px]' : 'w-[72px]'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isMobile && isOpen ? 'translate-x-0' : ''}
          ${isRTL ? 'right-0 border-l border-r-0' : 'left-0'}
          flex flex-col
          ${isMobile ? 'shadow-2xl' : ''}
        `}
      >
        {/* Logo - Centered in all states */}
        <div className="w-full flex justify-center px-4 py-4">
          <img
            src="/ortho-voix.png"
            alt={t('app.title', 'OrthoVoix')}
            className={`object-contain transition-all duration-300 ${
              isOpen ? 'w-10 h-10' : 'w-8 h-8'
            }`}
          />
        </div>

        {/* User Info */}
        {user && isOpen && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                  <img 
                    src={user.avatar} 
                    alt={user.name || t('common.user', 'User')}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">${user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>`;
                      }
                    }}
                  />
                </div>
              ) : (
                <Avatar initials={user?.name?.charAt(0)?.toUpperCase() || 'U'} size={36} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = active === item.path;

            return (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.path);
                  if (isMobile) onToggle();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 mb-1
                  ${isActive
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                  ${!isOpen ? 'justify-center' : ''}
                `}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => onNavigate('/settings')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-muted-foreground hover:bg-muted hover:text-foreground
              transition-all duration-200
              ${!isOpen ? 'justify-center' : ''}
            `}
          >
            <Settings size={20} className="flex-shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium">{t('sidebar.settings', 'Settings')}</span>
            )}
          </button>
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-red-500 hover:bg-red-50
              transition-all duration-200 mt-1
              ${!isOpen ? 'justify-center' : ''}
            `}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium">{t('sidebar.logout', 'Logout')}</span>
            )}
          </button>
        </div>

        {/* Toggle button - desktop only */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className={`
              absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-border shadow-md flex items-center justify-center hover:bg-muted transition-all
              ${isRTL ? '-left-3 right-auto' : ''}
            `}
            aria-label={isOpen ? t('sidebar.collapse', 'Collapse sidebar') : t('sidebar.expand', 'Expand sidebar')}
          >
            <ToggleIcon size={14} />
          </button>
        )}
      </aside>
    </>
  );
}