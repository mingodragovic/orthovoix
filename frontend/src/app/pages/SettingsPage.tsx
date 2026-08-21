// src/app/pages/SettingsPage.tsx
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Trash2, 
  Save, 
  AlertCircle,
  Loader2,
  Image,
} from 'lucide-react';
import { useProfile, useUpdateProfile, useChangePassword, useUploadAvatar, useRemoveAvatar } from '@/hooks/useProfile';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/useToast';
import { Role } from '@/types/api.types';
import { useAuth } from '@/providers/AuthProvider';
import { Breadcrumb } from '../components/ui/Breadcrumb';

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  childName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const showToast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: profile, isLoading, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'password'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      specialization: '',
      licenseNumber: '',
      childName: '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name || '',
        email: profile.email || '',
        specialization: profile.specialization || '',
        licenseNumber: profile.licenseNumber || '',
        childName: profile.childName || '',
      });
    }
  }, [profile, resetProfile]);

  // Refetch profile when user changes
  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast.error(t('settings.avatar.error.invalidType', 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast.error(t('settings.avatar.error.sizeExceeded', 'File size exceeds 5MB limit.'));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Store the file and create preview
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Profile Submit
  const handleProfileSubmit = async (data: ProfileFormValues) => {
    try {
      const updateData: any = {
        name: data.name,
        email: data.email,
      };

      if (profile?.role === 'orthophoniste') {
        updateData.specialization = data.specialization || null;
        updateData.licenseNumber = data.licenseNumber || null;
      } else if (profile?.role === 'parent') {
        updateData.childName = data.childName || null;
      }

      await updateProfile.mutateAsync(updateData);
      
      setIsEditing(false);
      showToast.success(t('settings.profile.updateSuccess', 'Profile updated successfully'));
      
      // Refresh profile to get latest data
      await refetch();
      
    } catch (error: any) {
      showToast.error(error.message || t('settings.profile.updateError', 'Failed to update profile'));
    }
  };

  // Handle Avatar Submit
  const handleAvatarSubmit = async () => {
    if (!selectedFile) {
      showToast.error(t('settings.avatar.error.noFile', 'Please select an image first'));
      return;
    }

    try {
      await uploadAvatar.mutateAsync(selectedFile);
      
      setSelectedFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Force refetch to get the new avatar URL
      await refetch();
      
      showToast.success(t('settings.avatar.uploadSuccess', 'Avatar uploaded successfully'));
    } catch (error: any) {
      showToast.error(error.message || t('settings.avatar.uploadError', 'Failed to upload avatar'));
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    if (window.confirm(t('settings.avatar.remove.confirm', 'Are you sure you want to remove your avatar?'))) {
      try {
        await removeAvatar.mutateAsync();
        
        setSelectedFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        await refetch();
        
        showToast.success(t('settings.avatar.remove.success', 'Avatar removed successfully'));
      } catch (error: any) {
        showToast.error(error.message || t('settings.avatar.remove.error', 'Failed to remove avatar'));
      }
    }
  };

  // Password Submit
  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
      showToast.success(t('settings.password.success', 'Password changed successfully'));
    } catch (error: any) {
      showToast.error(error.message || t('settings.password.error', 'Failed to change password'));
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      resetProfile({
        name: profile.name || '',
        email: profile.email || '',
        specialization: profile.specialization || '',
        licenseNumber: profile.licenseNumber || '',
        childName: profile.childName || '',
      });
    }
  };

  const getRoleLabel = (role: Role) => {
    switch(role) {
      case 'orthophoniste': return t('auth.login.role.orthophoniste', {});
      case 'parent': return t('auth.login.role.parent', {});
      default: return role;
    }
  };

  // Determine which avatar to show
  const displayAvatar = avatarPreview || profile?.avatar || null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-red-500">{error?.message || t('common.error', 'An error occurred')}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-primary hover:underline"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumb showBack={true} showHome={true} />

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {t('settings.title', 'Settings')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.subtitle', 'Manage your account settings and preferences')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0 overflow-hidden">
                  {displayAvatar ? (
                    <img 
                      src={displayAvatar} 
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = profile.name?.charAt(0)?.toUpperCase() || 'U';
                      }}
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{profile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-gray-50'
                }`}
              >
                <User size={18} />
                {t('settings.tabs.profile', 'Profile')}
              </button>
              <button
                onClick={() => setActiveTab('avatar')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === 'avatar'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-gray-50'
                }`}
              >
                <Image size={18} />
                {t('settings.tabs.avatar', 'Avatar')}
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === 'password'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-gray-50'
                }`}
              >
                <Lock size={18} />
                {t('settings.tabs.password', 'Password')}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {t('settings.profile.title', 'Profile Information')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.profile.subtitle', 'Update your personal information')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
                          disabled={updateProfile.isPending}
                        >
                          {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                          form="profileForm"
                          type="submit"
                          disabled={updateProfile.isPending}
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {updateProfile.isPending ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              {t('common.saving', 'Saving...')}
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              {t('common.save', 'Save')}
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                      >
                        {t('common.edit', 'Edit')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <form id="profileForm" onSubmit={handleSubmitProfile(handleProfileSubmit)}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        {t('settings.profile.name', 'Full Name')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...registerProfile('name')}
                        disabled={!isEditing || updateProfile.isPending}
                        placeholder={t('settings.profile.namePlaceholder', 'Enter your full name')}
                        className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                          profileErrors.name ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                        } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                      {profileErrors.name && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={14} /> {profileErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        {t('settings.profile.email', 'Email Address')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...registerProfile('email')}
                        disabled={!isEditing || updateProfile.isPending}
                        placeholder={t('settings.profile.emailPlaceholder', 'Enter your email address')}
                        className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                          profileErrors.email ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                        } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                      {profileErrors.email && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={14} /> {profileErrors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Role-specific fields */}
                    {profile.role === 'orthophoniste' && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            {t('settings.profile.specialization', 'Specialization')}
                          </label>
                          <input
                            type="text"
                            {...registerProfile('specialization')}
                            disabled={!isEditing || updateProfile.isPending}
                            placeholder={t('settings.profile.specializationPlaceholder', 'Enter your specialization')}
                            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                              profileErrors.specialization ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                            } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            {t('settings.profile.licenseNumber', 'License Number')}
                          </label>
                          <input
                            type="text"
                            {...registerProfile('licenseNumber')}
                            disabled={!isEditing || updateProfile.isPending}
                            placeholder={t('settings.profile.licenseNumberPlaceholder', 'Enter your license number')}
                            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                              profileErrors.licenseNumber ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                            } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                          />
                        </div>
                      </>
                    )}

                    {profile.role === 'parent' && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          {t('settings.profile.childName', 'Child Name')}
                        </label>
                        <input
                          type="text"
                          {...registerProfile('childName')}
                          disabled={!isEditing || updateProfile.isPending}
                          placeholder={t('settings.profile.childNamePlaceholder', 'Enter child name')}
                          className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                            profileErrors.childName ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                          } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Avatar Tab */}
            {activeTab === 'avatar' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {t('settings.avatar.title', 'Profile Avatar')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.avatar.subtitle', 'Upload or change your profile picture')}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6 p-8 bg-gray-50 rounded-lg">
                  {/* Avatar Preview */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-semibold overflow-hidden border-4 border-white shadow-lg">
                      {displayAvatar ? (
                        <img 
                          src={displayAvatar} 
                          alt={profile.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = profile.name?.charAt(0)?.toUpperCase() || 'U';
                          }}
                        />
                      ) : (
                        <span className="text-4xl font-bold">
                          {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    {selectedFile && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {t('settings.avatar.new', 'New')}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>

                  {/* File Input */}
                  <div className="w-full max-w-md">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <Camera size={20} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {selectedFile ? selectedFile.name : t('settings.avatar.selectImage', 'Click to select an image')}
                      </span>
                    </label>
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedFile && (
                      <button
                        onClick={handleAvatarSubmit}
                        disabled={uploadAvatar.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {uploadAvatar.isPending ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            {t('settings.avatar.uploading', 'Uploading...')}
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            {t('settings.avatar.upload', 'Upload Avatar')}
                          </>
                        )}
                      </button>
                    )}
                    
                    {profile.avatar && !selectedFile && (
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={removeAvatar.isPending}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {removeAvatar.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        {t('settings.avatar.remove', 'Remove Avatar')}
                      </button>
                    )}
                    
                    {selectedFile && (
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setAvatarPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                        {t('common.cancel', 'Cancel')}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center max-w-sm">
                    {t('settings.avatar.supportedFormats', 'Supported formats: JPEG, PNG, GIF, WEBP. Maximum file size: 5MB.')}
                  </p>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {t('settings.password.title', 'Change Password')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.password.subtitle', 'Update your password to keep your account secure')}
                  </p>
                </div>

                <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {t('settings.password.current', 'Current Password')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword')}
                      placeholder="••••••••"
                      disabled={changePassword.isPending}
                      className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        passwordErrors.currentPassword ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                      }`}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {t('settings.password.new', 'New Password')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...registerPassword('newPassword')}
                      placeholder="••••••••"
                      disabled={changePassword.isPending}
                      className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        passwordErrors.newPassword ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                      }`}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {t('settings.password.confirm', 'Confirm Password')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...registerPassword('confirmPassword')}
                      placeholder="••••••••"
                      disabled={changePassword.isPending}
                      className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        passwordErrors.confirmPassword ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                      }`}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={changePassword.isPending}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {changePassword.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t('common.loading', 'Loading...')}
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {t('settings.password.update', 'Update Password')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}