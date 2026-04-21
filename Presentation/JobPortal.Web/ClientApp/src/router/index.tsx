import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DepartmentsPage } from '../features/departments/pages/DepartmentsPage';
import { ComingSoonPage } from '../pages/ComingSoonPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="master/departments" element={<DepartmentsPage />} />
        <Route path="master/skills" element={<ComingSoonPage title="Skill Management" />} />
        <Route path="master/work-modes" element={<ComingSoonPage title="Work Mode Management" />} />
        <Route path="master/employment-types" element={<ComingSoonPage title="Employment Type Management" />} />
        <Route path="master/job-categories" element={<ComingSoonPage title="Job Category Management" />} />
        <Route path="master/job-levels" element={<ComingSoonPage title="Job Level Management" />} />
        <Route path="jobs" element={<ComingSoonPage title="Job Management" />} />
        <Route path="applications" element={<ComingSoonPage title="Applications" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
