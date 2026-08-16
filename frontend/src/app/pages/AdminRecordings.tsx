// src/app/pages/AdminRecordings.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAllPatientRecordings, useReviewRecording, useFreshRecordingUrl } from '@/hooks/useRecordings';
import { Column, DataTable } from '@/app/components/ui/DataTable';
import { RecordingResponseDto, RecordingStatus } from '@/types/recording.types';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { Pagination } from '@/app/components/ui/pagination';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Star, 
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { BaseModal } from '@/app/components/ui/BaseModal';
import { getFreshRecordingUrl } from '@/services/recording.service';

export function AdminRecordings() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<RecordingStatus>(RecordingStatus.REVIEWED);

  console.log('🟢 [AdminRecordings] Component mounted');
  console.log('🟢 [AdminRecordings] Current page:', page);

  const { data: recordingsData, isLoading, error, refetch } = useAllPatientRecordings(page);
  const reviewRecording = useReviewRecording();
  const { data: freshUrl } = useFreshRecordingUrl(selectedRecordingId || '');

  // ✅ Debug logging
  useEffect(() => {
    console.log('🔍 [AdminRecordings] recordingsData changed:', {
      hasData: !!recordingsData,
      type: typeof recordingsData,
      keys: recordingsData ? Object.keys(recordingsData) : [],
      hasItems: !!(recordingsData && recordingsData.items),
      itemsLength: recordingsData?.items?.length || 0,
      items: recordingsData?.items || [],
      total: recordingsData?.total,
      page: recordingsData?.page,
      limit: recordingsData?.limit,
      totalPages: recordingsData?.totalPages,
    });
  }, [recordingsData]);

  useEffect(() => {
    console.log('🔍 [AdminRecordings] isLoading:', isLoading);
    console.log('🔍 [AdminRecordings] error:', error);
  }, [isLoading, error]);

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

  const getStatusColor = (status: RecordingStatus) => {
    switch(status) {
      case RecordingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case RecordingStatus.REVIEWED:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case RecordingStatus.NEEDS_IMPROVEMENT:
        return 'bg-red-100 text-red-700 border-red-200';
      case RecordingStatus.GREAT:
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: RecordingStatus) => {
    switch(status) {
      case RecordingStatus.PENDING:
        return t('ortho.recordings.status.pending');
      case RecordingStatus.REVIEWED:
        return t('ortho.recordings.status.reviewed');
      case RecordingStatus.NEEDS_IMPROVEMENT:
        return t('ortho.recordings.status.needsImprovement');
      case RecordingStatus.GREAT:
        return t('ortho.recordings.status.great');
      default:
        return status;
    }
  };

  const getStatusIcon = (status: RecordingStatus) => {
    switch(status) {
      case RecordingStatus.PENDING:
        return <Clock size={14} className="text-yellow-600 animate-pulse" />;
      case RecordingStatus.REVIEWED:
        return <CheckCircle size={14} className="text-blue-600" />;
      case RecordingStatus.NEEDS_IMPROVEMENT:
        return <AlertCircle size={14} className="text-red-600" />;
      case RecordingStatus.GREAT:
        return <Star size={14} className="text-green-600 fill-green-600" />;
      default:
        return null;
    }
  };

  const handleReview = async () => {
    if (!selectedRecordingId) return;

    await reviewRecording.mutateAsync({
      recordingId: selectedRecordingId,
      data: { status, feedback },
    });

    setReviewModalOpen(false);
    setSelectedRecordingId(null);
    setFeedback('');
    refetch();
  };

  const columns: Column<RecordingResponseDto>[] = useMemo(() => [
    {
      key: 'patientExerciseId',
      header: t('recordings.patient', 'Patient'),
      sortable: true,
      render: (item) => (
        <span className="font-medium">{item.patientExerciseId}</span>
      ),
    },
    {
      key: 'recordingUrl',
      header: t('recordings.exercise', 'Exercise'),
      sortable: true,
      render: (item) => (
        <span className="text-sm">{item.recordingUrl}</span>
      ),
    },
    {
      key: 'createdAt',
      header: t('recordings.date', 'Date'),
      sortable: true,
      render: (item) => (
        <span className="text-sm">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: 'duration',
      header: t('recordings.duration', 'Duration'),
      sortable: true,
      render: (item) => (
        <span className="text-sm">{item.duration.toFixed(1)}s</span>
      ),
    },
    {
      key: 'status',
      header: t('recordings.status', 'Status'),
      sortable: true,
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          {getStatusLabel(item.status)}
        </span>
      ),
    },
    {
      key: 'feedback',
      header: t('recordings.feedback', 'Feedback'),
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-600">
          {item.feedback || '-'}
        </span>
      ),
    },
  ], [t, getStatusColor, getStatusLabel, getStatusIcon, formatDate]);

  // ✅ SIMPLE: recordingsData is now the data object directly
  const recordings = recordingsData?.items || [];
  const pagination = recordingsData || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  console.log('📊 [AdminRecordings] Final data for table:', {
    recordingsCount: recordings.length,
    recordings: recordings,
    pagination,
  });

  const filterOptions = useMemo(() => [
    { label: t('ortho.recordings.status.pending'), value: RecordingStatus.PENDING, field: 'status' as keyof RecordingResponseDto },
    { label: t('ortho.recordings.status.reviewed'), value: RecordingStatus.REVIEWED, field: 'status' as keyof RecordingResponseDto },
    { label: t('ortho.recordings.status.great'), value: RecordingStatus.GREAT, field: 'status' as keyof RecordingResponseDto },
  ], [t]);

  return (
    <div className="space-y-6">
      <Breadcrumb showBack={true} showHome={true} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('recordings.adminTitle', 'Patient Recordings')}
          </h1>
          <p className="text-muted-foreground">
            {t('recordings.adminSubtitle', 'Review all patient voice recordings')}
          </p>
        </div>
      </div>

      <DataTable<RecordingResponseDto>
        data={recordings}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder={t('recordings.search', 'Search by patient or exercise...')}
        searchFields={['recordingUrl']}
        filterOptions={filterOptions}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages || 1,
          total: pagination.total || 0,
          onPageChange: setPage,
        }}
        emptyMessage={t('recordings.noResults', 'No recordings found')}
        actions={(item) => (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const fresh = await getFreshRecordingUrl(item.id);
                const audio = new Audio(fresh.url);
                audio.play();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={t('common.play')}
            >
              <Play className="w-4 h-4 text-gray-500 hover:text-primary" />
            </button>
            {item.status === RecordingStatus.PENDING && (
              <button
                onClick={() => {
                  setSelectedRecordingId(item.id);
                  setReviewModalOpen(true);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title={t('recordings.review', 'Review')}
              >
                <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
              </button>
            )}
          </div>
        )}
      />

      {/* Review Modal */}
      <BaseModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedRecordingId(null);
          setFeedback('');
        }}
        title={t('ortho.recordings.reviewTitle', 'Review Recording')}
        size="md"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('ortho.recordings.reviewStatus', 'Status')}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RecordingStatus)}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value={RecordingStatus.REVIEWED}>
                {t('ortho.recordings.status.reviewed', 'Reviewed')}
              </option>
              <option value={RecordingStatus.NEEDS_IMPROVEMENT}>
                {t('ortho.recordings.status.needsImprovement', 'Needs Improvement')}
              </option>
              <option value={RecordingStatus.GREAT}>
                {t('ortho.recordings.status.great', 'Great!')}
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('ortho.recordings.feedbackLabel', 'Feedback')}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder={t('ortho.recordings.feedbackPlaceholder', 'Provide constructive feedback...')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleReview}
              disabled={reviewRecording.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {reviewRecording.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                  {t('common.loading')}
                </>
              ) : (
                t('ortho.recordings.submitReview', 'Submit Review')
              )}
            </button>
            <button
              onClick={() => {
                setReviewModalOpen(false);
                setSelectedRecordingId(null);
                setFeedback('');
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}