// src/app/pages/ParentProfile.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/providers/AuthProvider';
import { useLogout } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { ChildHeader } from '../components/parent/ChildHeader';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { User, Bell, Calendar, LogOut, ChevronRight } from 'lucide-react';

export function ParentProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const logout = useLogout();
  const { data: profile, isLoading } = useProfile();
  const { data: dashboard } = useParentDashboard();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const child = dashboard?.child;

  const menuItems = [
    {
      icon: User,
      label: t('parent.profile.settings', 'Profile Settings'),
      path: '/settings',
    },
    {
      icon: Bell,
      label: t('parent.profile.notifications', 'Notifications'),
      path: '/parent/notifications',
    },
    {
      icon: Calendar,
      label: t('parent.profile.appointments', 'Appointments'),
      path: '/parent/appointments',
    },
  ];

  return (
<div className="space-y-6 pb-20 mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('parent.profile.title', 'Profile')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('parent.profile.subtitle', 'Manage your account')}
        </p>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              profile?.name?.charAt(0) || 'P'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{profile?.name}</p>
            <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Child Info */}
      {child && (
        <ChildHeader
          firstName={child.firstName}
          lastName={child.lastName}
          age={child.age}
          status={child.status}
          avatar={child.avatar}
        />
      )}

      {/* Menu Items */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
              index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <item.icon size={16} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => logout.mutate()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
      >
        <LogOut size={16} />
        {t('sidebar.logout')}
      </button>
    </div>
  );
}