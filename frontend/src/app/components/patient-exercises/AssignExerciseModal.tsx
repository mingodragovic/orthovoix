// src/components/patient-exercises/AssignExerciseModal.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAssignExercise } from '@/hooks/usePatientExercises';
import { usePatients } from '@/hooks/usePatients';
import { useExercises } from '@/hooks/useExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle } from 'lucide-react';
import { PriorityLevel } from '@/types/patient-exercise.types';
import { FormModal } from '../ui/FormModal';

interface AssignExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPatientId?: string;
}

const assignExerciseSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  exerciseId: z.string().min(1, 'Exercise is required'),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  notes: z.string().optional(),
});

type AssignExerciseFormValues = z.infer<typeof assignExerciseSchema>;

export function AssignExerciseModal({
  isOpen,
  onClose,
  onSuccess,
  initialPatientId,
}: AssignExerciseModalProps) {
  const { t } = useTranslation();
  const assignExercise = useAssignExercise();
  
  // Fetch patients and exercises for dropdowns
  const { data: patientsData } = usePatients({ limit: 100 });
  const { data: exercisesData } = useExercises({ limit: 100, isActive: true });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
  } = useForm<AssignExerciseFormValues>({
    resolver: zodResolver(assignExerciseSchema),
    mode: 'onChange',
    defaultValues: {
      patientId: '',
      exerciseId: '',
      dueDate: '',
      priority: 'medium',
      notes: '',
    },
  });

  // Set initial patient if provided
  useEffect(() => {
    if (initialPatientId) {
      setValue('patientId', initialPatientId);
    }
  }, [initialPatientId, setValue]);

  const patients = patientsData?.data?.items || [];
  const exercises = exercisesData?.data?.items || [];

  const onSubmit = async (data: AssignExerciseFormValues) => {
    await assignExercise.mutateAsync({
      patientId: data.patientId,
      exerciseId: data.exerciseId,
      dueDate: data.dueDate || undefined,
      priority: data.priority as PriorityLevel,
      notes: data.notes || undefined,
    });

    reset();
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={t('patientExercises.assign.title', 'Assign Exercise to Patient')}
      submitText={t('patientExercises.assign.submit', 'Assign Exercise')}
      isLoading={assignExercise.isPending}
      isSubmitDisabled={!isValid || !isDirty || assignExercise.isPending}
      size="md"
    >
      <div className="space-y-4">
        {/* Patient Selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patientExercises.patient', 'Patient')} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('patientId')}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.patientId ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={assignExercise.isPending}
          >
            <option value="">{t('patientExercises.selectPatient', 'Select a patient...')}</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName} ({patient.age} {t('patients.age', 'years')})
              </option>
            ))}
          </select>
          {errors.patientId && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.patientId.message}
            </p>
          )}
        </div>

        {/* Exercise Selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patientExercises.exercise', 'Exercise')} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('exerciseId')}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.exerciseId ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={assignExercise.isPending}
          >
            <option value="">{t('patientExercises.selectExercise', 'Select an exercise...')}</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.title} ({t(`exercises.category.${exercise.category}`)})
              </option>
            ))}
          </select>
          {errors.exerciseId && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.exerciseId.message}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patientExercises.dueDate', 'Due Date')}
          </label>
          <input
            type="date"
            {...register('dueDate')}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={assignExercise.isPending}
          />
          {errors.dueDate && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.dueDate.message}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patientExercises.priority', 'Priority')}
          </label>
          <select
            {...register('priority')}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={assignExercise.isPending}
          >
            <option value="low">{t('patientExercises.priority.low', 'Low')}</option>
            <option value="medium">{t('patientExercises.priority.medium', 'Medium')}</option>
            <option value="high">{t('patientExercises.priority.high', 'High')}</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('patientExercises.notes', 'Notes')}
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder={t('patientExercises.notesPlaceholder', 'Add any instructions or notes for the patient...')}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
            disabled={assignExercise.isPending}
          />
          {errors.notes && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.notes.message}
            </p>
          )}
        </div>
      </div>
    </FormModal>
  );
}