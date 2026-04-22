import { useState, useEffect, useRef } from 'react';
import { Upload, CheckCircle2, Trash2, Loader2, X, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../contexts/AuthContext';
import { downloadWithAuth } from '../../../lib/download';
import { useGetEducationLevelsQuery } from '../../educationLevels/api/educationLevelsApi';
import {
  useGetProfileQuery,
  useUpsertProfileMutation,
  useUploadCvMutation,
  useRemoveCvMutation,
} from '../api/candidateProfileApi';

const CV_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function CandidateProfilePage() {
  const { token } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: educationLevels = [] } = useGetEducationLevelsQuery();
  const [upsertProfile] = useUpsertProfileMutation();
  const [uploadCv] = useUploadCvMutation();
  const [removeCv, { isLoading: removingCv }] = useRemoveCvMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [educationLevelId, setEducationLevelId] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhoneNumber(profile.phoneNumber || '');
    setEducationLevelId(profile.educationLevelId ?? '');
  }, [profile]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    if (!lastName.trim()) e.lastName = 'Last name is required.';
    if (!phoneNumber || phoneNumber.length < 6) e.phoneNumber = 'Valid phone number is required.';
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

  const sortedEducationLevels = [...educationLevels].sort((a, b) => a.level - b.level);

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
              className="shrink-0 text-gray-400 hover:text-[#004181] transition-colors"
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
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:border-[#004181] hover:text-[#004181] transition-colors">
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
              <span className="text-xs text-[#004181] font-medium ml-1">Will be uploaded on save</span>
            )}
          </div>
        )}
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
