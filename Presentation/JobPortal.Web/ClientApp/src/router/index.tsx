import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PublicLayout } from '../components/layout/PublicLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleRoute } from '../components/RoleRoute';
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
import { MyApplicationDetailPage } from '../features/myApplications/pages/MyApplicationDetailPage';
import { CandidateProfilePage } from '../features/candidateProfile/pages/CandidateProfilePage';
import { ApprovalLevelsPage } from '../features/approvalLevels/pages/ApprovalLevelsPage';
import { MyApprovalsPage } from '../features/approvals/pages/MyApprovalsPage';
import { JobPostApprovalReviewPage } from '../features/approvals/pages/JobPostApprovalReviewPage';
import { AnalyticsPage } from '../features/analytics/pages/AnalyticsPage';
import { PrivacyPolicyPage } from '../features/privacyConsent/pages/PrivacyPolicyPage';
import { PrivacyConsentSettingPage } from '../features/privacyConsent/pages/PrivacyConsentSettingPage';

const HR_ADMIN_ROLES = ['Admin', 'HR'];
const ADMIN_ROLES = ['Admin'];

export function AppRouter() {
  return (
    <Routes>
      {/* Public company profile */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="careers/:slug" element={<CareerDetailPage />} />
      </Route>

      {/* Apply page — standalone (has its own auth gate) */}
      <Route path="careers/:slug/apply" element={<ApplyPage />} />

      {/* Privacy policy — public */}
      <Route path="privacy-policy" element={<PrivacyPolicyPage />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated dashboard shell */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Candidate-accessible routes (any authenticated user) */}
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="my-applications" element={<MyApplicationsPage />} />
        <Route path="my-applications/:id" element={<MyApplicationDetailPage />} />

        {/* HR + Admin routes */}
        <Route element={<RoleRoute roles={HR_ADMIN_ROLES} />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="jobs" element={<JobPostsPage />} />
          <Route path="jobs/create" element={<CreateJobPostPage />} />
          <Route path="jobs/:id/edit" element={<EditJobPostPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="applications/:code" element={<ApplicationDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Approvals — all authenticated users (content filtered by API) */}
        <Route path="approvals" element={<MyApprovalsPage />} />
        <Route path="jobs/:id/approve" element={<JobPostApprovalReviewPage />} />

        {/* Admin-only routes */}
        <Route element={<RoleRoute roles={ADMIN_ROLES} />}>
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
          <Route path="master/approval-levels" element={<ApprovalLevelsPage />} />
          <Route path="master/privacy-consent" element={<PrivacyConsentSettingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/my-applications" replace />} />
      </Route>
    </Routes>
  );
}
