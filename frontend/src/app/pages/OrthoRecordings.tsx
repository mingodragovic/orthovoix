// src/app/pages/OrthoRecordings.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { usePatientRecordings, useReviewRecording, useFreshRecordingUrl } from '@/hooks/useRecordings';
import { usePatient } from '@/hooks/usePatients';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Play, CheckCircle, Star, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { RecordingStatus } from '@/types/recording.types';
import { BaseModal } from '@/app/components/ui/BaseModal';
import { getFreshRecordingUrl } from '@/services/recording.service';

export function OrthoRecordings() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<RecordingStatus>(RecordingStatus.REVIEWED);

  console.log('🟢 [OrthoRecordings] Component mounted with patientId:', patientId);
  console.log('🟢 [OrthoRecordings] Current page:', page);

  const { data: patient } = usePatient(patientId || '');
  const { data: recordingsData, isLoading, refetch } = usePatientRecordings(patientId || '', page);
  const reviewRecording = useReviewRecording();
  const { data: freshUrl } = useFreshRecordingUrl(selectedRecordingId || '');

  // ✅ Debug logging
  useEffect(() => {
    console.log('🔍 [OrthoRecordings] recordingsData changed:', {
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

  const handleReview = async () => {
    console.log('🔴 [OrthoRecordings] handleReview called with recordingId:', selectedRecordingId);

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

  const getStatusColor = (status: RecordingStatus) => {
    switch(status) {
      case RecordingStatus.PENDING:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case RecordingStatus.REVIEWED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case RecordingStatus.NEEDS_IMPROVEMENT:
        return 'bg-red-50 text-red-700 border-red-200';
      case RecordingStatus.GREAT:
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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

  if (isLoading) {
    console.log('⏳ [OrthoRecordings] Loading...');
    return <LoadingSpinner />;
  }

  const recordings = recordingsData?.items || [];
  const totalPages = recordingsData?.totalPages || 1;

  console.log('📊 [OrthoRecordings] Final data for list:', {
    recordingsCount: recordings.length,
    recordings: recordings,
    totalPages,
  });

  const pendingCount = recordings.filter((r) => r.status === RecordingStatus.PENDING).length;
  const reviewedCount = recordings.filter((r) => r.status === RecordingStatus.REVIEWED).length;
  const greatCount = recordings.filter((r) => r.status === RecordingStatus.GREAT).length;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/patients/${patientId}`)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('ortho.recordings.title', 'Recordings')}
          </h1>
          <p className="text-sm text-gray-500">
            {patient?.data?.fullName} — {t('ortho.recordings.subtitle', 'Review patient recordings')}
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <Clock size={16} className="text-yellow-600 animate-pulse" />
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <p className="text-xs text-gray-500">{t('ortho.recordings.pending', 'Pending')}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <Star size={16} className="text-green-600 fill-green-600" />
            <p className="text-2xl font-bold text-green-600">{greatCount}</p>
          </div>
          <p className="text-xs text-gray-500">{t('ortho.recordings.great', 'Great')}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle size={16} className="text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{reviewedCount}</p>
          </div>
          <p className="text-xs text-gray-500">{t('ortho.recordings.reviewed', 'Reviewed')}</p>
        </div>
      </div>

      {/* Recordings List */}
      {recordings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎧</div>
          <h3 className="text-lg font-semibold mb-2">
            {t('ortho.recordings.empty', 'No recordings yet')}
          </h3>
          <p className="text-gray-500 text-sm">
            {t('ortho.recordings.emptyDescription', 'Wait for your patients to submit recordings.')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {recording.exerciseTitle}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(recording.status)}`}
                    >
                      {getStatusIcon(recording.status)}
                      {getStatusLabel(recording.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {new Date(recording.createdAt).toLocaleDateString()}</span>
                    <span>⏱️ {recording.duration.toFixed(1)}s</span>
                  </div>
                  {recording.feedback && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                      💬 {recording.feedback}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      console.log('🎵 [OrthoRecordings] Playing recording:', recording.id);
                      const fresh = await getFreshRecordingUrl(recording.id);
                      const audio = new Audio(fresh.url);
                      audio.play();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title={t('common.play', 'Play')}
                  >
                    <Play size={18} className="text-gray-600" />
                  </button>
                  {recording.status === RecordingStatus.PENDING && (
                    <button
                      onClick={() => {
                        console.log('📝 [OrthoRecordings] Opening review modal for:', recording.id);
                        setSelectedRecordingId(recording.id);
                        setReviewModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                      {t('ortho.recordings.review', 'Review')}
                    </button>
                  )}
                  {recording.status !== RecordingStatus.PENDING && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm">
                      {t('common.done', 'Done')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <BaseModal
        isOpen={reviewModalOpen}
        onClose={() => {
          console.log('🔴 [OrthoRecordings] Review modal closed');
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