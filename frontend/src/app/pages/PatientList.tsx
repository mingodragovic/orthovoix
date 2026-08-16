// src/app/pages/PatientList.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { useMyPatients, useDeletePatient } from '@/hooks/usePatients';
import { useTranslation } from '@/hooks/useTranslation';
import { Patient, PatientStatus } from '@/types/patient.types';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { useAuth } from '@/providers/AuthProvider';
import { Column, DataTable } from '../components/ui/DataTable';
import { PatientCreateModal } from '../components/patients/PatientCreateModal';
import { PatientEditModal } from '../components/patients/PatientEditModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Pagination } from '../components/ui/pagination';

export function PatientList() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [patientToEdit, setPatientToEdit] = useState<string | null>(null);
  
  const { data, isLoading, error, refetch } = useMyPatients({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter as PatientStatus || undefined,
  });

  const deletePatient = useDeletePatient();

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

  const getStatusColor = (status: PatientStatus) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'discharged': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: PatientStatus) => {
    switch(status) {
      case 'active': return t('patients.status.active');
      case 'inactive': return t('patients.status.inactive');
      case 'discharged': return t('patients.status.discharged');
      default: return status;
    }
  };

  const getGenderLabel = (gender: string) => {
    switch(gender) {
      case 'male': return t('patients.gender.male');
      case 'female': return t('patients.gender.female');
      case 'other': return t('patients.gender.other');
      default: return gender;
    }
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (patientToDelete) {
      deletePatient.mutate(patientToDelete.id);
      setDeleteModalOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleEditClick = (patientId: string) => {
    setPatientToEdit(patientId);
    setEditModalOpen(true);
  };

  const columns: Column<Patient>[] = useMemo(() => [
    {
      key: 'fullName',
      header: t('patients.name'),
      sortable: true,
      render: (patient) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{patient.fullName}</div>
            <div className="text-xs text-gray-500">{patient.age} {t('patients.age')}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'gender',
      header: t('patients.gender'),
      sortable: true,
      render: (patient) => (
        <span className="text-sm text-gray-700">
          {getGenderLabel(patient.gender)}
        </span>
      ),
    },
    {
      key: 'diagnosis',
      header: t('patients.diagnosis'),
      sortable: true,
      render: (patient) => (
        <span className="text-sm text-gray-700">
          {patient.diagnosis || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('patients.status'),
      sortable: true,
      render: (patient) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
          {getStatusLabel(patient.status)}
        </span>
      ),
    },
    {
      key: 'therapyFrequency',
      header: t('patients.therapyFrequency'),
      sortable: true,
      render: (patient) => (
        <span className="text-sm text-gray-700">
          {patient.therapyFrequency || '-'}
        </span>
      ),
    },
  ], [t, getStatusColor, getStatusLabel, getGenderLabel]);

  const patients = data?.data?.items || [];
  const pagination = data?.data || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const filterOptions = useMemo(() => [
    { label: t('patients.status.active'), value: 'active', field: 'status' as keyof Patient },
    { label: t('patients.status.inactive'), value: 'inactive', field: 'status' as keyof Patient },
    { label: t('patients.status.discharged'), value: 'discharged', field: 'status' as keyof Patient },
  ], [t]);

  return (
    <div className="space-y-6">
      <Breadcrumb showBack={true} showHome={true} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('patients.title')}
          </h1>
          <p className="text-muted-foreground">{t('patients.subtitle')}</p>
        </div>
        <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-2xl text-sm font-medium hover:shadow-lg active:scale-95 transition-all">
          <UserPlus size={18} />
          {t('patients.add')}
        </button>
      </div>

      <DataTable<Patient>
        data={patients}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder={t('patients.search')}
        searchFields={['firstName', 'lastName', 'fullName']}
        filterOptions={filterOptions}
        emptyMessage={t('patients.noResults')}
        actions={(patient) => (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/patients/${patient.id}`)} className="p-1 hover:bg-gray-100 rounded" title={t('common.view')}>
              <Eye className="w-4 h-4 text-gray-500 hover:text-primary" />
            </button>
            <button onClick={() => handleEditClick(patient.id)} className="p-1 hover:bg-gray-100 rounded" title={t('common.edit')}>
              <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
            </button>
            <button onClick={() => handleDeleteClick(patient)} className="p-1 hover:bg-gray-100 rounded" title={t('common.delete')} disabled={deletePatient.isPending}>
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        )}
      />

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={setPage}
        />
      )}

      <PatientCreateModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={() => refetch()} />
      {patientToEdit && (
        <PatientEditModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setPatientToEdit(null); }}
          patientId={patientToEdit}
          onSuccess={() => refetch()}
        />
      )}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('patients.delete.title')}
        message={t('patients.delete.confirm', { name: patientToDelete?.fullName || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        isLoading={deletePatient.isPending}
      />
    </div>
  );
}