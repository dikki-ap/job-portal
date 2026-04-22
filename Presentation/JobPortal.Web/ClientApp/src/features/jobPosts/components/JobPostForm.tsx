import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { SkillPicker } from '../../../components/ui/SkillPicker';
import { useCreateJobPostMutation, useUpdateJobPostMutation } from '../api/jobPostsApi';
import { useGetDepartmentsQuery } from '../../departments/api/departmentsApi';
import { useGetJobCategoriesQuery } from '../../jobCategories/api/jobCategoriesApi';
import { useGetJobLevelsQuery } from '../../jobLevels/api/jobLevelsApi';
import { useGetEmploymentTypesQuery } from '../../employmentTypes/api/employmentTypesApi';
import { useGetWorkModesQuery } from '../../workModes/api/workModesApi';
import { useGetEducationLevelsQuery } from '../../educationLevels/api/educationLevelsApi';
import { useGetCurrencyTypesQuery } from '../../currencyTypes/api/currencyTypesApi';
import { useGetSkillsQuery } from '../../skills/api/skillsApi';
import { useGetHiringTemplatesQuery } from '../../hiringTemplates/api/hiringTemplatesApi';
import type { JobPostDto } from '../../../types/api';

interface StepItem {
  tempId: string;
  name: string;
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [jobCategoryId, setJobCategoryId] = useState('');
  const [jobLevelId, setJobLevelId] = useState('');
  const [employmentTypeId, setEmploymentTypeId] = useState('');
  const [workModeId, setWorkModeId] = useState('');
  const [minEducationLevelId, setMinEducationLevelId] = useState('');
  const [minExperienceYears, setMinExperienceYears] = useState('0');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);
  const [currencyTypeId, setCurrencyTypeId] = useState('');
  const [quota, setQuota] = useState('1');
  const [publishDate, setPublishDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [steps, setSteps] = useState<StepItem[]>([{ tempId: crypto.randomUUID(), name: '', isRequired: true }]);
  const [requiredSkillIds, setRequiredSkillIds] = useState<number[]>([]);

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
  const { data: hiringTemplates = [] } = useGetHiringTemplatesQuery();

  // Pre-populate when editing
  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description);
      setLocation(editing.location);
      setDepartmentId(String(editing.departmentId));
      setJobCategoryId(String(editing.jobCategoryId));
      setJobLevelId(String(editing.jobLevelId));
      setEmploymentTypeId(String(editing.employmentTypeId));
      setWorkModeId(String(editing.workModeId));
      setMinEducationLevelId(editing.minEducationLevelId ? String(editing.minEducationLevelId) : '');
      setMinExperienceYears(String(editing.minExperienceYears));
      setMinSalary(editing.minSalary != null ? String(editing.minSalary) : '');
      setMaxSalary(editing.maxSalary != null ? String(editing.maxSalary) : '');
      setIsSalaryVisible(editing.isSalaryVisible);
      setCurrencyTypeId(editing.currencyTypeId ? String(editing.currencyTypeId) : '');
      setQuota(String(editing.quota));
      setPublishDate(editing.publishDate ? editing.publishDate.split('T')[0] : '');
      setCloseDate(editing.closeDate ? editing.closeDate.split('T')[0] : '');
      setSteps(editing.steps.map((s) => ({ tempId: crypto.randomUUID(), name: s.name, isRequired: s.isRequired })));
      setRequiredSkillIds([...editing.requiredSkillIds]);
    }
  }, [editing]);

  const addStep = () => setSteps((prev) => [...prev, { tempId: crypto.randomUUID(), name: '', isRequired: true }]);
  const removeStep = (tempId: string) => setSteps((prev) => prev.filter((s) => s.tempId !== tempId));
  const moveStep = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= steps.length) return;
    setSteps((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  };
  const updateStep = (tempId: string, field: keyof Omit<StepItem, 'tempId'>, value: string | boolean) => {
    setSteps((prev) => prev.map((s) => s.tempId === tempId ? { ...s, [field]: value } : s));
    setErrors((prev) => ({ ...prev, steps: '' }));
  };


  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (!location.trim()) errs.location = 'Location is required.';
    if (!departmentId) errs.departmentId = 'Department is required.';
    if (!jobCategoryId) errs.jobCategoryId = 'Job category is required.';
    if (!jobLevelId) errs.jobLevelId = 'Job level is required.';
    if (!employmentTypeId) errs.employmentTypeId = 'Employment type is required.';
    if (!workModeId) errs.workModeId = 'Work mode is required.';
    if (!quota || parseInt(quota) < 1) errs.quota = 'Quota must be at least 1.';
    if (steps.length === 0) errs.steps = 'At least one hiring step is required.';
    if (steps.some((s) => !s.name.trim())) errs.steps = 'All step names must be filled.';
    if (minSalary && maxSalary && parseFloat(minSalary) > parseFloat(maxSalary))
      errs.maxSalary = 'Max salary must be \u2265 min salary.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    departmentId: parseInt(departmentId),
    workModeId: parseInt(workModeId),
    employmentTypeId: parseInt(employmentTypeId),
    jobCategoryId: parseInt(jobCategoryId),
    jobLevelId: parseInt(jobLevelId),
    minEducationLevelId: minEducationLevelId ? parseInt(minEducationLevelId) : null,
    minExperienceYears: parseInt(minExperienceYears) || 0,
    minSalary: minSalary ? parseFloat(minSalary) : null,
    maxSalary: maxSalary ? parseFloat(maxSalary) : null,
    isSalaryVisible,
    currencyTypeId: currencyTypeId ? parseInt(currencyTypeId) : null,
    quota: parseInt(quota),
    publishDate: publishDate || null,
    closeDate: closeDate || null,
    steps: steps.map((s) => ({ name: s.name.trim(), isRequired: s.isRequired })),
    requiredSkillIds,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editing) {
        await updateJobPost({ id: editing.id, ...buildPayload() }).unwrap();
        onSuccess('Job post updated successfully.');
      } else {
        await createJobPost(buildPayload()).unwrap();
        onSuccess('Job post created successfully.');
      }
      navigate('/jobs');
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: string[]; error?: string } })?.data;
      onError(data?.errors?.[0] ?? data?.error ?? 'An unexpected error occurred.');
    }
  };

  const clearError = (field: string) => setErrors((prev) => ({ ...prev, [field]: '' }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Basic Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
        <Input id="jp-title" label="Job Title" placeholder="e.g. Senior Backend Engineer" value={title} onChange={(e) => { setTitle(e.target.value); clearError('title'); }} error={errors.title} disabled={isLoading} />
        <div className="flex flex-col gap-1">
          <label htmlFor="jp-desc" className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="jp-desc"
            rows={6}
            placeholder="Describe the role, responsibilities, and requirements..."
            value={description}
            onChange={(e) => { setDescription(e.target.value); clearError('description'); }}
            disabled={isLoading}
            className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70 resize-y ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          />
          {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
        </div>
        <Input id="jp-location" label="Location" placeholder="e.g. Jakarta, Indonesia" value={location} onChange={(e) => { setLocation(e.target.value); clearError('location'); }} error={errors.location} disabled={isLoading} />
      </div>

      {/* Classification */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Classification</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select id="jp-dept" label="Department" value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); clearError('departmentId'); }} placeholder="Select department" options={departments.map((d) => ({ value: d.id, label: d.name }))} error={errors.departmentId} disabled={isLoading} />
          <Select id="jp-cat" label="Job Category" value={jobCategoryId} onChange={(e) => { setJobCategoryId(e.target.value); clearError('jobCategoryId'); }} placeholder="Select category" options={jobCategories.map((c) => ({ value: c.id, label: c.name }))} error={errors.jobCategoryId} disabled={isLoading} />
          <Select id="jp-level" label="Job Level" value={jobLevelId} onChange={(e) => { setJobLevelId(e.target.value); clearError('jobLevelId'); }} placeholder="Select level" options={jobLevels.map((l) => ({ value: l.id, label: l.name }))} error={errors.jobLevelId} disabled={isLoading} />
          <Select id="jp-emptype" label="Employment Type" value={employmentTypeId} onChange={(e) => { setEmploymentTypeId(e.target.value); clearError('employmentTypeId'); }} placeholder="Select type" options={employmentTypes.map((t) => ({ value: t.id, label: t.name }))} error={errors.employmentTypeId} disabled={isLoading} />
          <Select id="jp-workmode" label="Work Mode" value={workModeId} onChange={(e) => { setWorkModeId(e.target.value); clearError('workModeId'); }} placeholder="Select work mode" options={workModes.map((m) => ({ value: m.id, label: m.name }))} error={errors.workModeId} disabled={isLoading} />
        </div>
      </div>

      {/* Requirements */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Requirements</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select id="jp-edu" label="Minimum Education Level" value={minEducationLevelId} onChange={(e) => setMinEducationLevelId(e.target.value)} placeholder="Any" options={educationLevels.map((e) => ({ value: e.id, label: e.name }))} disabled={isLoading} />
          <Input id="jp-exp" label="Minimum Experience (years)" type="number" min={0} value={minExperienceYears} onChange={(e) => setMinExperienceYears(e.target.value)} disabled={isLoading} />
        </div>
        <SkillPicker
          label="Required Skills"
          options={skills}
          selectedIds={requiredSkillIds}
          onChange={setRequiredSkillIds}
          disabled={isLoading}
        />
      </div>

      {/* Compensation */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Compensation &amp; Quota</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select id="jp-currency" label="Currency" value={currencyTypeId} onChange={(e) => setCurrencyTypeId(e.target.value)} placeholder="Select currency (optional)" options={currencyTypes.map((c) => ({ value: c.id, label: `${c.prefix} \u2014 ${c.name}` }))} disabled={isLoading} />
          <Input id="jp-quota" label="Quota (headcount)" type="number" min={1} value={quota} onChange={(e) => { setQuota(e.target.value); clearError('quota'); }} error={errors.quota} disabled={isLoading} />
          <Input id="jp-minsalary" label="Min Salary (optional)" type="number" min={0} value={minSalary} onChange={(e) => { setMinSalary(e.target.value); clearError('minSalary'); }} disabled={isLoading} />
          <Input id="jp-maxsalary" label="Max Salary (optional)" type="number" min={0} value={maxSalary} onChange={(e) => { setMaxSalary(e.target.value); clearError('maxSalary'); }} error={errors.maxSalary} disabled={isLoading} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isSalaryVisible} onChange={(e) => setIsSalaryVisible(e.target.checked)} disabled={isLoading} className="h-4 w-4 rounded border-gray-300 text-[#004181] focus:ring-[#004181]" />
          <span className="text-sm text-gray-700">Show salary range to applicants</span>
        </label>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Timeline</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="jp-pubdate" label="Publish Date (optional)" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} disabled={isLoading} />
          <Input id="jp-closedate" label="Close Date (optional)" type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} disabled={isLoading} />
        </div>
      </div>

      {/* Hiring Steps */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">Hiring Steps</h2>
          {hiringTemplates.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 shrink-0">Load template:</span>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const tmpl = hiringTemplates.find((t) => t.id === parseInt(e.target.value));
                  if (tmpl) {
                    setSteps(tmpl.steps.map((s) => ({ tempId: crypto.randomUUID(), name: s.name, isRequired: s.isRequired })));
                    setErrors((prev) => ({ ...prev, steps: '' }));
                  }
                  e.target.value = '';
                }}
                disabled={isLoading}
                className="h-8 rounded-lg border border-gray-300 bg-white px-2 text-sm focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:opacity-70"
              >
                <option value="">Select a template...</option>
                {hiringTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {errors.steps && <p className="text-xs text-red-600">{errors.steps}</p>}
        <div className="flex flex-col gap-3">
          {steps.map((step, idx) => (
            <div key={step.tempId} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#004181] text-xs font-semibold text-white">{idx + 1}</span>
              <input
                type="text"
                placeholder="e.g. CV Screening"
                value={step.name}
                onChange={(e) => updateStep(step.tempId, 'name', e.target.value)}
                disabled={isLoading}
                className="h-9 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 disabled:opacity-70"
              />
              <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                <input type="checkbox" checked={step.isRequired} onChange={(e) => updateStep(step.tempId, 'isRequired', e.target.checked)} disabled={isLoading} className="h-3.5 w-3.5 rounded border-gray-300 text-[#004181]" />
                Required
              </label>
              <button type="button" onClick={() => moveStep(idx, -1)} disabled={idx === 0 || isLoading} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <ChevronUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1 || isLoading} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <ChevronDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => removeStep(step.tempId)} disabled={isLoading} className="text-red-400 hover:text-red-600 disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addStep} disabled={isLoading} className="flex items-center gap-2 text-sm font-medium text-[#004181] hover:text-[#003070] disabled:opacity-50">
          <Plus className="h-4 w-4" /> Add Step
        </button>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate('/jobs')} disabled={isLoading}>Cancel</Button>
        <Button type="submit" loading={isLoading}>
          {editing ? 'Save Changes' : 'Save as Draft'}
        </Button>
      </div>
    </form>
  );
}
