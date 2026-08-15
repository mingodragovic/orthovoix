// src/app/pages/UserDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useDeleteUser } from '@/hooks/useUsers';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, Edit, Trash2, Mail, Calendar, Shield, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { Role } from '@/types/api.types';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user: currentUser } = useAuth();
  const { data, isLoading, error } = useUser(id!);
  const deleteUser = useDeleteUser();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const getLocale = () => {
    switch(language) {
      case 'ar': return arSA;
      case 'en': return enUS;
      default: return fr;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch(role) {
      case 'orthophoniste': return t('auth.login.role.orthophoniste', {});
      case 'parent': return t('auth.login.role.parent', {});
      default: return role;
    }
  };

  const getRoleColor = (role: Role) => {
    switch(role) {
      case 'orthophoniste': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'parent': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleDeleteConfirm = () => {
    if (data) {
      deleteUser.mutate(data.data.id);
      setDeleteModalOpen(false);
      navigate('/users');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading', {})}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-red-500">{t('common.error', {})}</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-2 text-primary hover:underline"
          >
            {t('common.back', {})}
          </button>
        </div>
      </div>
    );
  }

  const user = data.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">{t('common.back', {})}</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/users/${user.id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            disabled={user.id === currentUser?.id}
          >
            <Edit size={16} />
            <span className="text-sm">{t('common.edit', {})}</span>
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            disabled={user.id === currentUser?.id || deleteUser.isPending}
          >
            <Trash2 size={16} />
            <span className="text-sm">{t('common.delete', {})}</span>
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-semibold flex-shrink-0">
              {user.avatar || user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {user.name}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  user.isActive 
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {user.isActive ? t('users.active', {}) : t('users.inactive', {})}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-6 border-r border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                {t('users.contactInfo', {})}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('users.email', {})}</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('users.lastLogin', {})}</p>
                    <p className="text-sm">{user.lastLogin ? formatDate(user.lastLogin) : '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('users.createdAt', {})}</p>
                    <p className="text-sm">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                {t('users.additionalInfo', {})}
              </h3>
              <div className="space-y-3">
                {user.role === 'orthophoniste' && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">{t('users.specialization', {})}</p>
                      <p className="text-sm">{user.specialization || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('users.licenseNumber', {})}</p>
                      <p className="text-sm">{user.licenseNumber || '-'}</p>
                    </div>
                  </>
                )}
                {user.role === 'parent' && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">{t('users.childName', {})}</p>
                      <p className="text-sm">{user.childName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('users.childId', {})}</p>
                      <p className="text-sm">{user.childId || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('users.delete.title', {})}
        message={t('users.delete.confirm', { name: user.name })}
        confirmText={t('common.delete', {})}
        cancelText={t('common.cancel', {})}
        type="danger"
      />
    </div>
  );
}