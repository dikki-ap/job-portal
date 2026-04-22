import { useState, useEffect, useRef } from 'react';
import { X, PlusCircle, Upload, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { useToast } from '../../../hooks/useToast';
import { useGetEducationLevelsQuery } from '../../educationLevels/api/educationLevelsApi';
import { useGetSkillsQuery } from '../../skills/api/skillsApi';
import { useGetDocumentTypesQuery } from '../../documentTypes/api/documentTypesApi';
import {
  useGetProfileQuery,
  useUpsertProfileMutation,
  useUploadCvMutation,
  useRemoveCvMutation,
} from '../api/candidateProfileApi';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

interface SkillEntry {
  skillId: number;
  skillLevel: string;
}

export function CandidateProfilePage() {
  const { toasts, addToast, dismissToast } = useToast();
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: educationLevels = [] } = useGetEducationLevelsQuery();
  const { data: allSkills = [] } = useGetSkillsQuery();
  const { data: documentTypes = [] } = useGetDocumentTypesQuery();
  const [upsertProfile, { isLoading: saving }] = useUpsertProfileMutation();
  const [uploadCv, { isLoading: uploadingCv }] = useUploadCvMutation();
  const [removeCv, { isLoading: removingCv }] = useRemoveCvMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+62');
  const [educationLevelId, setEducationLevelId] = useState<number | ''>('');
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [addSkillId, setAddSkillId] = useState<number | ''>('');
  const [addSkillLevel, setAddSkillLevel] = useState('Intermediate');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvDocTypeId, setCvDocTypeId] = useState<number | ''>('');
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhoneNumber(profile.phoneNumber || '+62');
    setEducationLevelId(profile.educationLevelId ?? '');
    setSkills(profile.skills.map((s) => ({ skillId: s.skillId, skillLevel: s.skillLevel })));
  }, [profile]);

  const availableSkills = allSkills.filter((s) => !skills.some((e) => e.skillId === s.id));

  const addSkill = () => {
    if (!addSkillId) return;
    setSkills((prev) => [...prev, { skillId: Number(addSkillId), skillLevel: addSkillLevel }]);
    setAddSkillId('');
    setAddSkillLevel('Intermediate');
  };

  const removeSkill = (skillId: number) =>
    setSkills((prev) => prev.filter((s) => s.skillId !== skillId));

  const updateSkillLevel = (skillId: number, level: string) =>
    setSkills((prev) => prev.map((s) => (s.skillId === skillId ? { ...s, skillLevel: level } : s)));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    if (!lastName.trim()) e.lastName = 'Last name is required.';
    if (!phoneNumber || phoneNumber === '+' || phoneNumber.length < 6)
      e.phoneNumber = 'Valid phone number is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await upsertProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber,
        educationLevelId: educationLevelId !== '' ? Number(educationLevelId) : null,
        skills,
      }).unwrap();
      addToast('Profile saved successfully.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to save profile.', 'error');
    }
  };

  const handleCvUpload = async () => {
    if (!cvFile || cvDocTypeId === '') return;
    try {
      await uploadCv({ file: cvFile, documentTypeId: Number(cvDocTypeId) }).unwrap();
      setCvFile(null);
      setCvDocTypeId('');
      if (cvInputRef.current) cvInputRef.current.value = '';
      addToast('CV uploaded successfully.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to upload CV.', 'error');
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

  const sortedEducationLevels = [...educationLevels].sort((a, b) => a.level - b.level);
  const skillById = (id: number) => allSkills.find((s) => s.id === id);

  const cvDocType = documentTypes.find((d) => d.id === profile?.cvDocumentTypeId);
  const cvAllowedMimes = cvDocTypeId !== ''
    ? (documentTypes.find((d) => d.id === Number(cvDocTypeId))?.allowedMimeTypes ?? [])
    : [];
  const cvMaxMb = cvDocTypeId !== ''
    ? (documentTypes.find((d) => d.id === Number(cvDocTypeId))?.maxFileSizeMb ?? 10)
    : 10;

  if (profileLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-[#004181]" />
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
      </div>

      {/* CV Upload */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Resume / CV</h2>
          <p className="text-sm text-gray-500 mt-0.5">Upload once and reuse across applications.</p>
        </div>

        {profile?.cvDocumentId ? (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile.cvOriginalFileName}</p>
              {cvDocType && <p className="text-xs text-gray-500">{cvDocType.name}</p>}
            </div>
            <button
              type="button"
              onClick={handleRemoveCv}
              disabled={removingCv}
              className="shrink-0 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Remove CV"
            >
              {removingCv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Select
              id="cvDocType"
              label="Document Type"
              value={cvDocTypeId}
              onChange={(e) => {
                setCvDocTypeId(e.target.value !== '' ? Number(e.target.value) : '');
                setCvFile(null);
                if (cvInputRef.current) cvInputRef.current.value = '';
              }}
              options={documentTypes.map((d) => ({ value: d.id, label: d.name }))}
              placeholder="— Select document type —"
            />
            <div className="flex items-center gap-3">
              <label className={`flex items-center gap-2 cursor-pointer rounded-lg border border-dashed px-4 py-2.5 text-sm transition-colors ${
                cvDocTypeId === ''
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:border-[#004181] hover:text-[#004181]'
              }`}>
                <Upload className="h-4 w-4" />
                {cvFile ? cvFile.name : 'Choose file'}
                <input
                  ref={cvInputRef}
                  type="file"
                  className="sr-only"
                  disabled={cvDocTypeId === ''}
                  accept={cvAllowedMimes.join(',') || undefined}
                  onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {cvFile && (
                <button type="button" onClick={() => { setCvFile(null); if (cvInputRef.current) cvInputRef.current.value = ''; }} className="text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              )}
              <Button
                size="sm"
                className="bg-[#004181] hover:bg-[#003268] text-white ml-auto"
                onClick={handleCvUpload}
                disabled={!cvFile || cvDocTypeId === ''}
                loading={uploadingCv}
              >
                Upload
              </Button>
            </div>
            {cvDocTypeId !== '' && (
              <p className="text-xs text-gray-400">Max {cvMaxMb} MB · {cvAllowedMimes.join(', ') || 'any file'}</p>
            )}
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Skills</h2>

        {skills.length > 0 && (
          <div className="flex flex-col divide-y divide-gray-100">
            {skills.map((entry) => {
              const skill = skillById(entry.skillId);
              return (
                <div key={entry.skillId} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <span className="flex-1 text-sm font-medium text-gray-900">{skill?.name ?? `Skill #${entry.skillId}`}</span>
                  <select
                    value={entry.skillLevel}
                    onChange={(e) => updateSkillLevel(entry.skillId, e.target.value)}
                    className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20"
                  >
                    {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button
                    onClick={() => removeSkill(entry.skillId)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove skill"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Select
              id="addSkill"
              label="Add Skill"
              value={addSkillId}
              onChange={(e) => setAddSkillId(e.target.value !== '' ? Number(e.target.value) : '')}
              options={availableSkills.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="— Select skill —"
            />
          </div>
          <select
            value={addSkillLevel}
            onChange={(e) => setAddSkillLevel(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20"
          >
            {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0 h-10"
            onClick={addSkill}
            disabled={!addSkillId}
          >
            <PlusCircle className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          className="bg-[#004181] hover:bg-[#003268] text-white min-w-32"
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
