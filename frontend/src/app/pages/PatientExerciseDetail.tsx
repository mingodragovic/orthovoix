// src/app/pages/PatientExerciseDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientExercise, useUpdateExerciseStatus } from '@/hooks/usePatientExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
  X,
  Save
} from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { BaseModal } from '../components/ui/BaseModal';
import { PatientExerciseStatus } from '@/types/patient-exercise.types';
import { useToast } from '@/hooks/useToast';

export function PatientExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { success, error } = useToast();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PatientExerciseStatus | null>(null);
  const [notes, setNotes] = useState('');

  const { data, isLoading, error: fetchError, refetch } = usePatientExercise(id!);
  const updateStatus = useUpdateExerciseStatus(id!);

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
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: getLocale() });
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
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'assigned': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-gray-600" />;
      default: return null;
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus) {
      await updateStatus.mutateAsync({
        status: newStatus,
        notes: notes.trim() || undefined,
      });
      setStatusModalOpen(false);
      setNewStatus(null);
      setNotes('');
      success(t('patientExercises.status.success'));
      refetch();
    }
  };

  const openStatusModal = (status: PatientExerciseStatus) => {
    setNewStatus(status);
    setStatusModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-red-500">{t('common.error')}</p>
          <button
            onClick={() => navigate('/patients')}
            className="mt-2 text-primary hover:underline"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  const assignment = data.data;

  const statusOptions: PatientExerciseStatus[] = [
    'assigned',
    'in-progress',
    'completed',
    'overdue',
    'cancelled',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb 
        showBack={true} 
        showHome={true}
        items={[
          { label: t('sidebar.patients'), path: '/patients' },
          { label: assignment.patientName, path: `/patients/${assignment.patientId}` },
          { label: assignment.exerciseTitle, path: `/patient-exercises/${assignment.id}` }
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {assignment.exerciseTitle}
            </h1>
            <p className="text-muted-foreground">
              {t('patientExercises.detail.subtitle')}
            </p>
          </div>
        </div>
        <button
          onClick={() => openStatusModal(assignment.status)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
        >
          <Edit size={16} />
          {t('patientExercises.detail.updateStatus')}
        </button>
      </div>

      <div className={`p-4 rounded-lg border ${getStatusColor(assignment.status)} flex items-center gap-3`}>
        {getStatusIcon(assignment.status)}
        <div>
          <p className="font-medium">{t('patientExercises.status')}: {getStatusLabel(assignment.status)}</p>
          <p className="text-sm text-gray-600">
            {t('patientExercises.assignedBy')} {assignment.assignerName} • {formatDate(assignment.assignedDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {t('patientExercises.detail.exerciseInfo')}
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('patientExercises.exercise')}</p>
                    <p className="text-sm">{assignment.exerciseTitle}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('exercises.category')}</p>
                    <p className="text-sm">{t(`exercises.category.${assignment.exerciseCategory}`)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {t('patientExercises.detail.assignmentInfo')}
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('patientExercises.patient')}</p>
                    <p className="text-sm">{assignment.patientName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('patientExercises.assignedBy')}</p>
                    <p className="text-sm">{assignment.assignerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('patientExercises.assignedDate')}</p>
                    <p className="text-sm">{formatDate(assignment.assignedDate)}</p>
                  </div>
                </div>
                {assignment.dueDate && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('patientExercises.dueDate')}</p>
                      <p className="text-sm">{formatDate(assignment.dueDate)}</p>
                    </div>
                  </div>
                )}
                {assignment.completedDate && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('patientExercises.completedDate')}</p>
                      <p className="text-sm">{formatDate(assignment.completedDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Activity className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t('patientExercises.daysSinceAssigned')}</p>
                    <p className="text-sm">{assignment.daysSinceAssigned} {t('patientExercises.days')}</p>
                  </div>
                </div>
                {assignment.daysUntilDue !== undefined && assignment.daysUntilDue !== null && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('patientExercises.daysUntilDue')}</p>
                      <p className="text-sm">{assignment.daysUntilDue} {t('patientExercises.days')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {assignment.notes && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {t('patientExercises.notes')}
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Status Update Modal with Dropdown + Notes */}
      <BaseModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setNewStatus(null);
          setNotes('');
        }}
        title={t('patientExercises.updateStatus.title')}
        size="md"
      >
        <div className="space-y-4 py-2">
          {/* Status Dropdown */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('patientExercises.status')}
            </label>
            <select
              value={newStatus || ''}
              onChange={(e) => setNewStatus(e.target.value as PatientExerciseStatus)}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">{t('common.select', 'Select a status')}</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('patientExercises.notes')} <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('patientExercises.notesPlaceholder')}
              rows={3}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-2">
            <button
              onClick={handleStatusUpdate}
              disabled={!newStatus || updateStatus.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {updateStatus.isPending ? (
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
              onClick={() => {
                setStatusModalOpen(false);
                setNewStatus(null);
                setNotes('');
              }}
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