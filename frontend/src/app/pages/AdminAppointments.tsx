// src/app/pages/AdminAppointments.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAllAppointments, useDeleteAppointment } from '@/hooks/useAppointments';
import { Column, DataTable } from '@/app/components/ui/DataTable';
import { Appointment, AppointmentStatus, AppointmentType } from '@/types/appointment.types';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { Pagination } from '@/app/components/ui/Pagination';
import { 
  Eye, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Clock, 
  Video, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { ConfirmationModal } from '@/app/components/ui/ConfirmationModal';
import { AppointmentCreateModal } from '../components/parent/AppointmentCreateModal';
import { AppointmentEditModal } from '../components/appointments/AppointmentEditModal';


export function AdminAppointments() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { data, isLoading, error, refetch } = useAllAppointments(page, 10, statusFilter || undefined);
  const deleteAppointment = useDeleteAppointment();

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

  const getStatusColor = (status: AppointmentStatus) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch(status) {
      case 'scheduled': return t('appointments.status.scheduled');
      case 'in-progress': return t('appointments.status.in-progress');
      case 'completed': return t('appointments.status.completed');
      case 'cancelled': return t('appointments.status.cancelled');
      case 'no-show': return t('appointments.status.no-show');
      default: return status;
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch(status) {
      case 'scheduled': return <Clock size={14} className="text-blue-600" />;
      case 'in-progress': return <Clock size={14} className="text-yellow-600 animate-pulse" />;
      case 'completed': return <CheckCircle size={14} className="text-green-600" />;
      case 'cancelled': return <XCircle size={14} className="text-red-600" />;
      case 'no-show': return <AlertCircle size={14} className="text-gray-600" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: AppointmentType) => {
    switch(type) {
      case 'initial-assessment': return t('appointments.type.initial-assessment');
      case 'follow-up': return t('appointments.type.follow-up');
      case 'therapy-session': return t('appointments.type.therapy-session');
      case 'progress-review': return t('appointments.type.progress-review');
      case 'other': return t('appointments.type.other');
      default: return type;
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedAppointment) {
      deleteAppointment.mutate(selectedAppointment.id);
      setDeleteModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const columns: Column<Appointment>[] = useMemo(() => [
    {
      key: 'patientName',
      header: t('appointments.patient', 'Patient'),
      sortable: true,
      render: (item) => (
        <span className="font-medium">{item.patientName}</span>
      ),
    },
    {
      key: 'dateTime',
      header: t('appointments.dateTime', 'Date & Time'),
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm">{formatDate(item.dateTime)}</span>
          <span className="text-xs text-gray-500">{item.duration} {t('appointments.minutes', 'min')}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: t('appointments.type', 'Type'),
      sortable: true,
      render: (item) => (
        <span className="text-sm">{getTypeLabel(item.type)}</span>
      ),
    },
    {
      key: 'status',
      header: t('appointments.status', 'Status'),
      sortable: true,
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          {getStatusLabel(item.status)}
        </span>
      ),
    },
    {
      key: 'location',
      header: t('appointments.location', 'Location'),
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1 text-sm">
          {item.isVirtual ? (
            <>
              <Video size={14} className="text-blue-600" />
              <span className="text-blue-600">{t('appointments.virtual', 'Virtual')}</span>
            </>
          ) : item.location ? (
            <>
              <MapPin size={14} className="text-gray-600" />
              <span>{item.location}</span>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
  ], [t, getStatusColor, getStatusLabel, getStatusIcon, getTypeLabel, formatDate]);

  const appointments = data?.items || [];
  const pagination = data || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const filterOptions = useMemo(() => [
    { label: t('appointments.status.scheduled'), value: 'scheduled', field: 'status' as keyof Appointment },
    { label: t('appointments.status.in-progress'), value: 'in-progress', field: 'status' as keyof Appointment },
    { label: t('appointments.status.completed'), value: 'completed', field: 'status' as keyof Appointment },
    { label: t('appointments.status.cancelled'), value: 'cancelled', field: 'status' as keyof Appointment },
    { label: t('appointments.status.no-show'), value: 'no-show', field: 'status' as keyof Appointment },
  ], [t]);

  return (
    <div className="space-y-6">
      <Breadcrumb showBack={true} showHome={true} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('appointments.adminTitle', 'All Appointments')}
          </h1>
          <p className="text-muted-foreground">
            {t('appointments.adminSubtitle', 'Manage all therapy sessions')}
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-2xl text-sm font-medium hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus size={18} />
          {t('appointments.create', 'New Appointment')}
        </button>
      </div>

      <DataTable<Appointment>
        data={appointments}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder={t('appointments.search', 'Search by patient...')}
        searchFields={['patientName']}
        filterOptions={filterOptions}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages || 1,
          total: pagination.total || 0,
          onPageChange: setPage,
        }}
        emptyMessage={t('appointments.noResults', 'No appointments found')}
        actions={(item) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/appointments/${item.id}`)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={t('common.view')}
            >
              <Eye className="w-4 h-4 text-gray-500 hover:text-primary" />
            </button>
            <button
              onClick={() => {
                setSelectedAppointment(item);
                setEditModalOpen(true);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={t('common.edit')}
            >
              <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
            </button>
            <button
              onClick={() => {
                setSelectedAppointment(item);
                setDeleteModalOpen(true);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={t('common.delete')}
              disabled={deleteAppointment.isPending}
            >
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        )}
      />

      {/* Modals */}
      <AppointmentCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {selectedAppointment && (
        <AppointmentEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={() => refetch()}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('appointments.deleteTitle', 'Delete Appointment')}
        message={t('appointments.deleteConfirm', 'Are you sure you want to delete this appointment?')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        isLoading={deleteAppointment.isPending}
      />
    </div>
  );
}