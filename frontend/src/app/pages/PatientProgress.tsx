// src/app/pages/PatientProgress.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { usePatientProgress, usePatientExercises, useUpdateExerciseProgress } from '@/hooks/usePatientExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BarChart3,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { useToast } from '@/hooks/useToast';
import { BaseModal } from '../components/ui/BaseModal';
import { UpdateProgressRequest, PatientExercise } from '@/types/patient-exercise.types';

export function PatientProgress() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { success, error } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: patientData } = usePatient(patientId!);
  const { data: progressData, isLoading, error: fetchError, refetch } = usePatientProgress(patientId!);
  const { data: exercisesData } = usePatientExercises(patientId!);

  // ✅ FIX: exercises is an array of PatientExercise
  const exercises = exercisesData?.data || [];

  // Get the first exercise (or null)
  const firstExercise = exercises.length > 0 ? exercises[0] : null;
  const exerciseId = firstExercise?.id || '';

  const updateProgress = useUpdateExerciseProgress(exerciseId);

  const [editForm, setEditForm] = useState<UpdateProgressRequest>({
    performance: {
      score: 0,
      timeTaken: 0,
      attempts: 0,
      feedback: '',
    },
    progressLog: {
      notes: '',
      score: 0,
    },
  });

  // Populate form when first exercise loads
  useEffect(() => {
    if (firstExercise?.performance) {
      const perf = firstExercise.performance;
      setEditForm({
        performance: {
          score: perf.score || 0,
          timeTaken: perf.timeTaken || 0,
          attempts: perf.attempts || 0,
          feedback: perf.feedback || '',
        },
        progressLog: {
          notes: perf.notes || '',
          score: perf.score || 0,
        },
      });
    }
  }, [firstExercise]);

  const handleSave = async () => {
    if (!exerciseId) {
      error(t('patientExercises.progress.noExercise', 'No exercise found for this patient'));
      return;
    }

    try {
      await updateProgress.mutateAsync({
        performance: {
          score: editForm.performance?.score || 0,
          timeTaken: editForm.performance?.timeTaken || 0,
          attempts: editForm.performance?.attempts || 0,
          feedback: editForm.performance?.feedback || '',
        },
        progressLog: {
          notes: editForm.progressLog?.notes || '',
          score: editForm.progressLog?.score || 0,
        },
      });
      setIsModalOpen(false);
      success(t('patientExercises.progress.success'));
      refetch();
    } catch (err: any) {
      error(err.response?.data?.message || t('patientExercises.progress.error'));
    }
  };

  const handleCancel = () => {
    if (firstExercise?.performance) {
      const perf = firstExercise.performance;
      setEditForm({
        performance: {
          score: perf.score || 0,
          timeTaken: perf.timeTaken || 0,
          attempts: perf.attempts || 0,
          feedback: perf.feedback || '',
        },
        progressLog: {
          notes: perf.notes || '',
          score: perf.score || 0,
        },
      });
    }
    setIsModalOpen(false);
  };

  const handleChange = (field: keyof UpdateProgressRequest, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePerformanceChange = (field: string, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      performance: { ...prev.performance, [field]: value },
    }));
  };

  const handleProgressLogChange = (field: string, value: any) => {
    setEditForm((prev) => ({
      ...prev,
      progressLog: { ...prev.progressLog, [field]: value },
    }));
  };

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

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (fetchError || !progressData) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-red-500">{t('common.error')}</p>
          <button
            onClick={() => navigate(`/patients/${patientId}`)}
            className="mt-2 text-primary hover:underline"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  const patient = patientData?.data;
  const progress = progressData.data;
  const summary = progress.summary;
  const categoryBreakdown = progress.categoryBreakdown || {};
  const recentLogs = progress.recentLogs || [];

  const completionRate = summary.completionRate || 0;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumb 
        showBack={true} 
        showHome={true}
        items={[
          { label: t('sidebar.patients'), path: '/patients' },
          { label: patient?.fullName || 'Patient', path: `/patients/${patientId}` },
          { label: t('patients.progress'), path: `/patients/${patientId}/progress` }
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('patientExercises.progress.title')}
          </h1>
          <p className="text-muted-foreground">
            {patient?.fullName} — {t('patientExercises.progress.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
        >
          <Edit size={16} />
          {t('patientExercises.progress.editProgress')}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{t('patientExercises.progress.total')}</span>
            <BarChart3 size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary.totalExercises}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{t('patientExercises.progress.completed')}</span>
            <CheckCircle size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{summary.completedExercises}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{t('patientExercises.progress.inProgress')}</span>
            <Clock size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{summary.inProgressExercises}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{t('patientExercises.progress.overdue')}</span>
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{summary.overdueExercises}</p>
        </div>
      </div>

      {/* Progress Ring & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              {t('patientExercises.progress.completionRate')}
            </h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="54" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                <circle
                  cx="65"
                  cy="65"
                  r="54"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="12"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4A90D9" />
                    <stop offset="100%" stopColor="#6EC6A0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{completionRate}%</span>
                <span className="text-xs text-gray-500">{t('patientExercises.progress.completionRate')}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('patientExercises.progress.averageScore')}</span>
                <span className="font-medium">{summary.averageScore || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              {t('patientExercises.progress.categoryBreakdown')}
            </h3>
            {Object.keys(categoryBreakdown).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                {t('patientExercises.progress.noData')}
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {t(`exercises.category.${category}`)}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(count / summary.totalExercises) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          {t('patientExercises.progress.recentLogs')}
        </h3>
        {recentLogs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            {t('patientExercises.progress.noLogs')}
          </p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {log.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : log.status === 'in-progress' ? (
                    <Clock className="w-4 h-4 text-blue-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatDate(log.date)}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'completed' ? 'bg-green-100 text-green-700' :
                      log.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{log.notes}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✨ Edit Modal */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('patientExercises.progress.editProgress')}
        size="lg"
      >
        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
          {/* Performance Section */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {t('patientExercises.progress.performance', 'Performance')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t('patientExercises.progress.score', 'Score')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.performance?.score || 0}
                  onChange={(e) => handlePerformanceChange('score', Number(e.target.value))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t('patientExercises.progress.timeTaken', 'Time Taken (min)')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.performance?.timeTaken || 0}
                  onChange={(e) => handlePerformanceChange('timeTaken', Number(e.target.value))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t('patientExercises.progress.attempts', 'Attempts')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.performance?.attempts || 0}
                  onChange={(e) => handlePerformanceChange('attempts', Number(e.target.value))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t('patientExercises.progress.feedback', 'Feedback')}
                </label>
                <textarea
                  value={editForm.performance?.feedback || ''}
                  onChange={(e) => handlePerformanceChange('feedback', e.target.value)}
                  rows={2}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Progress Log Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {t('patientExercises.progress.progressLog', 'Progress Log')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t('patientExercises.progress.notes')}
                </label>
                <textarea
                  value={editForm.progressLog?.notes || ''}
                  onChange={(e) => handleProgressLogChange('notes', e.target.value)}
                  rows={3}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {t('patientExercises.progress.score')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.progressLog?.score || 0}
                  onChange={(e) => handleProgressLogChange('score', Number(e.target.value))}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-2">
            <button
              onClick={handleSave}
              disabled={updateProgress.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {updateProgress.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {t('common.save')}
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}