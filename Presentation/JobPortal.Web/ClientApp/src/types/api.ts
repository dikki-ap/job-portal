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
