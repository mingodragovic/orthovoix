// src/app/pages/PatientExerciseAssignments.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllAssignments } from '@/hooks/usePatientExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { Column, DataTable } from '../components/ui/DataTable';
import { PatientExercise, PatientExerciseStatus, PriorityLevel } from '@/types/patient-exercise.types';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Pagination } from '../components/ui/pagination';
import { Eye, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';

export function PatientExerciseAssignments() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useAllAssignments(
    page,
    10,
    statusFilter as PatientExerciseStatus || undefined
  );

  const getLocale = () => {
    switch(language) {
      case 'ar': return arSA;
      case 'en': return enUS;
      default: return fr;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: PatientExerciseStatus) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: PatientExerciseStatus) => {
    switch(status) {
      case 'completed': return t('patientExercises.status.completed');
      case 'in-progress': return t('patientExercises.status.inProgress');
      case 'assigned': return t('patientExercises.status.assigned');
      case 'overdue': return t('patientExercises.status.overdue');
      case 'cancelled': return t('patientExercises.status.cancelled');
      default: return status;
    }
  };

  const getStatusIcon = (status: PatientExerciseStatus) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'assigned': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityLabel = (priority: PriorityLevel) => {
    switch(priority) {
      case 'high': return t('patientExercises.priority.high');
      case 'medium': return t('patientExercises.priority.medium');
      case 'low': return t('patientExercises.priority.low');
      default: return priority;
    }
  };

  const columns: Column<PatientExercise>[] = useMemo(() => [
    {
      key: 'patientName',
      header: t('patientExercises.patient'),
      sortable: true,
      render: (item) => (
        <span className="font-medium">{item.patientName}</span>
      ),
    },
    {
      key: 'exerciseTitle',
      header: t('patientExercises.exercise'),
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium">{item.exerciseTitle}</div>
          <div className="text-xs text-gray-500">{t(`exercises.category.${item.exerciseCategory}`)}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('patientExercises.status'),
      sortable: true,
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          {getStatusLabel(item.status)}
        </span>
      ),
    },
    {
      key: 'priority',
      header: t('patientExercises.priority'),
      sortable: true,
      render: (item) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
          {getPriorityLabel(item.priority)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: t('patientExercises.dueDate'),
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">
          {formatDate(item.dueDate)}
        </span>
      ),
    },
    {
      key: 'assignerName',
      header: t('patientExercises.assignedBy'),
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">
          {item.assignerName}
        </span>
      ),
    },
  ], [t, getStatusColor, getStatusLabel, getStatusIcon, getPriorityColor, getPriorityLabel, formatDate]);

  const assignments = data?.data?.items || [];
  const pagination = data?.data || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const filterOptions = useMemo(() => [
    { label: t('patientExercises.status.assigned'), value: 'assigned', field: 'status' as keyof PatientExercise },
    { label: t('patientExercises.status.inProgress'), value: 'in-progress', field: 'status' as keyof PatientExercise },
    { label: t('patientExercises.status.completed'), value: 'completed', field: 'status' as keyof PatientExercise },
    { label: t('patientExercises.status.overdue'), value: 'overdue', field: 'status' as keyof PatientExercise },
    { label: t('patientExercises.status.cancelled'), value: 'cancelled', field: 'status' as keyof PatientExercise },
  ], [t]);

  return (
    <div className="space-y-6">
      <Breadcrumb showBack={true} showHome={true} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('patientExercises.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('patientExercises.subtitle')}
          </p>
        </div>
      </div>

      <DataTable<PatientExercise>
        data={assignments}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder={t('patientExercises.search')}
        searchFields={['patientName', 'exerciseTitle']}
        filterOptions={filterOptions}
        emptyMessage={t('patientExercises.noResults')}
        actions={(item) => (
          <button
            onClick={() => navigate(`/patient-exercises/${item.id}`)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={t('common.view')}
          >
            <Eye className="w-4 h-4 text-gray-500 hover:text-primary" />
          </button>
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
    </div>
  );
}