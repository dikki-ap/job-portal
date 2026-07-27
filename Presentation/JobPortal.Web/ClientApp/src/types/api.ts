export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface DepartmentDto {
  id: number;
  name: string;
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface SkillDto {
  id: number;
  name: string;
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface JobSkillDto {
  id: number;
  name: string;
}

export interface JobMajorDto {
  id: number;
  name: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WorkModeDto {
  id: number;
  name: string;
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface EmploymentTypeDto {
  id: number;
  name: string;
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface JobCategoryDto {
  id: number;
  name: string;
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface JobLevelDto {
  id: number;
  name: string;
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface CurrencyTypeDto {
  id: number;
  name: string;
  prefix: string;
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface DocumentTypeDto {
  id: number;
  name: string;
  maxFileSizeMb: number;
  isDefaultRequired: boolean;
  allowedMimeTypes: string[];
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface EducationLevelDto {
  id: number;
  name: string;
  level: number;
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface JobStepDto {
  id: number;
  name: string;
  stepOrder: number;
  isRequired: boolean;
  passEmailSubject: string | null;
  passEmailBody: string | null;
  failEmailSubject: string | null;
  failEmailBody: string | null;
}

export interface JobRequiredDocumentDto {
  documentTypeId: number;
  documentTypeName: string;
  isRequired: boolean;
}

export interface CandidateSkillDto {
  skillId: number;
  skillName: string;
  skillLevel: string;
}

export interface CandidateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  educationLevelId: number | null;
  educationLevelName: string | null;
  cvDocumentId: number | null;
  cvOriginalFileName: string | null;
  educationMajorId: number | null;
  educationMajorName: string | null;
  educationMajorCustom: string | null;
  institutionName: string | null;
  educationStartYear: number | null;
  educationEndYear: number | null;
  dateOfBirth: string | null;
}

export interface JobPostDto {
  id: number;
  title: string;
  slug: string;
  status: string;
  city: string;
  country: string;
  description: string;
  departmentId: number;
  departmentName: string;
  jobCategoryId: number;
  jobCategoryName: string;
  jobLevelId: number;
  jobLevelName: string;
  employmentTypeId: number;
  employmentTypeName: string;
  workModeId: number;
  workModeName: string;
  minEducationLevelId: number | null;
  minEducationLevelName: string | null;
  minExperienceYears: number;
  minSalary: number | null;
  maxSalary: number | null;
  isSalaryVisible: boolean;
  currencyTypeId: number | null;
  currencyTypePrefix: string | null;
  quota: number;
  publishDate: string | null;
  closeDate: string | null;
  steps: JobStepDto[];
  requiredSkills: JobSkillDto[];
  requiredDocuments: JobRequiredDocumentDto[];
  preferredMajors: JobMajorDto[];
  createdAt: string;
  createdByName: string | null;
}

export interface HiringTemplateStepDto {
  id: number;
  name: string;
  stepOrder: number;
  isRequired: boolean;
  passEmailSubject: string | null;
  passEmailBody: string | null;
  failEmailSubject: string | null;
  failEmailBody: string | null;
}

export interface HiringTemplateDto {
  id: number;
  name: string;
  description: string | null;
  steps: HiringTemplateStepDto[];
  createdAt: string;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
}

export interface UploadDocumentResult {
  id: number;
  originalFileName: string;
}

export interface ApplicationStepDto {
  id: number;
  jobStepId: number;
  stepName: string;
  stepOrder: number;
  isRequired: boolean;
  status: string;
  completedAt: string | null;
}

export interface ApplicationDocumentDto {
  id: number;
  documentType: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  createdAt: string;
  isCompanyDocument: boolean;
}

export interface ApplicationDto {
  id: number;
  code: string;
  jobPostId: number;
  jobPostTitle: string;
  jobPostSlug: string | null;
  jobPostCity: string | null;
  jobPostCountry: string | null;
  jobPostDepartmentName: string | null;
  jobPostEmploymentTypeName: string | null;
  jobPostWorkModeName: string | null;
  jobPostJobLevelName: string | null;
  userId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  candidateEducationLevelName: string | null;
  candidateEducationMajorName: string | null;
  candidateInstitutionName: string | null;
  candidateEducationStartYear: number | null;
  candidateEducationEndYear: number | null;
  candidateDateOfBirth: string | null;
  status: string;
  appliedAt: string;
  updatedAt: string;
  steps: ApplicationStepDto[];
  documents: ApplicationDocumentDto[];
  rating: number | null;
  ratingNote: string | null;
  ratedAt: string | null;
  dmRating: number | null;
  dmRatingNote: string | null;
  dmRatedAt: string | null;
}

export interface EducationMajorDto {
  id: number;
  name: string;
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface ApprovalLevelDto {
  id: number;
  name: string;
  levelOrder: number;
  approverName: string;
  approverEmail: string;
  isActive: boolean;
  createdAt: string;
  createdByName: string | null;
}

export interface PendingApprovalDto {
  jobPostId: number;
  jobTitle: string;
  department: string;
  currentStepOrder: number;
  totalSteps: number;
  submittedAt: string;
}

export interface ApprovalStepStatusDto {
  stepOrder: number;
  approverName: string;
  approverEmail: string;
  status: string;
  comment: string | null;
  actionAt: string | null;
}

export interface ApprovalStatusDto {
  instanceStatus: string;
  startedAt: string;
  completedAt: string | null;
  steps: ApprovalStepStatusDto[];
}

export interface DepartmentManagerDto {
  id: number;
  fullName: string;
  position: string;
  email: string;
  departmentIds: number[];
  departmentNames: string[];
  createdAt: string;
  createdByUserId: number;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByUserId: number | null;
  updatedByName: string | null;
}

export interface IsDepartmentManagerDto {
  isDepartmentManager: boolean;
  departmentIds: number[];
  departmentNames: string[];
}
