// src/config/routes.tsx
import { Navigate } from 'react-router-dom';
import { LoginScreen } from '@/app/pages/LoginScreen';
import { OrthoDashboard } from '@/app/pages/OrthoDashboard';
import { PatientList } from '@/app/pages/PatientList';
import { PatientDetail } from '@/app/pages/PatientDetail';
import { ExerciseCreate } from '@/app/pages/ExerciseCreate';
import { OrthoProgress } from '@/app/pages/OrthoProgress';
import { ParentDashboard } from '@/app/pages/ParentDashboard';
import { ParentProgress } from '@/app/pages/ParentProgress';
import { ExercisePractice } from '@/app/pages/ExercisePractice';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';

export const routes = {
  public: [
    { path: '/login', element: <LoginScreen /> },
  ],
  protected: [
    { 
      path: '/ortho-dashboard', 
      element: <ProtectedRoute allowedRoles={['orthophoniste']}>
        <OrthoDashboard />
      </ProtectedRoute>
    },
    { 
      path: '/patients', 
      element: <ProtectedRoute allowedRoles={['orthophoniste']}>
        <PatientList />
      </ProtectedRoute>
    },
    { 
      path: '/patient-detail/:id', 
      element: <ProtectedRoute allowedRoles={['orthophoniste']}>
        <PatientDetail />
      </ProtectedRoute>
    },
    { 
      path: '/exercise-create', 
      element: <ProtectedRoute allowedRoles={['orthophoniste']}>
        <ExerciseCreate />
      </ProtectedRoute>
    },
    { 
      path: '/ortho-progress', 
      element: <ProtectedRoute allowedRoles={['orthophoniste']}>
        <OrthoProgress />
      </ProtectedRoute>
    },
    { 
      path: '/parent-dashboard', 
      element: <ProtectedRoute allowedRoles={['parent']}>
        <ParentDashboard />
      </ProtectedRoute>
    },
    { 
      path: '/parent-progress', 
      element: <ProtectedRoute allowedRoles={['parent']}>
        <ParentProgress />
      </ProtectedRoute>
    },
    { 
      path: '/exercise-practice/:id', 
      element: <ProtectedRoute allowedRoles={['parent', 'orthophoniste']}>
        <ExercisePractice />
      </ProtectedRoute>
    },
    { path: '/', element: <Navigate to="/login" /> },
    { path: '*', element: <Navigate to="/login" /> },
  ]
};