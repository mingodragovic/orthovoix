// src/app/pages/AdminSubmissionDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSubmission, useUpdateSubmissionStatus } from '@/hooks/useSubmissions';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { BaseModal } from '@/app/components/ui/BaseModal';
import { useToast } from '@/hooks/useToast';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  Mic, 
  Play,
  CheckCircle,
  AlertCircle,
  Send,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  Award,
  CheckCircle2,
  Music,
  Image
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { SubmissionStatus } from '@/types/submission.types';
import { apiClient } from '@/lib/api/client';

export function AdminSubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { success, error: showError } = useToast();
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus>('reviewed');
  const [reviewNotes, setReviewNotes] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const { data: submission, isLoading, error, refetch } = useSubmission(id!);
  const updateStatus = useUpdateSubmissionStatus(id!);

  console.log('🔍 AdminSubmissionDetail - submission:', submission);

  const getLocale = () => {
    switch(language) {
      case 'ar': return arSA;
      case 'en': return enUS;
      default: return fr;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
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
      case 'pending': return <Clock size={20} className="text-yellow-600 animate-pulse" />;
      case 'reviewed': return <CheckCircle size={20} className="text-blue-600" />;
      case 'approved': return <ThumbsUp size={20} className="text-green-600" />;
      case 'rejected': return <ThumbsDown size={20} className="text-red-600" />;
      case 'needs-improvement': return <AlertCircle size={20} className="text-orange-600" />;
      default: return null;
    }
  };

  const handleReview = async () => {
    await updateStatus.mutateAsync({
      status: selectedStatus,
      reviewNotes: reviewNotes.trim() || undefined,
    });
    setReviewModalOpen(false);
    setReviewNotes('');
    success(t('submissions.review.success', 'Review submitted successfully'));
    refetch();
  };

  const handlePlayAudio = async (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      setPlayingAudio(null);
      return;
    }

    try {
      const audio = new Audio(audioUrl);
      setPlayingAudio(audioUrl);
      audio.play();
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        setPlayingAudio(null);
        showError(t('submissions.audioError', 'Failed to play audio'));
      };
    } catch (err) {
      showError(t('submissions.audioError', 'Failed to load audio'));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    console.error('❌ Error loading submission:', error);
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
        <button onClick={() => navigate('/admin/submissions')} className="mt-2 text-primary hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  // ✅ Handle both cases: submission is the data directly or wrapped
  const submissionData = submission?.data || submission;

  if (!submissionData) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No submission data found</p>
        <button onClick={() => navigate('/admin/submissions')} className="mt-2 text-primary hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  console.log('🔍 AdminSubmissionDetail - submissionData:', submissionData);

  const answers = submissionData.answers || [];
  const canReview = submissionData.status === 'pending';
  const isApproved = submissionData.status === 'approved';
  const isRejected = submissionData.status === 'rejected' || submissionData.status === 'needs-improvement';
  const totalDuration = answers.reduce((sum: number, a: any) => sum + (a.duration || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-20">
      <Breadcrumb 
        showBack={true} 
        showHome={true}
        items={[
          { label: t('submissions.adminTitle', 'Submissions'), path: '/admin/submissions' },
          { label: submissionData.exerciseTitle || 'Submission', path: `/admin/submissions/${submissionData.id}` }
        ]}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {submissionData.exerciseTitle || 'Submission'}
          </h1>
          <p className="text-sm text-gray-500">
            {t('submissions.detail.subtitle', 'Submission details')}
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(submissionData.status)}`}>
          {getStatusIcon(submissionData.status)}
          {getStatusLabel(submissionData.status)}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">{t('submissions.detail.patient', 'Patient')}</p>
          <p className="font-medium flex items-center gap-1 truncate">
            <User size={14} className="text-gray-400 flex-shrink-0" />
            {submissionData.patientName || 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">{t('submissions.detail.submitted', 'Submitted')}</p>
          <p className="font-medium text-sm">{formatDate(submissionData.submittedAt || submissionData.createdAt)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">{t('submissions.detail.recordings', 'Recordings')}</p>
          <p className="font-medium">{answers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">{t('submissions.detail.submittedBy', 'Submitted By')}</p>
          <p className="font-medium text-sm truncate">{submissionData.submitterName || 'Unknown'}</p>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">{t('submissions.detail.exercise', 'Exercise')}</p>
          <p className="font-medium text-sm truncate">{submissionData.exerciseTitle || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">{t('submissions.detail.totalDuration', 'Total Duration')}</p>
          <p className="font-medium text-sm">{totalDuration.toFixed(1)}s</p>
        </div>
        {submissionData.reviewedAt && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">{t('submissions.detail.reviewed', 'Reviewed')}</p>
            <p className="font-medium text-sm">{formatDate(submissionData.reviewedAt)}</p>
          </div>
        )}
      </div>

      {/* Answers / Recordings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Mic size={16} />
            {t('submissions.detail.recordings', 'Recordings')} ({answers.length})
          </h2>
          {answers.length > 0 && (
            <span className="text-xs text-gray-500">
              {t('submissions.detail.totalDuration', 'Total')}: {totalDuration.toFixed(1)}s
            </span>
          )}
        </div>
        {answers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">{t('submissions.detail.noRecordings', 'No recordings found')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {answers.map((answer: any, index: number) => {
              const audioUrl = answer.recordedAudioUrl;
              const isPlaying = playingAudio === audioUrl;
              const slideName = answer.slideName || `Slide ${answer.slideIndex !== undefined ? answer.slideIndex + 1 : index + 1}`;
              
              return (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0">
                          {answer.slideIndex !== undefined ? answer.slideIndex + 1 : index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {slideName}
                            </p>
                            {answer.slideIndex !== undefined && (
                              <span className="text-xs text-gray-400">
                                (#{answer.slideIndex + 1})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {answer.duration ? answer.duration.toFixed(1) : '0'}s
                            </span>
                            {answer.notes && (
                              <span className="text-gray-400">• {answer.notes}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {audioUrl ? (
                      <button
                        onClick={() => handlePlayAudio(audioUrl)}
                        className={`p-3 rounded-full transition-all flex-shrink-0 ${
                          isPlaying
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-md'
                        }`}
                        title={t('common.play')}
                      >
                        {isPlaying ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play size={18} />
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">No audio</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Metadata */}
      {submissionData.metadata && Object.keys(submissionData.metadata).length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-xs font-medium text-gray-500 mb-2">{t('submissions.detail.metadata', 'Metadata')}</h3>
          <div className="space-y-1 text-xs text-gray-600">
            {submissionData.metadata.deviceInfo && (
              <p><span className="text-gray-400">Device:</span> {submissionData.metadata.deviceInfo}</p>
            )}
            {submissionData.metadata.browserInfo && (
              <p><span className="text-gray-400">Browser:</span> {submissionData.metadata.browserInfo}</p>
            )}
            {submissionData.metadata.ipAddress && (
              <p><span className="text-gray-400">IP:</span> {submissionData.metadata.ipAddress}</p>
            )}
            {submissionData.metadata.submittedAt && (
              <p><span className="text-gray-400">Submitted at:</span> {formatDate(submissionData.metadata.submittedAt)}</p>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {submissionData.notes && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-xs font-medium text-gray-500 mb-1">{t('submissions.detail.notes', 'Notes')}</h3>
          <p className="text-sm text-gray-700">{submissionData.notes}</p>
        </div>
      )}

      {/* Review Notes */}
      {submissionData.reviewNotes && (
        <div className={`rounded-xl p-4 border ${
          isApproved 
            ? 'bg-green-50 border-green-100' 
            : isRejected 
              ? 'bg-red-50 border-red-100' 
              : 'bg-blue-50 border-blue-100'
        }`}>
          <h3 className="text-xs font-medium flex items-center gap-1 mb-1">
            <MessageSquare size={14} className={
              isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : 'text-blue-600'
            } />
            {t('submissions.detail.feedback', 'Feedback from Therapist')}
          </h3>
          <p className={`text-sm ${
            isApproved ? 'text-green-800' : isRejected ? 'text-red-800' : 'text-blue-800'
          }`}>
            {submissionData.reviewNotes}
          </p>
          {submissionData.reviewerName && (
            <p className="text-xs mt-1 text-gray-500">
              {t('submissions.detail.reviewedBy', 'Reviewed by')}: {submissionData.reviewerName}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {canReview && (
        <button
          onClick={() => setReviewModalOpen(true)}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Send size={18} />
          {t('submissions.detail.review', 'Review Submission')}
        </button>
      )}

      {/* Review Modal */}
      <BaseModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={t('submissions.detail.reviewTitle', 'Review Submission')}
        size="md"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('submissions.detail.status', 'Status')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as SubmissionStatus)}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="reviewed">{t('submissions.status.reviewed', 'Reviewed')}</option>
              <option value="approved">{t('submissions.status.approved', 'Approved')}</option>
              <option value="rejected">{t('submissions.status.rejected', 'Rejected')}</option>
              <option value="needs-improvement">{t('submissions.status.needs-improvement', 'Needs Improvement')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('submissions.detail.reviewNotes', 'Review Notes')}
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              placeholder={t('submissions.detail.reviewNotesPlaceholder', 'Provide feedback on the submission...')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleReview}
              disabled={updateStatus.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {updateStatus.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                  {t('common.loading')}
                </>
              ) : (
                t('submissions.detail.submitReview', 'Submit Review')
              )}
            </button>
            <button
              onClick={() => setReviewModalOpen(false)}
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