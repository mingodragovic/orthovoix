// src/app/pages/UsersPage.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Eye, Trash2, Edit } from 'lucide-react';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from '@/types/user.types';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { Role } from '@/types/api.types';
import { useAuth } from '@/providers/AuthProvider';
import { Column, DataTable } from '../components/ui/DataTable';
import { UserCreateModal } from '../components/users/UserCreateModal';
import { UserEditModal } from '../components/users/UserEditModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Pagination } from '../components/ui/pagination';

export function UsersPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<string | null>(null);
  
  const { data, isLoading, error, refetch } = useUsers({
    page,
    limit: 10,
    search: search || undefined,
    role: roleFilter as Role || undefined,
  });

  const deleteUser = useDeleteUser();

  const getLocale = () => {
    switch(language) {
      case 'ar': return arSA;
      case 'en': return enUS;
      default: return fr;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch(role) {
      case 'orthophoniste': return t('auth.login.role.orthophoniste');
      case 'parent': return t('auth.login.role.parent');
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

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? t('users.active') : t('users.inactive');
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditClick = (userId: string) => {
    setUserToEdit(userId);
    setEditModalOpen(true);
  };

  const columns: Column<User>[] = useMemo(() => [
    {
      key: 'name',
      header: t('users.name'),
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden flex-shrink-0">
            {user.avatar && typeof user.avatar === 'string' && user.avatar.startsWith('http') ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = user.name.charAt(0).toUpperCase();
                    parent.className = 'w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0';
                  }
                }}
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('users.role'),
      sortable: true,
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('users.status'),
      sortable: true,
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.isActive)}`}>
          {getStatusLabel(user.isActive)}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: t('users.lastLogin'),
      sortable: true,
      render: (user) => (
        <span className="text-gray-600">
          {user.lastLogin ? formatDate(user.lastLogin) : '-'}
        </span>
      ),
    },
  ], [t, getRoleLabel, getRoleColor, getStatusColor, getStatusLabel, formatDate]);

  const users = data?.data || [];
  const pagination = (data as any)?.pagination || {
    currentPage: page,
    totalPages: 1,
    total: users.length,
  };

  const filterOptions = useMemo(() => [
    { label: t('users.role.orthophoniste'), value: 'orthophoniste', field: 'role' as keyof User },
    { label: t('users.role.parent'), value: 'parent', field: 'role' as keyof User },
  ], [t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('users.title')}
          </h1>
          <p className="text-muted-foreground">{t('users.subtitle')}</p>
        </div>
        <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-2xl text-sm font-medium hover:shadow-lg active:scale-95 transition-all">
          <UserPlus size={18} />
          {t('users.add')}
        </button>
      </div>

      <DataTable<User>
        data={users}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder={t('users.search')}
        searchFields={['name', 'email']}
        filterOptions={filterOptions}
        emptyMessage={t('users.noResults')}
        actions={(user) => (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/users/${user.id}`)} className="p-1 hover:bg-gray-100 rounded" title={t('common.view')}>
              <Eye className="w-4 h-4 text-gray-500 hover:text-primary" />
            </button>
            <button onClick={() => handleEditClick(user.id)} className="p-1 hover:bg-gray-100 rounded" title={t('common.edit')} disabled={user.id === currentUser?.id}>
              <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
            </button>
            <button onClick={() => handleDeleteClick(user)} className="p-1 hover:bg-gray-100 rounded" title={t('common.delete')} disabled={user.id === currentUser?.id || deleteUser.isPending}>
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        )}
      />

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={10}
          onPageChange={setPage}
        />
      )}

      <UserCreateModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      {userToEdit && (
        <UserEditModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setUserToEdit(null); }}
          userId={userToEdit}
        />
      )}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('users.delete.title')}
        message={t('users.delete.confirm', { name: userToDelete?.name || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}