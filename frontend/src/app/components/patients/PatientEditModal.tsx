// src/components/patients/PatientEditModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatient, useUpdatePatient } from '@/hooks/usePatients';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle } from 'lucide-react';
import { Gender, PatientStatus } from '@/types/patient.types';
import { FormModal } from '../ui/FormModal';

interface PatientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess?: () => void;
}

// Edit patient form schema
const editPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  diagnosis: z.string().optional(),
  therapyFrequency: z.string().optional(),
  therapyDuration: z.number().min(0).optional(),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(1, 'Emergency contact phone is required'),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required'),
  status: z.enum(['active', 'inactive', 'discharged']),
  notes: z.string().optional(),
});

type EditPatientFormValues = z.infer<typeof editPatientSchema>;

export function PatientEditModal({ isOpen, onClose, patientId, onSuccess }: PatientEditModalProps) {
  const { t } = useTranslation();
  const { data, isLoading } = usePatient(patientId);
  const updatePatient = useUpdatePatient(patientId);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<EditPatientFormValues>({
    resolver: zodResolver(editPatientSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      diagnosis: '',
      therapyFrequency: '',
      therapyDuration: 0,
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      status: 'active',
      notes: '',
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (data) {
      const patient = data.data;
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth.split('T')[0],
        gender: patient.gender,
        diagnosis: patient.diagnosis || '',
        therapyFrequency: patient.therapyFrequency || '',
        therapyDuration: patient.therapyDuration || 0,
        emergencyContactName: patient.emergencyContact?.name || '',
        emergencyContactPhone: patient.emergencyContact?.phone || '',
        emergencyContactRelationship: patient.emergencyContact?.relationship || '',
        status: patient.status,
        notes: patient.notes || '',
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: EditPatientFormValues) => {
    await updatePatient.mutateAsync({
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as Gender,
      diagnosis: formData.diagnosis || undefined,
      therapyFrequency: formData.therapyFrequency || undefined,
      therapyDuration: formData.therapyDuration || undefined,
      emergencyContact: {
        name: formData.emergencyContactName,
        relationship: formData.emergencyContactRelationship,
        phone: formData.emergencyContactPhone,
      },
      status: formData.status as PatientStatus,
      notes: formData.notes || undefined,
    });

    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (isLoading) {
    return (
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={() => {}}
        title={t('patients.edit.title', 'Edit Patient')}
        isLoading={true}
      >
        <div className="py-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading', 'Loading...')}</p>
        </div>
      </FormModal>
    );
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={t('patients.edit.title', 'Edit Patient')}
      submitText={t('patients.edit.submit', 'Update Patient')}
      isLoading={updatePatient.isPending}
      isSubmitDisabled={!isValid || !isDirty || updatePatient.isPending}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.firstName', 'First Name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('firstName')}
            placeholder="Emma"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.firstName ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updatePatient.isPending}
          />
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.lastName', 'Last Name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('lastName')}
            placeholder="Martin"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.lastName ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updatePatient.isPending}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.dateOfBirth', 'Date of Birth')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('dateOfBirth')}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.dateOfBirth ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updatePatient.isPending}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.gender', 'Gender')} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('gender')}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={updatePatient.isPending}
          >
            <option value="male">{t('patients.gender.male', 'Male')}</option>
            <option value="female">{t('patients.gender.female', 'Female')}</option>
            <option value="other">{t('patients.gender.other', 'Other')}</option>
          </select>
        </div>

        {/* Diagnosis */}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.diagnosis', 'Diagnosis')}
          </label>
          <input
            type="text"
            {...register('diagnosis')}
            placeholder="Speech delay"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={updatePatient.isPending}
          />
        </div>

        {/* Therapy Frequency */}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.therapyFrequency', 'Therapy Frequency')}
          </label>
          <input
            type="text"
            {...register('therapyFrequency')}
            placeholder="2x per week"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={updatePatient.isPending}
          />
        </div>

        {/* Therapy Duration */}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.therapyDuration', 'Therapy Duration (months)')}
          </label>
          <input
            type="number"
            {...register('therapyDuration', { valueAsNumber: true })}
            placeholder="6"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={updatePatient.isPending}
          />
        </div>

        {/* Emergency Contact - Name */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.emergencyName', 'Emergency Contact Name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('emergencyContactName')}
            placeholder="John Doe"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.emergencyContactName ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updatePatient.isPending}
          />
          {errors.emergencyContactName && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.emergencyContactName.message}
            </p>
          )}
        </div>

        {/* Emergency Contact - Relationship */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.emergencyRelationship', 'Relationship')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('emergencyContactRelationship')}
            placeholder="Father"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.emergencyContactRelationship ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updatePatient.isPending}
          />
          {errors.emergencyContactRelationship && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.emergencyContactRelationship.message}
            </p>
          )}
        </div>

        {/* Emergency Contact - Phone */}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.emergencyPhone', 'Emergency Contact Phone')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('emergencyContactPhone')}
            placeholder="+1234567890"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.emergencyContactPhone ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updatePatient.isPending}
          />
          {errors.emergencyContactPhone && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.emergencyContactPhone.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.status', 'Status')}
          </label>
          <select
            {...register('status')}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={updatePatient.isPending}
          >
            <option value="active">{t('patients.status.active', 'Active')}</option>
            <option value="inactive">{t('patients.status.inactive', 'Inactive')}</option>
            <option value="discharged">{t('patients.status.discharged', 'Discharged')}</option>
          </select>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patients.notes', 'Notes')}
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Additional notes about the patient..."
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
            disabled={updatePatient.isPending}
          />
        </div>
      </div>
    </FormModal>
  );
}