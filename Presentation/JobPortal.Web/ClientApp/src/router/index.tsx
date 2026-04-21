import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DepartmentsPage } from '../features/departments/pages/DepartmentsPage';
import { SkillsPage } from '../features/skills/pages/SkillsPage';
import { WorkModesPage } from '../features/workModes/pages/WorkModesPage';
import { EmploymentTypesPage } from '../features/employmentTypes/pages/EmploymentTypesPage';
import { JobCategoriesPage } from '../features/jobCategories/pages/JobCategoriesPage';
import { JobLevelsPage } from '../features/jobLevels/pages/JobLevelsPage';
import { CurrencyTypesPage } from '../features/currencyTypes/pages/CurrencyTypesPage';
import { DocumentTypesPage } from '../features/documentTypes/pages/DocumentTypesPage';
import { EducationLevelsPage } from '../features/educationLevels/pages/EducationLevelsPage';
import { EducationMajorsPage } from '../features/educationMajors/pages/EducationMajorsPage';
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
        <Route path="master/skills" element={<SkillsPage />} />
        <Route path="master/work-modes" element={<WorkModesPage />} />
        <Route path="master/employment-types" element={<EmploymentTypesPage />} />
        <Route path="master/job-categories" element={<JobCategoriesPage />} />
        <Route path="master/job-levels" element={<JobLevelsPage />} />
        <Route path="master/currency-types" element={<CurrencyTypesPage />} />
        <Route path="master/document-types" element={<DocumentTypesPage />} />
        <Route path="master/education-levels" element={<EducationLevelsPage />} />
        <Route path="master/education-majors" element={<EducationMajorsPage />} />
        <Route path="jobs" element={<ComingSoonPage title="Job Management" />} />
        <Route path="applications" element={<ComingSoonPage title="Applications" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
