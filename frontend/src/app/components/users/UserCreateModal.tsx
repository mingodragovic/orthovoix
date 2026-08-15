// src/components/users/UserCreateModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateUser } from '@/hooks/useUsers';
import { useTranslation } from '@/hooks/useTranslation';
import { useValidationSchemas, RegisterFormValues } from '@/utils/validators';
import { AlertCircle } from 'lucide-react';
import { FormModal } from '../ui/FormModal';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserCreateModal({ isOpen, onClose }: UserCreateModalProps) {
  const { t } = useTranslation();
  const createUser = useCreateUser();
  const schemas = useValidationSchemas(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schemas.registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'parent',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    await createUser.mutateAsync({
      email: data.email,
      password: data.password,
      name: data.name,
      role: 'parent',
      childName: data.childName || undefined,
    });
    reset();
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
      title={t('users.create.title', 'Create New User')}
      submitText={t('users.create.submit', 'Create User')}
      isLoading={createUser.isPending}
      isSubmitDisabled={!isValid || !isDirty || createUser.isPending}
      size="lg"
    >
      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('auth.register.name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="John Doe"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.name ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={createUser.isPending}
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
            {t('auth.login.email')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="user@example.com"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.email ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={createUser.isPending}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('auth.login.password')} <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.password ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={createUser.isPending}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.password.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {t('auth.register.passwordRequirements')}
          </p>
        </div>

        {/* Child Name Field (Optional) */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('auth.register.childName')} <span className="text-xs text-muted-foreground">({t('common.optional', {})})</span>
          </label>
          <input
            type="text"
            {...register('childName')}
            placeholder="Emma"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={createUser.isPending}
          />
          {errors.childName && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.childName.message}
            </p>
          )}
        </div>
      </div>
    </FormModal>
  );
}