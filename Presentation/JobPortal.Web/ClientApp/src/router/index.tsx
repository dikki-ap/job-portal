import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PublicLayout } from '../components/layout/PublicLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/public/HomePage';
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
import { JobPostsPage } from '../features/jobPosts/pages/JobPostsPage';
import { CreateJobPostPage } from '../features/jobPosts/pages/CreateJobPostPage';
import { EditJobPostPage } from '../features/jobPosts/pages/EditJobPostPage';
import { HiringTemplatesPage } from '../features/hiringTemplates/pages/HiringTemplatesPage';
import { ApplicationsPage } from '../features/applications/pages/ApplicationsPage';
import { ApplicationDetailPage } from '../features/applications/pages/ApplicationDetailPage';
import { CareersPage } from '../features/careers/pages/CareersPage';
import { CareerDetailPage } from '../features/careers/pages/CareerDetailPage';
import { ApplyPage } from '../features/careers/pages/ApplyPage';
import { MyApplicationsPage } from '../features/myApplications/pages/MyApplicationsPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Public company profile */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="careers/:id" element={<CareerDetailPage />} />
      </Route>

      {/* Apply page — standalone (has its own auth gate) */}
      <Route path="careers/:id/apply" element={<ApplyPage />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* HR / Candidate Dashboard */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
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
        <Route path="master/hiring-templates" element={<HiringTemplatesPage />} />
        <Route path="jobs" element={<JobPostsPage />} />
        <Route path="jobs/create" element={<CreateJobPostPage />} />
        <Route path="jobs/:id/edit" element={<EditJobPostPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="applications/:id" element={<ApplicationDetailPage />} />
        <Route path="my-applications" element={<MyApplicationsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
