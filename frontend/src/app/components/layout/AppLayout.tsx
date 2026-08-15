// src/components/layout/AppLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useLogout } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Sidebar } from '@/app/components/common/Sidebar';
import { BottomNav } from '@/app/components/common/BottomNav';
import { Toast } from '@/app/components/common/Toast';
import { Role } from '@/types';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();


  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout.mutate();
  };

  const isParent = user?.role === 'parent';
  const showSidebar = !isMobile && !isParent && isAuthenticated;
  
  // ✅ Only show BottomNav on mobile devices
  const showBottomNav = isMobile && isAuthenticated;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col min-h-screen relative">
        <div className="flex flex-1">
          {/* Sidebar - only for orthophoniste on desktop */}
          {showSidebar && (
            <Sidebar
              active={location.pathname}
              onNavigate={(path: string) => navigate(path)}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              user={user || null}
              onLogout={handleLogout}
            />
          )}

          {/* Main Content */}
          <main
            className={`
              flex-1 transition-all duration-300
              ${isMobile ? '' : 'pb-6'}
            `}
            style={{
              marginLeft: isRTL ? '0' : (showSidebar ? (sidebarOpen ? '240px' : '72px') : '0'),
              marginRight: isRTL ? (showSidebar ? (sidebarOpen ? '240px' : '72px') : '0') : '0',
            }}
          >
            <div className={`container mx-auto px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 max-w-7xl ${isMobile ? 'pb-20' : ''}`}>
              <Outlet context={{ showToast }} />
            </div>
          </main>
        </div>

        {/* ✅ Bottom Navigation - ONLY on mobile */}
        {showBottomNav && (
          <div className="flex-shrink-0 w-full">
            <BottomNav
              role={user?.role as Role}
              active={location.pathname}
              onNavigate={(path: string) => navigate(path)}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>
    </div>
  );
}