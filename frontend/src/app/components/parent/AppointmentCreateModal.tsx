// src/app/components/parent/AppointmentCreateModal.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useMyPatients } from '@/hooks/usePatients';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/providers/AuthProvider';
import { AlertCircle, User, Calendar, Clock, MapPin, Video } from 'lucide-react';
import { BaseModal } from '@/app/components/ui/BaseModal';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

interface AppointmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPatientId?: string;
}

const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  dateTime: z.string().min(1, 'Date and time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  type: z.enum(['initial-assessment', 'follow-up', 'therapy-session', 'progress-review', 'other']),
  location: z.string().optional(),
  meetingLink: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  isVirtual: z.boolean().default(false),
  notes: z.string().optional(),
});

type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;

export function AppointmentCreateModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialPatientId 
}: AppointmentCreateModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const createAppointment = useCreateAppointment();
  const isAdmin = user?.role === 'orthophoniste';
  
  // Fetch patients for admin
  const { data: patientsData, isLoading: patientsLoading } = useMyPatients({ limit: 100 });
  const patients = patientsData?.data?.items || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: initialPatientId || '',
      dateTime: '',
      duration: 30,
      type: 'therapy-session',
      isVirtual: false,
      location: '',
      meetingLink: '',
      notes: '',
    },
  });

  const isVirtual = watch('isVirtual');

  // Set initial patient ID when provided
  useEffect(() => {
    if (initialPatientId) {
      setValue('patientId', initialPatientId);
    }
  }, [initialPatientId, setValue]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        patientId: initialPatientId || '',
        dateTime: '',
        duration: 30,
        type: 'therapy-session',
        isVirtual: false,
        location: '',
        meetingLink: '',
        notes: '',
      });
    }
  }, [isOpen, reset, initialPatientId]);

  const onSubmit = async (data: CreateAppointmentFormValues) => {
    await createAppointment.mutateAsync(data);
    reset();
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('appointments.createTitle', 'Schedule Appointment')}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        {/* Patient Selection - Admin only */}
        {isAdmin && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('appointments.patient', 'Patient')} <span className="text-red-500">*</span>
            </label>
            {patientsLoading ? (
              <div className="flex items-center justify-center py-2">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select
                  {...register('patientId')}
                  className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all ${
                    errors.patientId ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                  }`}
                  disabled={createAppointment.isPending}
                >
                  <option value="">{t('patients.select', 'Select a patient...')}</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {errors.patientId && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.patientId.message}
              </p>
            )}
          </div>
        )}

        {/* Date & Time */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.dateTime', 'Date & Time')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="datetime-local"
              {...register('dateTime')}
              className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all ${
                errors.dateTime ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
              }`}
              disabled={createAppointment.isPending}
            />
          </div>
          {errors.dateTime && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.dateTime.message}
            </p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.duration', 'Duration (minutes)')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              min={15}
              step={5}
              className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all ${
                errors.duration ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
              }`}
              disabled={createAppointment.isPending}
            />
          </div>
          {errors.duration && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.duration.message}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.type', 'Type')} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('type')}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.type ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={createAppointment.isPending}
          >
            <option value="initial-assessment">{t('appointments.type.initial-assessment')}</option>
            <option value="follow-up">{t('appointments.type.follow-up')}</option>
            <option value="therapy-session">{t('appointments.type.therapy-session')}</option>
            <option value="progress-review">{t('appointments.type.progress-review')}</option>
            <option value="other">{t('appointments.type.other')}</option>
          </select>
          {errors.type && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.type.message}
            </p>
          )}
        </div>

        {/* Virtual / In-person - Fixed Radio Buttons */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.locationType', 'Location Type')}
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!isVirtual}
                onChange={() => setValue('isVirtual', false)}
                className="w-4 h-4 text-primary"
                disabled={createAppointment.isPending}
              />
              <span className="text-sm">{t('appointments.inPerson', 'In Person')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={isVirtual}
                onChange={() => setValue('isVirtual', true)}
                className="w-4 h-4 text-primary"
                disabled={createAppointment.isPending}
              />
              <span className="text-sm">{t('appointments.virtual', 'Virtual')}</span>
            </label>
          </div>
        </div>

        {/* Location (in-person) */}
        {!isVirtual && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('appointments.location', 'Location')}
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                {...register('location')}
                placeholder="Clinic Room 101"
                className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                disabled={createAppointment.isPending}
              />
            </div>
          </div>
        )}

        {/* Meeting Link (virtual) */}
        {isVirtual && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('appointments.meetingLink', 'Meeting Link')}
            </label>
            <div className="relative">
              <Video size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                {...register('meetingLink')}
                placeholder="https://meet.google.com/abc-defg-hij"
                className={`w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all ${
                  errors.meetingLink ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                }`}
                disabled={createAppointment.isPending}
              />
            </div>
            {errors.meetingLink && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.meetingLink.message}
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.notes', 'Notes')}
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder={t('appointments.notesPlaceholder', 'Add any additional notes...')}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
            disabled={createAppointment.isPending}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || createAppointment.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting || createAppointment.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                {t('common.loading')}
              </>
            ) : (
              t('appointments.createSubmit', 'Schedule')
            )}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}