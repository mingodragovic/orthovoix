// src/app/pages/PatientDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatients';
import { usePatientExercises } from '@/hooks/usePatientExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  Phone, 
  AlertCircle, 
  FileText, 
  Activity, 
  BookOpen,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle as AlertIcon,
  BarChart
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { useState } from 'react';
import { PatientEditModal } from '../components/patients/PatientEditModal';
import { useAuth } from '@/providers/AuthProvider';
import { AssignExerciseModal } from '../components/patient-exercises/AssignExerciseModal';
import { PatientExerciseStatus } from '@/types/patient-exercise.types';

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'exercises' | 'progress'>('info');
  
  const { data, isLoading, error, refetch } = usePatient(id!);
  const { data: exercisesData, refetch: refetchExercises } = usePatientExercises(id!);

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

  const getGenderLabel = (gender: string) => {
    switch(gender) {
      case 'male': return t('patients.gender.male', 'Male');
      case 'female': return t('patients.gender.female', 'Female');
      case 'other': return t('patients.gender.other', 'Other');
      default: return gender;
    }
  };

  const getStatusColorPatient = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-yellow-100 text-yellow-700';
      case 'discharged': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
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

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto py-8">
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

  const patient = data.data;
  // ✅ FIX: exercises is an array, not an object
  const exercises = exercisesData?.data || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        showBack={true} 
        showHome={true}
        items={[
          { label: t('sidebar.patients'), path: '/patients' },
          { label: patient.fullName, path: `/patients/${patient.id}` }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {patient.fullName}
          </h1>
          <p className="text-muted-foreground">
            {patient.age} {t('patients.age')} • {getGenderLabel(patient.gender)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
          >
            <Edit size={16} />
            {t('common.edit')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'info' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('patients.basicInfo')}
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'exercises' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('patients.exercises')} ({exercises.length})
        </button>
        <button
          onClick={() => navigate(`/patients/${patient.id}/progress`)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'progress' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('patients.progress')}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {t('patients.basicInfo')}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('patients.name')}</p>
                      <p className="text-sm">{patient.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('patients.dateOfBirth')}</p>
                      <p className="text-sm">{formatDate(patient.dateOfBirth)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('patients.status')}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColorPatient(patient.status)}`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {t('patients.medicalInfo')}
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">{t('patients.diagnosis')}</p>
                    <p className="text-sm">{patient.diagnosis || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('patients.therapyFrequency')}</p>
                    <p className="text-sm">{patient.therapyFrequency || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('patients.therapyDuration')}</p>
                    <p className="text-sm">{patient.therapyDuration ? `${patient.therapyDuration} ${t('patients.months')}` : '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {t('patients.emergencyContact')}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('patients.contactName')}</p>
                      <p className="text-sm">{patient.emergencyContact?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{t('patients.contactPhone')}</p>
                      <p className="text-sm">{patient.emergencyContact?.phone || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('patients.contactRelationship')}</p>
                    <p className="text-sm">{patient.emergencyContact?.relationship || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {patient.notes && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <FileText size={20} />
                    {t('patients.notes')}
                  </h2>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{patient.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {t('patients.exercises')}
              </h2>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                {t('patientExercises.assign')}
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('patientExercises.noResults')}
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise: any) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <p className="font-medium">{exercise.exerciseTitle}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{t(`exercises.category.${exercise.exerciseCategory}`)}</span>
                          <span>•</span>
                          <span>{t('patientExercises.assignedBy')} {exercise.assignerName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(exercise.status)}`}>
                        {getStatusLabel(exercise.status)}
                      </span>
                      <button
                        onClick={() => navigate(`/patient-exercises/${exercise.id}`)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-500 hover:text-primary" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <PatientEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        patientId={patient.id}
        onSuccess={() => {
          refetch();
          setEditModalOpen(false);
        }}
      />

      <AssignExerciseModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={() => {
          refetchExercises();
          setAssignModalOpen(false);
        }}
        initialPatientId={patient.id}
      />
    </div>
  );
}