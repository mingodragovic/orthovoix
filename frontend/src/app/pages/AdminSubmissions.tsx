// src/app/pages/AdminSubmissions.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAllSubmissions, useDeleteSubmission } from '@/hooks/useSubmissions';
import { Column, DataTable } from '@/app/components/ui/DataTable';
import { Submission, SubmissionStatus } from '@/types/submission.types';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { Pagination } from '@/app/components/ui/pagination';
import { 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Mic,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { ConfirmationModal } from '@/app/components/ui/ConfirmationModal';

export function AdminSubmissions() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const { data, isLoading, error, refetch } = useAllSubmissions(page, 10, statusFilter as SubmissionStatus || undefined);
  const deleteSubmission = useDeleteSubmission();

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

  const getStatusColor = (status: SubmissionStatus) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'needs-improvement': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: SubmissionStatus) => {
    switch(status) {
      case 'pending': return t('submissions.status.pending', 'Pending');
      case 'reviewed': return t('submissions.status.reviewed', 'Reviewed');
      case 'approved': return t('submissions.status.approved', 'Approved');
      case 'rejected': return t('submissions.status.rejected', 'Rejected');
      case 'needs-improvement': return t('submissions.status.needs-improvement', 'Needs Improvement');
      default: return status;
    }
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch(status) {
      case 'pending': return <Clock size={14} className="text-yellow-600 animate-pulse" />;
      case 'reviewed': return <CheckCircle size={14} className="text-blue-600" />;
      case 'approved': return <CheckCircle size={14} className="text-green-600" />;
      case 'rejected': return <XCircle size={14} className="text-red-600" />;
      case 'needs-improvement': return <AlertCircle size={14} className="text-orange-600" />;
      default: return null;
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedSubmission) {
      deleteSubmission.mutate(selectedSubmission.id);
      setDeleteModalOpen(false);
      setSelectedSubmission(null);
    }
  };

  const columns: Column<Submission>[] = useMemo(() => [
    {
      key: 'patientName',
      header: t('submissions.patient', 'Patient'),
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="font-medium">{item.patientName}</span>
        </div>
      ),
    },
    {
      key: 'exerciseTitle',
      header: t('submissions.exercise', 'Exercise'),
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium">{item.exerciseTitle}</div>
          <div className="text-xs text-gray-500">{item.submitterName}</div>
        </div>
      ),
    },
    {
      key: 'submittedAt',
      header: t('submissions.submittedAt', 'Submitted'),
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">{formatDate(item.submittedAt)}</span>
      ),
    },
    {
      key: 'status',
      header: t('submissions.status', 'Status'),
      sortable: true,
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          {getStatusLabel(item.status)}
        </span>
      ),
    },
    {
      key: 'answers',
      header: t('submissions.recordings', 'Recordings'),
      sortable: false,
      render: (item) => (
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <Mic size={14} />
          {item.answers.length}
        </span>
      ),
    },
  ], [t, getStatusColor, getStatusLabel, getStatusIcon, formatDate]);

  const submissions = data?.items || [];
  const pagination = data || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const filterOptions = useMemo(() => [
    { label: t('submissions.status.pending'), value: 'pending', field: 'status' as keyof Submission },
    { label: t('submissions.status.reviewed'), value: 'reviewed', field: 'status' as keyof Submission },
    { label: t('submissions.status.approved'), value: 'approved', field: 'status' as keyof Submission },
    { label: t('submissions.status.rejected'), value: 'rejected', field: 'status' as keyof Submission },
    { label: t('submissions.status.needs-improvement'), value: 'needs-improvement', field: 'status' as keyof Submission },
  ], [t]);

  return (
    <div className="space-y-6">
      <Breadcrumb showBack={true} showHome={true} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('submissions.adminTitle', 'Submissions')}
          </h1>
          <p className="text-muted-foreground">
            {t('submissions.adminSubtitle', 'Review all patient exercise submissions')}
          </p>
        </div>
      </div>

      <DataTable<Submission>
        data={submissions}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder={t('submissions.search', 'Search by patient or exercise...')}
        searchFields={['patientName', 'exerciseTitle']}
        filterOptions={filterOptions}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages || 1,
          total: pagination.total || 0,
          onPageChange: setPage,
        }}
        emptyMessage={t('submissions.noResults', 'No submissions found')}
        actions={(item) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/admin/submissions/${item.id}`)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={t('common.view')}
            >
              <Eye className="w-4 h-4 text-gray-500 hover:text-primary" />
            </button>
            <button
              onClick={() => {
                setSelectedSubmission(item);
                setDeleteModalOpen(true);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={t('common.delete')}
              disabled={deleteSubmission.isPending}
            >
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        )}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('submissions.deleteTitle', 'Delete Submission')}
        message={t('submissions.deleteConfirm', 'Are you sure you want to delete this submission?')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        isLoading={deleteSubmission.isPending}
      />
    </div>
  );
}