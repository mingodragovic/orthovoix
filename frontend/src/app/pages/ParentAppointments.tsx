// src/app/pages/ParentAppointments.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useMyAppointments } from '@/hooks/useAppointments';
import { AppointmentCard } from '@/app/components/parent/AppointmentCard';
import { AppointmentCreateModal } from '../../app/components/parent/AppointmentCreateModal';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Calendar, Plus } from 'lucide-react';

export function ParentAppointments() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useMyAppointments(1, 20, statusFilter || undefined);

  const appointments = data?.items || [];
  const statusOptions = [
    { value: '', label: t('common.all', 'All') },
    { value: 'scheduled', label: t('appointments.status.scheduled') },
    { value: 'completed', label: t('appointments.status.completed') },
    { value: 'cancelled', label: t('appointments.status.cancelled') },
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
    <div className="space-y-4 pb-20 max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('parent.appointments.title', 'Appointments')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('parent.appointments.subtitle', 'Manage your therapy sessions')}
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          {t('appointments.create', 'New Appointment')}
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold mb-2">
            {t('parent.appointments.empty', 'No appointments found')}
          </h3>
          <p className="text-gray-500 text-sm">
            {t('parent.appointments.emptyDescription', 'Schedule your first therapy session!')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              id={appointment.id}
              dateTime={appointment.dateTime}
              location={appointment.location}
              isVirtual={appointment.isVirtual}
              type={appointment.type}
              status={appointment.status}
              orthophonisteName={appointment.orthophonisteName}
            />
          ))}
        </div>
      )}

      {/* Create Appointment Modal */}
      <AppointmentCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}