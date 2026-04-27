import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Mail,
  ChevronRight,
} from "lucide-react";
import { RichTextEditor } from "../../../components/ui/RichTextEditor";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../components/ui/Input";
import { SearchableSelect } from "../../../components/ui/SearchableSelect";
import { Button } from "../../../components/ui/Button";
import { Spinner } from "../../../components/ui/Spinner";
import { SkillPicker } from "../../../components/ui/SkillPicker";
import {
  useCreateJobPostMutation,
  useUpdateJobPostMutation,
} from "../api/jobPostsApi";
import { useGetDepartmentsQuery } from "../../departments/api/departmentsApi";
import { useGetJobCategoriesQuery } from "../../jobCategories/api/jobCategoriesApi";
import { useGetJobLevelsQuery } from "../../jobLevels/api/jobLevelsApi";
import { useGetEmploymentTypesQuery } from "../../employmentTypes/api/employmentTypesApi";
import { useGetWorkModesQuery } from "../../workModes/api/workModesApi";
import { useGetEducationLevelsQuery } from "../../educationLevels/api/educationLevelsApi";
import { useGetCurrencyTypesQuery } from "../../currencyTypes/api/currencyTypesApi";
import { useGetSkillsQuery } from "../../skills/api/skillsApi";
import { useGetEducationMajorsQuery } from "../../educationMajors/api/educationMajorsApi";
import { useGetHiringTemplatesQuery } from "../../hiringTemplates/api/hiringTemplatesApi";
import { useGetDocumentTypesQuery } from "../../documentTypes/api/documentTypesApi";
import type { JobPostDto } from "../../../types/api";

interface StepItem {
  tempId: string;
  name: string;
  isRequired: boolean;
  passEmailSubject: string;
  passEmailBody: string;
  failEmailSubject: string;
  failEmailBody: string;
  emailOpen: boolean;
}

const emptyStep = (): StepItem => ({
  tempId: crypto.randomUUID(),
  name: "",
  isRequired: true,
  passEmailSubject: "",
  passEmailBody: "",
  failEmailSubject: "",
  failEmailBody: "",
  emailOpen: false,
});

interface RequiredDocItem {
  documentTypeId: number;
  isRequired: boolean;
}

interface JobPostFormProps {
  editing?: JobPostDto | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function JobPostForm({ editing, onSuccess, onError }: JobPostFormProps) {
  const navigate = useNavigate();

  // Field states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [jobCategoryId, setJobCategoryId] = useState("");
  const [jobLevelId, setJobLevelId] = useState("");
  const [employmentTypeId, setEmploymentTypeId] = useState("");
  const [workModeId, setWorkModeId] = useState("");
  const [minEducationLevelId, setMinEducationLevelId] = useState("");
  const [minExperienceYears, setMinExperienceYears] = useState("0");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);
  const [currencyTypeId, setCurrencyTypeId] = useState("");
  const [quota, setQuota] = useState("1");
  const [publishDate, setPublishDate] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [steps, setSteps] = useState<StepItem[]>([emptyStep()]);
  const [requiredSkillIds, setRequiredSkillIds] = useState<number[]>([]);
  const [preferredMajorIds, setPreferredMajorIds] = useState<number[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocItem[]>(
    [],
  );

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API mutations
  const [createJobPost, { isLoading: isCreating }] = useCreateJobPostMutation();
  const [updateJobPost, { isLoading: isUpdating }] = useUpdateJobPostMutation();
  const isLoading = isCreating || isUpdating;

  // Dropdown data
  const { data: departments = [] } = useGetDepartmentsQuery();
  const { data: jobCategories = [] } = useGetJobCategoriesQuery();
  const { data: jobLevels = [] } = useGetJobLevelsQuery();
  const { data: employmentTypes = [] } = useGetEmploymentTypesQuery();
  const { data: workModes = [] } = useGetWorkModesQuery();
  const { data: educationLevels = [] } = useGetEducationLevelsQuery();
  const { data: currencyTypes = [] } = useGetCurrencyTypesQuery();
  const { data: skills = [] } = useGetSkillsQuery();
  const { data: educationMajors = [] } = useGetEducationMajorsQuery();
  const { data: hiringTemplates = [] } = useGetHiringTemplatesQuery();
  const { data: documentTypes = [] } = useGetDocumentTypesQuery();

  // Merge globally-required document types into the list whenever documentTypes loads.
  // Works for both new jobs (prev=[]) and existing jobs (prev loaded from DB).
  // Uses functional update so it never overwrites manually unchecked optional types.
  useEffect(() => {
    if (documentTypes.length === 0) return;
    setRequiredDocuments((prev) => {
      const existingIds = new Set(prev.map((r) => r.documentTypeId));
      const toAdd = documentTypes
        .filter((d) => d.isDefaultRequired && !existingIds.has(d.id))
        .map((d) => ({ documentTypeId: d.id, isRequired: true }));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, [documentTypes]);

  // Pre-populate when editing
  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description);
      setCity(editing.city);
      setCountry(editing.country);
      setDepartmentId(String(editing.departmentId));
      setJobCategoryId(String(editing.jobCategoryId));
      setJobLevelId(String(editing.jobLevelId));
      setEmploymentTypeId(String(editing.employmentTypeId));
      setWorkModeId(String(editing.workModeId));
      setMinEducationLevelId(
        editing.minEducationLevelId ? String(editing.minEducationLevelId) : "",
      );
      setMinExperienceYears(String(editing.minExperienceYears));
      setMinSalary(editing.minSalary != null ? String(editing.minSalary) : "");
      setMaxSalary(editing.maxSalary != null ? String(editing.maxSalary) : "");
      setIsSalaryVisible(editing.isSalaryVisible);
      setCurrencyTypeId(
        editing.currencyTypeId ? String(editing.currencyTypeId) : "",
      );
      setQuota(String(editing.quota));
      setPublishDate(
        editing.publishDate ? editing.publishDate.split("T")[0] : "",
      );
      setCloseDate(editing.closeDate ? editing.closeDate.split("T")[0] : "");
      setSteps(
        editing.steps.map((s) => ({
          tempId: crypto.randomUUID(),
          name: s.name,
          isRequired: s.isRequired,
          passEmailSubject: s.passEmailSubject ?? "",
          passEmailBody: s.passEmailBody ?? "",
          failEmailSubject: s.failEmailSubject ?? "",
          failEmailBody: s.failEmailBody ?? "",
          emailOpen: !!(s.passEmailSubject || s.failEmailSubject),
        })),
      );
      setRequiredSkillIds(editing.requiredSkills.map((s) => s.id));
      setPreferredMajorIds(editing.preferredMajors.map((m) => m.id));
      setRequiredDocuments(
        editing.requiredDocuments.map((d) => ({
          documentTypeId: d.documentTypeId,
          isRequired: d.isRequired,
        })),
      );
    }
  }, [editing]);

  const addStep = () => setSteps((prev) => [...prev, emptyStep()]);
  const toggleStepEmail = (tempId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.tempId === tempId ? { ...s, emailOpen: !s.emailOpen } : s,
      ),
    );
  };
  const removeStep = (tempId: string) =>
    setSteps((prev) => prev.filter((s) => s.tempId !== tempId));
  const moveStep = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= steps.length) return;
    setSteps((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  };
  const updateStep = (
    tempId: string,
    field: keyof Omit<StepItem, "tempId">,
    value: string | boolean,
  ) => {
    setSteps((prev) =>
      prev.map((s) => (s.tempId === tempId ? { ...s, [field]: value } : s)),
    );
    setErrors((prev) => ({ ...prev, steps: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!city.trim()) errs.city = "City is required.";
    if (!country.trim()) errs.country = "Country is required.";
    if (!departmentId) errs.departmentId = "Department is required.";
    if (!jobCategoryId) errs.jobCategoryId = "Job category is required.";
    if (!jobLevelId) errs.jobLevelId = "Job level is required.";
    if (!employmentTypeId)
      errs.employmentTypeId = "Employment type is required.";
    if (!workModeId) errs.workModeId = "Work mode is required.";
    if (!quota || parseInt(quota) < 1) errs.quota = "Quota must be at least 1.";
    if (steps.length === 0)
      errs.steps = "At least one hiring step is required.";
    if (steps.some((s) => !s.name.trim()))
      errs.steps = "All step names must be filled.";
    if (minSalary && maxSalary && parseFloat(minSalary) > parseFloat(maxSalary))
      errs.maxSalary = "Max salary must be \u2265 min salary.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim(),
    city: city.trim(),
    country: country.trim(),
    departmentId: parseInt(departmentId),
    workModeId: parseInt(workModeId),
    employmentTypeId: parseInt(employmentTypeId),
    jobCategoryId: parseInt(jobCategoryId),
    jobLevelId: parseInt(jobLevelId),
    minEducationLevelId: minEducationLevelId
      ? parseInt(minEducationLevelId)
      : null,
    minExperienceYears: parseInt(minExperienceYears) || 0,
    minSalary: minSalary ? parseFloat(minSalary) : null,
    maxSalary: maxSalary ? parseFloat(maxSalary) : null,
    isSalaryVisible,
    currencyTypeId: currencyTypeId ? parseInt(currencyTypeId) : null,
    quota: parseInt(quota),
    publishDate: publishDate || null,
    closeDate: closeDate || null,
    steps: steps.map((s) => ({
      name: s.name.trim(),
      isRequired: s.isRequired,
      passEmailSubject: s.passEmailSubject.trim() || null,
      passEmailBody: s.passEmailBody.trim() || null,
      failEmailSubject: s.failEmailSubject.trim() || null,
      failEmailBody: s.failEmailBody.trim() || null,
    })),
    requiredSkillIds,
    requiredDocuments,
    preferredMajorIds,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editing) {
        await updateJobPost({ id: editing.id, ...buildPayload() }).unwrap();
        onSuccess("Job post updated successfully.");
      } else {
        await createJobPost(buildPayload()).unwrap();
        onSuccess("Job post created successfully.");
      }
      navigate("/jobs");
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })
        ?.data;
      onError(
        data?.errors?.[0] ?? data?.error ?? "An unexpected error occurred.",
      );
    }
  };

  const clearError = (field: string) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Basic Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">
          Basic Information
        </h2>
        <Input
          id="jp-title"
          label="Job Title"
          placeholder="e.g. Senior Backend Engineer"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearError("title");
          }}
          error={errors.title}
          disabled={isLoading}
        />
        <RichTextEditor
          id="jp-desc"
          label="Description"
          value={description}
          onChange={(html) => {
            setDescription(html);
            clearError("description");
          }}
          placeholder="Describe the role, responsibilities, and requirements..."
          disabled={isLoading}
          minHeight="10rem"
          error={errors.description}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="jp-city"
            label="City"
            placeholder="e.g. Jakarta"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              clearError("city");
            }}
            error={errors.city}
            disabled={isLoading}
          />
          <Input
            id="jp-country"
            label="Country"
            placeholder="e.g. Indonesia"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              clearError("country");
            }}
            error={errors.country}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Classification */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">
          Classification
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SearchableSelect
            id="jp-dept"
            label="Department"
            value={departmentId}
            onChange={(value) => {
              setDepartmentId(value);
              clearError("departmentId");
            }}
            placeholder="Select department"
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            error={errors.departmentId}
            disabled={isLoading}
          />
          <SearchableSelect
            id="jp-cat"
            label="Job Category"
            value={jobCategoryId}
            onChange={(value) => {
              setJobCategoryId(value);
              clearError("jobCategoryId");
            }}
            placeholder="Select category"
            options={jobCategories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.jobCategoryId}
            disabled={isLoading}
          />
          <SearchableSelect
            id="jp-level"
            label="Job Level"
            value={jobLevelId}
            onChange={(value) => {
              setJobLevelId(value);
              clearError("jobLevelId");
            }}
            placeholder="Select level"
            options={jobLevels.map((l) => ({ value: l.id, label: l.name }))}
            error={errors.jobLevelId}
            disabled={isLoading}
          />
          <SearchableSelect
            id="jp-emptype"
            label="Employment Type"
            value={employmentTypeId}
            onChange={(value) => {
              setEmploymentTypeId(value);
              clearError("employmentTypeId");
            }}
            placeholder="Select type"
            options={employmentTypes.map((t) => ({
              value: t.id,
              label: t.name,
            }))}
            error={errors.employmentTypeId}
            disabled={isLoading}
          />
          <SearchableSelect
            id="jp-workmode"
            label="Work Mode"
            value={workModeId}
            onChange={(value) => {
              setWorkModeId(value);
              clearError("workModeId");
            }}
            placeholder="Select work mode"
            options={workModes.map((m) => ({ value: m.id, label: m.name }))}
            error={errors.workModeId}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Requirements</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SearchableSelect
            id="jp-edu"
            label="Minimum Education Level"
            value={minEducationLevelId}
            onChange={(value) => setMinEducationLevelId(value)}
            placeholder="Any"
            options={educationLevels.map((e) => ({
              value: e.id,
              label: e.name,
            }))}
            disabled={isLoading}
          />
          <Input
            id="jp-exp"
            label="Minimum Experience (years)"
            type="number"
            min={0}
            value={minExperienceYears}
            onChange={(e) => setMinExperienceYears(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <SkillPicker
          label="Required Skills"
          options={skills}
          selectedIds={requiredSkillIds}
          onChange={setRequiredSkillIds}
          disabled={isLoading}
        />
        <SkillPicker
          label="Preferred Education Majors"
          entityName="major"
          placeholder="Search and add majors..."
          options={educationMajors}
          selectedIds={preferredMajorIds}
          onChange={setPreferredMajorIds}
          disabled={isLoading}
        />
      </div>

      {/* Required Documents */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">
          Required Documents
        </h2>
        {documentTypes.length === 0 ? (
          <p className="text-sm text-gray-400">
            No document types configured. Add document types in Master Settings
            first.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {documentTypes.map((dt) => {
              const entry = requiredDocuments.find(
                (r) => r.documentTypeId === dt.id,
              );
              const isChecked = !!entry;
              const isGlobalDefault = dt.isDefaultRequired;
              return (
                <div
                  key={dt.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2.5"
                >
                  <input
                    type="checkbox"
                    id={`doc-${dt.id}`}
                    checked={isChecked}
                    disabled={isLoading || isGlobalDefault}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRequiredDocuments((prev) => [
                          ...prev,
                          { documentTypeId: dt.id, isRequired: true },
                        ]);
                      } else {
                        setRequiredDocuments((prev) =>
                          prev.filter((r) => r.documentTypeId !== dt.id),
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-[#004181] focus:ring-[#004181] disabled:opacity-60"
                  />
                  <label
                    htmlFor={`doc-${dt.id}`}
                    className="flex-1 text-sm text-gray-900"
                  >
                    {dt.name}
                    {isGlobalDefault && (
                      <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                        Global default
                      </span>
                    )}
                    <span className="ml-1.5 text-xs text-gray-400">
                      (
                      {dt.allowedMimeTypes
                        .map((m) => m.split("/")[1]?.toUpperCase())
                        .join(", ")}
                      , max {dt.maxFileSizeMb} MB)
                    </span>
                  </label>
                  {isChecked && (
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                      <input
                        type="checkbox"
                        checked={entry.isRequired}
                        disabled={isLoading}
                        onChange={(e) => {
                          setRequiredDocuments((prev) =>
                            prev.map((r) =>
                              r.documentTypeId === dt.id
                                ? { ...r, isRequired: e.target.checked }
                                : r,
                            ),
                          );
                        }}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-[#004181]"
                      />
                      Required
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compensation */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">
          Compensation &amp; Quota
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SearchableSelect
            id="jp-currency"
            label="Currency"
            value={currencyTypeId}
            onChange={(value) => setCurrencyTypeId(value)}
            placeholder="Select currency (optional)"
            options={currencyTypes.map((c) => ({
              value: c.id,
              label: `${c.prefix} \u2014 ${c.name}`,
            }))}
            disabled={isLoading}
          />
          <Input
            id="jp-quota"
            label="Quota (headcount)"
            type="number"
            min={1}
            value={quota}
            onChange={(e) => {
              setQuota(e.target.value);
              clearError("quota");
            }}
            error={errors.quota}
            disabled={isLoading}
          />
          <Input
            id="jp-minsalary"
            label="Min Salary (optional)"
            type="number"
            min={0}
            value={minSalary}
            onChange={(e) => {
              setMinSalary(e.target.value);
              clearError("minSalary");
            }}
            disabled={isLoading}
          />
          <Input
            id="jp-maxsalary"
            label="Max Salary (optional)"
            type="number"
            min={0}
            value={maxSalary}
            onChange={(e) => {
              setMaxSalary(e.target.value);
              clearError("maxSalary");
            }}
            error={errors.maxSalary}
            disabled={isLoading}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSalaryVisible}
            onChange={(e) => setIsSalaryVisible(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-[#004181] focus:ring-[#004181]"
          />
          <span className="text-sm text-gray-700">
            Show salary range to applicants
          </span>
        </label>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Timeline</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="jp-pubdate"
            label="Publish Date (optional)"
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            disabled={isLoading}
          />
          <Input
            id="jp-closedate"
            label="Close Date (optional)"
            type="date"
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Hiring Steps */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            Hiring Steps
          </h2>
          {hiringTemplates.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 shrink-0">Load template:</span>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const tmpl = hiringTemplates.find(
                    (t) => t.id === parseInt(e.target.value),
                  );
                  if (tmpl) {
                    setSteps(
                      tmpl.steps.map((s) => ({
                        tempId: crypto.randomUUID(),
                        name: s.name,
                        isRequired: s.isRequired,
                        passEmailSubject: s.passEmailSubject ?? "",
                        passEmailBody: s.passEmailBody ?? "",
                        failEmailSubject: s.failEmailSubject ?? "",
                        failEmailBody: s.failEmailBody ?? "",
                        emailOpen: !!(s.passEmailSubject || s.failEmailSubject),
                      })),
                    );
                    setErrors((prev) => ({ ...prev, steps: "" }));
                  }
                  e.target.value = "";
                }}
                disabled={isLoading}
                className="h-8 rounded-lg border border-gray-300 bg-white px-2 text-sm focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:opacity-70"
              >
                <option value="">Select a template...</option>
                {hiringTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {errors.steps && <p className="text-xs text-red-600">{errors.steps}</p>}
        <div className="flex flex-col gap-3">
          {steps.map((step, idx) => (
            <div
              key={step.tempId}
              className="rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="flex items-center gap-2 p-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004181] text-xs font-semibold text-white">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  placeholder="e.g. CV Screening"
                  value={step.name}
                  onChange={(e) =>
                    updateStep(step.tempId, "name", e.target.value)
                  }
                  disabled={isLoading}
                  className="h-9 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:opacity-70"
                />
                <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                  <input
                    type="checkbox"
                    checked={step.isRequired}
                    onChange={(e) =>
                      updateStep(step.tempId, "isRequired", e.target.checked)
                    }
                    disabled={isLoading}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-[#004181]"
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => toggleStepEmail(step.tempId)}
                  disabled={isLoading}
                  title="Email templates"
                  className={`flex items-center gap-1 rounded px-1.5 py-1 text-xs transition-colors disabled:opacity-30 ${step.emailOpen ? "text-[#004181] bg-blue-50" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <ChevronRight
                    className={`h-3 w-3 transition-transform ${step.emailOpen ? "rotate-90" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(idx, -1)}
                  disabled={idx === 0 || isLoading}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(idx, 1)}
                  disabled={idx === steps.length - 1 || isLoading}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(step.tempId)}
                  disabled={isLoading}
                  className="text-red-400 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {step.emailOpen && (
                <div className="border-t border-gray-200 p-3 flex flex-col gap-3">
                  <p className="text-xs text-gray-500">
                    Use placeholders:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {"{{CandidateName}}"}
                    </code>{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {"{{JobTitle}}"}
                    </code>{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {"{{StepName}}"}
                    </code>{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {"{{NextStep}}"}
                    </code>
                    . Leave subject &amp; body blank to skip sending.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-green-700">
                        When Passed
                      </span>
                      <input
                        type="text"
                        placeholder="Subject (e.g. You passed {{StepName}})"
                        value={step.passEmailSubject}
                        onChange={(e) =>
                          updateStep(
                            step.tempId,
                            "passEmailSubject",
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                        className="h-8 rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:opacity-70"
                      />
                      <RichTextEditor
                        value={step.passEmailBody}
                        onChange={(html) =>
                          updateStep(step.tempId, "passEmailBody", html)
                        }
                        placeholder="Email body..."
                        disabled={isLoading}
                        compact
                        minHeight="5rem"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-red-600">
                        When Failed
                      </span>
                      <input
                        type="text"
                        placeholder="Subject (e.g. Update on your application)"
                        value={step.failEmailSubject}
                        onChange={(e) =>
                          updateStep(
                            step.tempId,
                            "failEmailSubject",
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                        className="h-8 rounded-lg border border-gray-300 bg-white px-3 text-xs focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:opacity-70"
                      />
                      <RichTextEditor
                        value={step.failEmailBody}
                        onChange={(html) =>
                          updateStep(step.tempId, "failEmailBody", html)
                        }
                        placeholder="Email body..."
                        disabled={isLoading}
                        compact
                        minHeight="5rem"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm font-medium text-[#004181] hover:text-[#003070] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add Step
        </button>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/jobs")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {editing ? "Save Changes" : "Save as Draft"}
        </Button>
      </div>
    </form>
  );
}
