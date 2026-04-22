import { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { useGetEducationLevelsQuery } from '../../educationLevels/api/educationLevelsApi';
import { useGetSkillsQuery } from '../../skills/api/skillsApi';
import { useGetProfileQuery, useUpsertProfileMutation } from '../api/candidateProfileApi';

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
  const [upsertProfile, { isLoading: saving }] = useUpsertProfileMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [educationLevelId, setEducationLevelId] = useState<number | ''>('');
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [addSkillId, setAddSkillId] = useState<number | ''>('');
  const [addSkillLevel, setAddSkillLevel] = useState('Intermediate');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhoneNumber(profile.phoneNumber);
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
    if (!phoneNumber.trim()) e.phoneNumber = 'Phone number is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await upsertProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        educationLevelId: educationLevelId !== '' ? Number(educationLevelId) : null,
        skills,
      }).unwrap();
      addToast('Profile saved successfully.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to save profile.', 'error');
    }
  };

  const sortedEducationLevels = [...educationLevels].sort((a, b) => a.level - b.level);

  const skillById = (id: number) => allSkills.find((s) => s.id === id);

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
        <Input
          id="phoneNumber"
          label="Phone Number *"
          value={phoneNumber}
          onChange={(e) => { setPhoneNumber(e.target.value); setErrors((p) => ({ ...p, phoneNumber: '' })); }}
          error={errors.phoneNumber}
          placeholder="+62 812 3456 7890"
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
