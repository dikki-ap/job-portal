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
