// src/components/users/UserEditModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateUser, useUser } from '@/hooks/useUsers';
import { useTranslation } from '@/hooks/useTranslation';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import { Role } from '@/types/api.types';
import { FormModal } from '../ui/FormModal';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function UserEditModal({ isOpen, onClose, userId }: UserEditModalProps) {
  const { t } = useTranslation();
  const { data, isLoading: userLoading } = useUser(userId);
  const updateUser = useUpdateUser(userId);

  // Create schema for editing
  const editUserSchema = z.object({
    name: z.string().min(2, t('validation.register.name.minLength', 'Name must be at least 2 characters')),
    email: z.string().email(t('validation.register.email.invalid', 'Please enter a valid email address')),
    role: z.enum(['orthophoniste', 'parent']),
    isActive: z.boolean(),
    childName: z.string().optional().or(z.literal('')),
    specialization: z.string().optional().or(z.literal('')),
    licenseNumber: z.string().optional().or(z.literal('')),
  });

  type EditUserFormValues = z.infer<typeof editUserSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      role: 'parent',
      isActive: true,
      childName: '',
      specialization: '',
      licenseNumber: '',
    },
  });

  const selectedRole = watch('role');

  // Populate form when data loads
  useEffect(() => {
    if (data) {
      const user = data.data;
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        childName: user.childName || '',
        specialization: user.specialization || '',
        licenseNumber: user.licenseNumber || '',
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: EditUserFormValues) => {
    await updateUser.mutateAsync({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isActive: formData.isActive,
      childName: formData.childName || undefined,
      specialization: formData.specialization || undefined,
      licenseNumber: formData.licenseNumber || undefined,
    });
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (userLoading) {
    return (
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={() => {}}
        title={t('users.edit.title', 'Edit User')}
        isLoading={true}
      >
        <div className="py-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading', {})}</p>
        </div>
      </FormModal>
    );
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={t('users.edit.title', 'Edit User')}
      submitText={t('users.edit.submit', 'Update User')}
      isLoading={updateUser.isPending}
      isSubmitDisabled={!isValid || !isDirty || updateUser.isPending}
      size="lg"
    >
      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('users.name', {})} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="John Doe"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.name ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateUser.isPending}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('users.email', {})} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="user@example.com"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.email ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateUser.isPending}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Role Field */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('users.role', {})} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('role')}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={updateUser.isPending}
          >
            <option value="parent">{t('auth.login.role.parent', {})}</option>
            <option value="orthophoniste">{t('auth.login.role.orthophoniste', {})}</option>
          </select>
        </div>

        {/* Status Field */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('users.status', {})}
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register('isActive')}
                value="true"
                className="w-4 h-4 text-primary"
                disabled={updateUser.isPending}
              />
              <span className="text-sm">{t('users.active', {})}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register('isActive')}
                value="false"
                className="w-4 h-4 text-primary"
                disabled={updateUser.isPending}
              />
              <span className="text-sm">{t('users.inactive', {})}</span>
            </label>
          </div>
        </div>

        {/* Conditional Fields based on Role */}
        {selectedRole === 'orthophoniste' && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {t('users.specialization', {})}
              </label>
              <input
                type="text"
                {...register('specialization')}
                placeholder="Orthophonie Pédiatrique"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                disabled={updateUser.isPending}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {t('users.licenseNumber', {})}
              </label>
              <input
                type="text"
                {...register('licenseNumber')}
                placeholder="12345"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                disabled={updateUser.isPending}
              />
            </div>
          </>
        )}

        {selectedRole === 'parent' && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {t('users.childName', {})}
              </label>
              <input
                type="text"
                {...register('childName')}
                placeholder="Emma"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                disabled={updateUser.isPending}
              />
            </div>
          </>
        )}
      </div>
    </FormModal>
  );
}