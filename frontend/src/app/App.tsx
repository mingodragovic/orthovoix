// src/app/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/hooks/useLanguage';

// Layout
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Pages
import { LoginScreen } from '@/app/pages/LoginScreen';
import { RegisterScreen } from '@/app/pages/RegisterScreen';
import { ForgotPasswordScreen } from '@/app/pages/ForgotPasswordScreen';
import { VerifyOTPScreen } from '@/app/pages/VerifyOTPScreen';
import { ResetPasswordScreen } from '@/app/pages/ResetPasswordScreen';

// Orthophoniste Pages
import { OrthoDashboard } from '@/app/pages/OrthoDashboard';
import { PatientList } from '@/app/pages/PatientList';
import { PatientDetail } from '@/app/pages/PatientDetail';
import { PatientProgress } from '@/app/pages/PatientProgress';
import { ExerciseList } from '@/app/pages/ExerciseList';
import { ExerciseDetail } from '@/app/pages/ExerciseDetail';
import { ExerciseCreate } from '@/app/pages/ExerciseCreate';
import { OrthoProgress } from '@/app/pages/OrthoProgress';
import { UsersPage } from '@/app/pages/UsersPage';
import { UserDetail } from '@/app/pages/UserDetail';
import { PatientExerciseDetail } from '@/app/pages/PatientExerciseDetail';
import { PatientExerciseAssignments } from '@/app/pages/PatientExerciseAssignments';
import { OrthoRecordings } from '@/app/pages/OrthoRecordings';
import { SettingsPage } from '@/app/pages/SettingsPage';

// Parent Pages
import { ParentExercises } from '@/app/pages/ParentExercises';
import { ParentExerciseDetail } from '@/app/pages/ParentExerciseDetail';
import { ParentProgress } from '@/app/pages/ParentProgress';
import { ParentAppointments } from '@/app/pages/ParentAppointments';
import { ParentAppointmentDetail } from '@/app/pages/ParentAppointmentDetail';
import { ParentNotifications } from '@/app/pages/ParentNotifications';
import { ParentProfile } from '@/app/pages/ParentProfile';
import { ExercisePractice } from '@/app/pages/ExercisePractice';

// Legacy Pages (to be deprecated)
import { ParentDashboard } from '@/app/pages/ParentDashboard';
import { ParentHome } from './components/parent/ParentHome';
import { AdminAppointments } from './pages/AdminAppointments';
import { AdminRecordings } from './pages/AdminRecordings';
import { AdminAppointmentDetail } from './pages/AdminAppointmentDetail';
import { ParentSubmissionDetail } from './pages/ParentSubmissionDetail';
import { ParentSubmissions } from './pages/ParentSubmissions';
import { AdminSubmissionDetail } from './pages/AdminSubmissionDetail';
import { AdminSubmissions } from './pages/AdminSubmissions';
import { AdminNotifications } from './pages/AdminNotifications';
import { PWAUpdate } from './components/common/PWAUpdate';

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    </div>
  );
}

// App Content
function AppContent() {
  const { isRTL } = useLanguage();
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: isRTL ? 'rtl:text-right' : 'ltr:text-left',
          duration: 4000,
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      />
      <PWAUpdate />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/verify-otp" element={<VerifyOTPScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />

        {/* Protected Routes */}
        <Route element={<AppLayout />}>
          {/* Orthophoniste Routes */}
          <Route
            path="/ortho-dashboard"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <OrthoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <PatientList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <PatientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:patientId/progress"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <PatientProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-exercises/:id"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <PatientExerciseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-exercises"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <PatientExerciseAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ortho/recordings/:patientId"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <OrthoRecordings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <ExerciseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises/:id"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <ExerciseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercise-create"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <ExerciseCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ortho-progress"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <OrthoProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <UserDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste', 'parent']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
<Route
  path="/admin/submissions"
  element={
    <ProtectedRoute allowedRoles={['orthophoniste']}>
      <AdminSubmissions />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/submissions/:id"
  element={
    <ProtectedRoute allowedRoles={['orthophoniste']}>
      <AdminSubmissionDetail />
    </ProtectedRoute>
  }
/>

          {/* Parent Routes */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/exercises"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentExercises />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/exercises/:id"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentExerciseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/exercises/:id/practice"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ExercisePractice />
              </ProtectedRoute>
            }
          />
<Route
  path="/parent/submissions"
  element={
    <ProtectedRoute allowedRoles={['parent']}>
      <ParentSubmissions />
    </ProtectedRoute>
  }
/>
<Route
  path="/parent/submissions/:id"
  element={
    <ProtectedRoute allowedRoles={['parent']}>
      <ParentSubmissionDetail />
    </ProtectedRoute>
  }
/>
          <Route
            path="/parent/progress"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/appointments"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/appointments/:id"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentAppointmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/notifications"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/profile"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentProfile />
              </ProtectedRoute>
            }
          />

          {/* Legacy Parent Routes (to be deprecated) */}
          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
<Route
  path="/appointments"
  element={
    <ProtectedRoute allowedRoles={['orthophoniste']}>
      <AdminAppointments />
    </ProtectedRoute>
  }
/>
<Route
  path="/appointments/:id"
  element={
    <ProtectedRoute allowedRoles={['orthophoniste']}>
      <AdminAppointmentDetail />
    </ProtectedRoute>
  }
/>
<Route
  path="/notifications"
  element={
    <ProtectedRoute allowedRoles={['orthophoniste']}>
      <AdminNotifications />
    </ProtectedRoute>
  }
/>
<Route
  path="/recordings"
  element={
    <ProtectedRoute allowedRoles={['orthophoniste']}>
      <AdminRecordings />
    </ProtectedRoute>
  }
/>
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

// Root App
export default function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <I18nProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </I18nProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}