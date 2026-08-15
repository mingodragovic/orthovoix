// src/app/pages/ParentSubmissions.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useMySubmissions } from '@/hooks/useSubmissions';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Search, Filter, Mic, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { SubmissionStatus } from '@/types/submission.types';
import { motion } from 'motion/react';

interface SubmissionCardProps {
  submission: any;
  t: (key: string, values?: Record<string, any>) => string;
  onView: () => void;
}

function SubmissionCard({ submission, t, onView }: SubmissionCardProps) {
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

  const getStatusIcon = (status: SubmissionStatus) => {
    switch(status) {
      case 'pending': return <Clock size={14} className="text-yellow-600 animate-pulse" />;
      case 'reviewed': return <CheckCircle size={14} className="text-blue-600" />;
      case 'approved': return <CheckCircle size={14} className="text-green-600" />;
      case 'rejected': return <AlertCircle size={14} className="text-red-600" />;
      case 'needs-improvement': return <AlertCircle size={14} className="text-orange-600" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {submission.exerciseTitle}
          </h3>
          <p className="text-sm text-gray-500">
            {t('submissions.submitted')}: {formatDate(submission.submittedAt)}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
              {getStatusIcon(submission.status)}
              {t(`submissions.status.${submission.status}`, submission.status)}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Mic size={12} />
              {submission.answers.length} {t('submissions.recordings')}
            </span>
          </div>
          {submission.reviewNotes && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              💬 {submission.reviewNotes}
            </p>
          )}
        </div>
        <button
          onClick={onView}
          className="ml-3 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          title={t('common.view')}
        >
          <Eye size={18} className="text-gray-500 hover:text-primary" />
        </button>
      </div>
    </motion.div>
  );
}

export function ParentSubmissions() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error, refetch } = useMySubmissions(1, 50);

  const submissions = data?.items || [];

  const filteredSubmissions = submissions.filter((s: any) =>
    s.exerciseTitle?.toLowerCase().includes(search.toLowerCase()) || false
  );

  const statusFiltered = statusFilter
    ? filteredSubmissions.filter((s: any) => s.status === statusFilter)
    : filteredSubmissions;

  const statusOptions: { value: string; label: string }[] = [
    { value: '', label: t('common.all') },
    { value: 'pending', label: t('submissions.status.pending') },
    { value: 'reviewed', label: t('submissions.status.reviewed') },
    { value: 'approved', label: t('submissions.status.approved') },
    { value: 'rejected', label: t('submissions.status.rejected') },
    { value: 'needs-improvement', label: t('submissions.status.needs-improvement') },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {t('parent.submissions.title')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('parent.submissions.subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
          <p className="text-xl font-bold text-gray-900">{submissions.length}</p>
          <p className="text-[10px] text-gray-500">{t('submissions.total')}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
          <p className="text-xl font-bold text-yellow-600">
            {submissions.filter((s: any) => s.status === 'pending').length}
          </p>
          <p className="text-[10px] text-yellow-600">{t('submissions.status.pending')}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
          <p className="text-xl font-bold text-green-600">
            {submissions.filter((s: any) => s.status === 'approved').length}
          </p>
          <p className="text-[10px] text-green-600">{t('submissions.status.approved')}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
          <p className="text-xl font-bold text-red-600">
            {submissions.filter((s: any) => s.status === 'rejected' || s.status === 'needs-improvement').length}
          </p>
          <p className="text-[10px] text-red-600">{t('submissions.needsWork')}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('submissions.search')}
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white rounded-xl pl-9 pr-8 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {statusFiltered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">
            {t('submissions.empty')}
          </h3>
          <p className="text-gray-500 text-sm">
            {t('submissions.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {statusFiltered.map((submission: any) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              t={t}
              onView={() => navigate(`/parent/submissions/${submission.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}