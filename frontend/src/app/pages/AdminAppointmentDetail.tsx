// src/app/pages/AdminAppointmentDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useAppointment } from '@/hooks/useAppointments';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  UserRound,
  Stethoscope,
  Clock4,
  Notebook,
  Info,
  Link2
} from 'lucide-react';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';

export function AdminAppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const { data, isLoading, error } = useAppointment(id!);

  // ✅ Extract the actual appointment data from the response
  const appointment = data?.data || data;

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
      return format(new Date(dateString), 'dd MMM yyyy', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'HH:mm', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'scheduled': return <Clock size={20} className="text-blue-600" />;
      case 'in-progress': return <Clock size={20} className="text-yellow-600 animate-pulse" />;
      case 'completed': return <CheckCircle size={20} className="text-green-600" />;
      case 'cancelled': return <XCircle size={20} className="text-red-600" />;
      case 'no-show': return <AlertCircle size={20} className="text-gray-600" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`appointments.status.${status}`, status);
  };

  const getTypeLabel = (type: string) => {
    return t(`appointments.type.${type}`, type);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{t('common.error')}</p>
        <button onClick={() => navigate('/appointments')} className="mt-2 text-primary hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-20">
      <Breadcrumb 
        showBack={true} 
        showHome={true}
        items={[
          { label: t('sidebar.appointments'), path: '/appointments' },
          { label: appointment.patientName, path: `/appointments/${appointment.id}` }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/appointments')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {t('appointments.detailTitle', 'Appointment Details')}
            </h1>
            <p className="text-sm text-gray-500">{appointment.patientName}</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
          {getStatusIcon(appointment.status)}
          {getStatusLabel(appointment.status)}
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('appointments.patient', 'Patient')}</p>
              <p className="font-medium text-gray-900">{appointment.patientName}</p>
            </div>
          </div>
        </div>

        {/* Orthophoniste */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Stethoscope size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('appointments.orthophoniste', 'Orthophoniste')}</p>
              <p className="font-medium text-gray-900">{appointment.orthophonisteName}</p>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('appointments.date', 'Date')}</p>
              <p className="font-medium text-gray-900">{formatDate(appointment.dateTime)}</p>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('appointments.time', 'Time')}</p>
              <p className="font-medium text-gray-900">{formatTime(appointment.dateTime)}</p>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
              <Clock4 size={18} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('appointments.duration', 'Duration')}</p>
              <p className="font-medium text-gray-900">{appointment.duration} {t('appointments.minutes', 'minutes')}</p>
            </div>
          </div>
        </div>

        {/* Type */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Info size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('appointments.type', 'Type')}</p>
              <p className="font-medium text-gray-900">{getTypeLabel(appointment.type)}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 md:col-span-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              {appointment.isVirtual ? <Video size={18} className="text-indigo-600" /> : <MapPin size={18} className="text-indigo-600" />}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{t('appointments.locationType', 'Location Type')}</p>
              <p className="font-medium text-gray-900">
                {appointment.isVirtual ? t('appointments.virtual', 'Virtual') : t('appointments.inPerson', 'In Person')}
              </p>
              {appointment.isVirtual ? (
                <>
                  <p className="text-sm text-gray-600 mt-1">{t('appointments.virtualMeeting', 'Virtual Meeting')}</p>
                  {appointment.meetingLink && (
                    <a 
                      href={appointment.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                    >
                      <Link2 size={14} />
                      {t('appointments.joinMeeting', 'Join Meeting')}
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600 mt-1">{appointment.location || t('appointments.noLocation', 'No location specified')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Notebook size={18} className="text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{t('appointments.notes', 'Notes')}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{appointment.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Reason */}
      {appointment.cancellationReason && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-red-600 font-medium">{t('appointments.cancellationReason', 'Cancellation Reason')}</p>
              <p className="text-sm text-red-700 mt-1">{appointment.cancellationReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Session Notes */}
      {appointment.sessionNotes && appointment.sessionNotes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock4 size={16} />
              {t('appointments.sessionNotes', 'Session Notes')}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {appointment.sessionNotes.map((note, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        {formatDateTime(note.date)}
                      </span>
                      {note.duration && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {note.duration} {t('appointments.minutes', 'min')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{note.notes}</p>
                    {note.topics && note.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.topics.map((topic, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                    {note.progress && (
                      <p className="text-xs text-blue-600 mt-1">📈 {note.progress}</p>
                    )}
                    {note.nextSteps && (
                      <p className="text-xs text-green-600 mt-1">➡️ {note.nextSteps}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs text-gray-400 flex flex-wrap gap-2">
          <span><span className="font-medium">{t('appointments.createdAt', 'Created')}:</span> {formatDateTime(appointment.createdAt)}</span>
          <span className="hidden sm:inline">•</span>
          <span><span className="font-medium">{t('appointments.updatedAt', 'Updated')}:</span> {formatDateTime(appointment.updatedAt)}</span>
        </p>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/appointments')}
        className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft size={18} />
        {t('appointments.backToList', 'Back to Appointments')}
      </button>
    </div>
  );
}