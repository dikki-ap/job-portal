import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, CheckCircle2, Trash2, Loader2, X, Download, Search, ChevronDown, Check, GraduationCap } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../contexts/AuthContext';
import { downloadWithAuth } from '../../../lib/download';
import { cn } from '../../../lib/utils';
import { useGetEducationLevelsQuery } from '../../educationLevels/api/educationLevelsApi';
import { useGetEducationMajorsQuery } from '../../educationMajors/api/educationMajorsApi';
import {
  useGetProfileQuery,
  useUpsertProfileMutation,
  useLazyGetInstitutionSuggestionsQuery,
  useUploadCvMutation,
  useRemoveCvMutation,
} from '../api/candidateProfileApi';
import type { EducationMajorDto } from '../../../types/api';

const CV_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_VISIBLE_MAJORS = 5;
const CURRENT_YEAR = new Date().getFullYear();

function MajorPicker({
  majors,
  majorId,
  isOther,
  customValue,
  onSelect,
  onCustomChange,
}: {
  majors: EducationMajorDto[];
  majorId: number | null;
  isOther: boolean;
  customValue: string;
  onSelect: (id: number | null, isOther: boolean) => void;
  onCustomChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = majors.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );
  const visible = showAll ? filtered : filtered.slice(0, MAX_VISIBLE_MAJORS);
  const hasValue = isOther || majorId != null;
  const displayLabel = isOther
    ? 'Others'
    : majorId != null
      ? majors.find((m) => m.id === majorId)?.name ?? '—'
      : 'Select education major...';

  const selectItem = (id: number | null, other: boolean) => {
    onSelect(id, other);
    setOpen(false);
    setSearch('');
    setShowAll(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Education Major</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'h-10 w-full flex items-center justify-between gap-2 rounded-lg border bg-white px-3 text-sm text-left transition-colors',
            open ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20' : 'border-gray-300 hover:bg-gray-50',
            hasValue ? 'text-gray-900' : 'text-gray-400',
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <div className="flex items-center gap-1 shrink-0">
            {hasValue && (
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); onSelect(null, false); onCustomChange(''); }}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')} />
          </div>
        </button>

        {open && (
          <div className="absolute left-0 top-full z-20 mt-1 w-full min-w-[240px] rounded-xl border border-gray-200 bg-white shadow-lg">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search major..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
                  className="h-8 w-full rounded-md border border-gray-200 pl-8 pr-3 text-xs focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/20"
                />
              </div>
            </div>

            {/* Items from master */}
            <div className="py-1">
              {visible.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400 text-center">No results.</p>
              )}
              {visible.map((m) => {
                const selected = majorId === m.id && !isOther;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => selectItem(m.id, false)}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                      selected ? 'bg-blue-50 text-[var(--primary)] font-medium' : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </span>
                    {m.name}
                  </button>
                );
              })}
            </div>

            {/* Show more/less */}
            {filtered.length > MAX_VISIBLE_MAJORS && (
              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="w-full px-3 py-1.5 text-left text-xs font-medium text-[var(--primary)] hover:bg-gray-50"
                >
                  {showAll ? 'Show less' : `Show ${filtered.length - MAX_VISIBLE_MAJORS} more`}
                </button>
              </div>
            )}

            {/* Others — always visible */}
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={() => selectItem(null, true)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm italic transition-colors',
                  isOther ? 'bg-blue-50 text-[var(--primary)] font-medium' : 'text-gray-500 hover:bg-gray-50',
                )}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {isOther && <Check className="h-3.5 w-3.5" />}
                </span>
                Others (specify below)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom input shown when Others is selected */}
      {isOther && (
        <input
          type="text"
          placeholder="Enter your major..."
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          maxLength={255}
          autoFocus
          className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        />
      )}
    </div>
  );
}

function InstitutionInput({
  value,
  onChange,
  fetchSuggestions,
}: {
  value: string;
  onChange: (v: string) => void;
  fetchSuggestions: (q: string) => Promise<string[]>;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (v: string) => {
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(v.trim());
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 300);
  };

  const select = (name: string) => {
    onChange(name);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Institution Name</label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        placeholder="e.g. Universitas Indonesia"
        maxLength={255}
        className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
      />
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg py-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => select(s)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <GraduationCap className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CandidateProfilePage() {
  const { token } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: educationLevels = [] } = useGetEducationLevelsQuery();
  const { data: educationMajors = [] } = useGetEducationMajorsQuery();
  const [upsertProfile] = useUpsertProfileMutation();
  const [fetchInstitutionSuggestions] = useLazyGetInstitutionSuggestionsQuery();
  const [uploadCv] = useUploadCvMutation();
  const [removeCv, { isLoading: removingCv }] = useRemoveCvMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [educationLevelId, setEducationLevelId] = useState<number | ''>('');
  const [majorId, setMajorId] = useState<number | null>(null);
  const [majorIsOther, setMajorIsOther] = useState(false);
  const [majorCustom, setMajorCustom] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [educationStartYear, setEducationStartYear] = useState<number | ''>('');
  const [educationEndYear, setEducationEndYear] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const getSuggestions = useCallback(
    (q: string) => fetchInstitutionSuggestions(q).unwrap().catch(() => [] as string[]),
    [fetchInstitutionSuggestions],
  );

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhoneNumber(profile.phoneNumber || '');
    setDateOfBirth(profile.dateOfBirth ?? '');
    setEducationLevelId(profile.educationLevelId ?? '');
    setInstitutionName(profile.institutionName ?? '');
    setEducationStartYear(profile.educationStartYear ?? '');
    setEducationEndYear(profile.educationEndYear ?? '');
    if (profile.educationMajorCustom) {
      setMajorId(null);
      setMajorIsOther(true);
      setMajorCustom(profile.educationMajorCustom);
    } else {
      setMajorId(profile.educationMajorId ?? null);
      setMajorIsOther(false);
      setMajorCustom('');
    }
  }, [profile]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    if (!lastName.trim()) e.lastName = 'Last name is required.';
    if (!phoneNumber || phoneNumber.length < 6) e.phoneNumber = 'Valid phone number is required.';
    if (educationStartYear !== '' && (Number(educationStartYear) < 1950 || Number(educationStartYear) > CURRENT_YEAR))
      e.educationStartYear = `Year must be between 1950 and ${CURRENT_YEAR}.`;
    if (educationEndYear !== '' && educationStartYear !== '' && Number(educationEndYear) < Number(educationStartYear))
      e.educationEndYear = 'End year cannot be before start year.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (cvFile) {
        await uploadCv({ file: cvFile }).unwrap();
        setCvFile(null);
        if (cvInputRef.current) cvInputRef.current.value = '';
      }

      await upsertProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber,
        educationLevelId: educationLevelId !== '' ? Number(educationLevelId) : null,
        educationMajorId: majorIsOther ? null : majorId,
        educationMajorCustom: majorIsOther ? (majorCustom.trim() || null) : null,
        institutionName: institutionName.trim() || null,
        educationStartYear: educationStartYear !== '' ? Number(educationStartYear) : null,
        educationEndYear: educationEndYear !== '' ? Number(educationEndYear) : null,
        dateOfBirth: dateOfBirth || null,
      }).unwrap();

      addToast('Profile saved successfully.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCv = async () => {
    try {
      await removeCv().unwrap();
      addToast('CV removed.', 'success');
    } catch {
      addToast('Failed to remove CV.', 'error');
    }
  };

  const sortedEducationLevels = [...educationLevels].sort((a, b) => b.level - a.level);
  const sortedMajors = [...educationMajors].sort((a, b) => a.name.localeCompare(b.name));

  if (profileLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">Complete your profile so HR can review your application.</p>
      </div>

      {/* Personal Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="firstName"
            label="First Name *"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: '' })); }}
            error={errors.firstName}
            placeholder="John"
          />
          <Input
            id="lastName"
            label="Last Name *"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: '' })); }}
            error={errors.lastName}
            placeholder="Doe"
          />
        </div>
        <PhoneInput
          id="phoneNumber"
          label="Phone Number *"
          value={phoneNumber}
          onChange={(v) => { setPhoneNumber(v); setErrors((p) => ({ ...p, phoneNumber: '' })); }}
          error={errors.phoneNumber}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split('T')[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
            className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>
      </div>

      {/* Education */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Education</h2>
        <Select
          id="educationLevel"
          label="Highest Education Level"
          value={educationLevelId}
          onChange={(e) => setEducationLevelId(e.target.value !== '' ? Number(e.target.value) : '')}
          options={sortedEducationLevels.map((el) => ({ value: el.id, label: el.name }))}
          placeholder="— Select education level —"
        />
        <MajorPicker
          majors={sortedMajors}
          majorId={majorId}
          isOther={majorIsOther}
          customValue={majorCustom}
          onSelect={(id, other) => { setMajorId(id); setMajorIsOther(other); if (!other) setMajorCustom(''); }}
          onCustomChange={setMajorCustom}
        />
        <InstitutionInput
          value={institutionName}
          onChange={setInstitutionName}
          fetchSuggestions={getSuggestions}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="startYear" className="text-sm font-medium text-gray-700">Start Year</label>
            <input
              id="startYear"
              type="number"
              value={educationStartYear}
              onChange={(e) => {
                setEducationStartYear(e.target.value !== '' ? Number(e.target.value) : '');
                setErrors((p) => ({ ...p, educationStartYear: '' }));
              }}
              min={1950}
              max={CURRENT_YEAR}
              placeholder={`e.g. ${CURRENT_YEAR - 4}`}
              className={cn(
                'h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20',
                errors.educationStartYear ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-[var(--primary)]',
              )}
            />
            {errors.educationStartYear && (
              <p className="text-xs text-red-500">{errors.educationStartYear}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="endYear" className="text-sm font-medium text-gray-700">End Year</label>
            <input
              id="endYear"
              type="number"
              value={educationEndYear}
              onChange={(e) => {
                setEducationEndYear(e.target.value !== '' ? Number(e.target.value) : '');
                setErrors((p) => ({ ...p, educationEndYear: '' }));
              }}
              min={1950}
              max={CURRENT_YEAR + 10}
              placeholder="Leave blank if ongoing"
              className={cn(
                'h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20',
                errors.educationEndYear ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-[var(--primary)]',
              )}
            />
            {errors.educationEndYear && (
              <p className="text-xs text-red-500">{errors.educationEndYear}</p>
            )}
          </div>
        </div>
      </div>

      {/* CV Upload */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Resume / CV</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload once and reuse when applying. PDF, DOC, DOCX · max 3 MB.
          </p>
        </div>

        {profile?.cvDocumentId && !cvFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <span className="flex-1 text-sm font-medium text-gray-900 truncate">
              {profile.cvOriginalFileName}
            </span>
            <button
              type="button"
              onClick={() => downloadWithAuth('/api/candidate-profile/cv/download', token, profile.cvOriginalFileName ?? 'cv')}
              className="shrink-0 text-gray-400 hover:text-[var(--primary)] transition-colors"
              title="Download CV"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRemoveCv}
              disabled={removingCv || saving}
              className="shrink-0 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Remove CV"
            >
              {removingCv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
              <Upload className="h-4 w-4" />
              {cvFile ? cvFile.name : 'Choose file'}
              <input
                ref={cvInputRef}
                type="file"
                className="sr-only"
                accept={CV_ACCEPT}
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {cvFile && (
              <button
                type="button"
                onClick={() => { setCvFile(null); if (cvInputRef.current) cvInputRef.current.value = ''; }}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {cvFile && (
              <span className="text-xs text-[var(--primary)] font-medium ml-1">Will be uploaded on save</span>
            )}
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          className="bg-[var(--primary)] hover:bg-[#003268] text-white min-w-32"
          onClick={handleSave}
          loading={saving}
        >
          Save Profile
        </Button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
