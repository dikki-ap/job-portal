import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle2, X, Loader2, Building2, LogIn, UserCircle } from 'lucide-react';
import { myApplicationsApi } from '../../myApplications/api/myApplicationsApi';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../contexts/AuthContext';
import keycloak from '../../../lib/keycloak';
import { useGetCareerBySlugQuery, useApplyToJobMutation } from '../api/careersApi';
import { useUploadDocumentMutation } from '../../documents/api/documentsApi';
import { useGetDocumentTypesQuery } from '../../documentTypes/api/documentTypesApi';
import { useGetProfileQuery } from '../../candidateProfile/api/candidateProfileApi';
import {
  useGetPrivacyConsentSettingQuery,
  useGetMyConsentStatusQuery,
} from '../../privacyConsent/api/privacyConsentApi';
import type { DocumentTypeDto } from '../../../types/api';

interface DocEntry {
  typeId: number;
  typeName: string;
  allowedMimes: string[];
  maxFileSizeMb: number;
  isRequired: boolean;
  file: File | null;
  uploadedId: number | null;
  fromProfile: boolean;
  uploading: boolean;
  error: string | null;
}

function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#004181]">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Job Application</span>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}

function LoginWall({ jobTitle }: { jobTitle?: string }) {
  return (
    <ApplyLayout>
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          <LogIn className="h-8 w-8 text-[#004181]" />
        </div>
        <div className="flex flex-col gap-2 max-w-sm">
          <h2 className="text-xl font-bold text-gray-900">Sign in to Apply</h2>
          <p className="text-sm text-gray-500">
            {jobTitle
              ? `You need to be signed in to apply for "${jobTitle}".`
              : 'You need to be signed in to submit your application.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => keycloak.login({ redirectUri: window.location.href })}
            className="inline-flex items-center gap-2 rounded-xl bg-[#004181] px-6 py-3 text-sm font-semibold text-white hover:bg-[#003166] transition-colors"
          >
            <LogIn className="h-4 w-4" /> Sign In to Continue
          </button>
          <button
            onClick={() => keycloak.register({ redirectUri: window.location.href })}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    </ApplyLayout>
  );
}

function DocUploadRow({ entry, dt, locked, onToggleOff, onSetFile, onSwitchToUpload }: {
  entry: DocEntry;
  dt: DocumentTypeDto;
  locked: boolean;
  onToggleOff: () => void;
  onSetFile: (file: File | null) => void;
  onSwitchToUpload: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {locked ? (
          <span className="h-4 w-4 flex items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-[#004181]" />
          </span>
        ) : (
          <button type="button" onClick={onToggleOff} className="text-gray-400 hover:text-red-500 shrink-0">
            <X className="h-4 w-4" />
          </button>
        )}
        <span className="text-sm font-medium text-gray-900">{dt.name}</span>
        {entry.isRequired && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">Required</span>
        )}
        <span className="text-xs text-gray-400 ml-auto">max {dt.maxFileSizeMb} MB</span>
      </div>

      <div className="ml-7">
        {entry.uploadedId && !entry.file ? (
          <div className="flex items-center gap-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {entry.fromProfile ? (
              <>
                <span className="flex items-center gap-1.5">
                  <UserCircle className="h-3.5 w-3.5" />
                  From your profile
                </span>
                <button
                  type="button"
                  onClick={onSwitchToUpload}
                  className="text-xs text-blue-600 hover:underline ml-1"
                >
                  Use different file
                </button>
              </>
            ) : (
              <span>{entry.file?.name} — uploaded</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:border-[#004181] hover:text-[#004181] transition-colors">
              <Upload className="h-4 w-4" />
              {entry.file ? entry.file.name : 'Choose file'}
              <input
                type="file"
                className="sr-only"
                accept={dt.allowedMimeTypes.join(',')}
                onChange={(e) => onSetFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {entry.file && (
              <button type="button" onClick={() => onSetFile(null)} className="text-gray-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
            {entry.uploading && <Loader2 className="h-4 w-4 animate-spin text-[#004181]" />}
          </div>
        )}
        {entry.error && <p className="text-xs text-red-600 mt-1">{entry.error}</p>}
      </div>
    </div>
  );
}

export function ApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toasts, addToast, dismissToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: job, isLoading: jobLoading } = useGetCareerBySlugQuery(slug!);
  const { data: allDocTypes = [], isLoading: typesLoading } = useGetDocumentTypesQuery();
  const { data: profile } = useGetProfileQuery(undefined, { skip: !isAuthenticated });
  const { data: consentSetting } = useGetPrivacyConsentSettingQuery();
  const { data: consentStatus, isLoading: consentLoading } = useGetMyConsentStatusQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [applyToJob, { isLoading: applying }] = useApplyToJobMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  const [entries, setEntries] = useState<Record<number, DocEntry>>({});
  const [submitted, setSubmitted] = useState(false);

  // Initialize entries from job's requiredDocuments when both are loaded
  // Auto-populate with profile CV if documentTypeId matches
  useEffect(() => {
    if (!job || allDocTypes.length === 0) return;

    const initialEntries: Record<number, DocEntry> = {};
    for (const reqDoc of job.requiredDocuments) {
      const dt = allDocTypes.find((d) => d.id === reqDoc.documentTypeId);
      if (!dt) continue;
      const isProfileCv = profile?.cvDocumentId != null && dt.isDefaultRequired;
      initialEntries[dt.id] = {
        typeId: dt.id,
        typeName: dt.name,
        allowedMimes: dt.allowedMimeTypes,
        maxFileSizeMb: dt.maxFileSizeMb,
        isRequired: reqDoc.isRequired,
        file: null,
        uploadedId: isProfileCv ? profile!.cvDocumentId : null,
        fromProfile: isProfileCv,
        uploading: false,
        error: null,
      };
    }
    setEntries(initialEntries);
  }, [job, allDocTypes, profile]);

  const addAdditionalDoc = (dt: DocumentTypeDto) => {
    setEntries((prev) => ({
      ...prev,
      [dt.id]: {
        typeId: dt.id,
        typeName: dt.name,
        allowedMimes: dt.allowedMimeTypes,
        maxFileSizeMb: dt.maxFileSizeMb,
        isRequired: false,
        file: null,
        uploadedId: null,
        fromProfile: false,
        uploading: false,
        error: null,
      },
    }));
  };

  const removeOptionalDoc = (typeId: number) => {
    setEntries((prev) => {
      const next = { ...prev };
      delete next[typeId];
      return next;
    });
  };

  const setFile = (typeId: number, file: File | null) => {
    setEntries((e) => ({ ...e, [typeId]: { ...e[typeId], file, uploadedId: null, fromProfile: false, error: null } }));
  };

  const switchToUpload = (typeId: number) => {
    setEntries((e) => ({ ...e, [typeId]: { ...e[typeId], uploadedId: null, fromProfile: false, file: null } }));
  };

  const handleSubmit = async () => {
    const entryList = Object.values(entries);

    // Validate required docs all have files or existing uploadedId
    const missingRequired = entryList.filter((e) => e.isRequired && !e.file && !e.uploadedId);
    if (missingRequired.length > 0) {
      addToast(`Please attach: ${missingRequired.map((e) => e.typeName).join(', ')}`, 'error');
      return;
    }

    const hasAnyDoc = entryList.some((e) => e.file || e.uploadedId);
    if (!hasAnyDoc) {
      addToast('Please attach at least one file.', 'error');
      return;
    }

    // Collect already-uploaded documents (e.g. profile CV)
    const documents: { documentId: number; documentTypeName: string }[] = entryList
      .filter((e) => e.uploadedId && !e.file)
      .map((e) => ({ documentId: e.uploadedId!, documentTypeName: e.typeName }));

    // Upload new files
    const withFiles = entryList.filter((e) => e.file);
    for (const entry of withFiles) {
      setEntries((e) => ({ ...e, [entry.typeId]: { ...e[entry.typeId], uploading: true, error: null } }));
      try {
        const result = await uploadDocument({ file: entry.file!, documentTypeId: entry.typeId }).unwrap();
        documents.push({ documentId: result.id, documentTypeName: entry.typeName });
        setEntries((e) => ({ ...e, [entry.typeId]: { ...e[entry.typeId], uploading: false, uploadedId: result.id } }));
      } catch (err: unknown) {
        const msg = (err as { data?: { error?: string } })?.data?.error ?? 'Failed to upload file.';
        setEntries((e) => ({ ...e, [entry.typeId]: { ...e[entry.typeId], uploading: false, error: msg } }));
        addToast(`Upload failed: ${msg}`, 'error');
        return;
      }
    }

    try {
      await applyToJob({ jobPostId: job!.id, documents }).unwrap();
      dispatch(myApplicationsApi.util.invalidateTags(['MyApplication']));
      setSubmitted(true);
      addToast('Application submitted successfully!', 'success');
      setTimeout(() => navigate('/my-applications'), 1200);
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error ?? 'Failed to submit application.';
      addToast(msg, 'error');
    }
  };

  const isUploading = Object.values(entries).some((e) => e.uploading);

  if (authLoading) {
    return (
      <ApplyLayout>
        <div className="flex justify-center py-24">
          <Spinner size="lg" className="text-[#004181]" />
        </div>
      </ApplyLayout>
    );
  }

  if (!isAuthenticated) {
    return <LoginWall jobTitle={job?.title} />;
  }

  if (isAuthenticated && !consentLoading && consentSetting?.requireConsent && !consentStatus?.hasConsented) {
    return <Navigate to={`/privacy-policy?redirect=/careers/${slug}/apply`} replace />;
  }

  if (jobLoading || typesLoading) {
    return (
      <ApplyLayout>
        <div className="flex justify-center py-24">
          <Spinner size="lg" className="text-[#004181]" />
        </div>
      </ApplyLayout>
    );
  }

  if (!job) {
    return (
      <ApplyLayout>
        <div className="flex flex-col gap-4">
          <Link to="/careers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Careers
          </Link>
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            Job post not found.
          </div>
        </div>
      </ApplyLayout>
    );
  }

  // Doc types not yet in entries (for "additional docs" section)
  const additionalDocTypes = allDocTypes.filter((dt) => !entries[dt.id]);
  const entryList = Object.values(entries);
  const configuredEntries = entryList.filter((e) => e.isRequired !== false || job.requiredDocuments.some((r) => r.documentTypeId === e.typeId));
  const additionalEntries = entryList.filter((e) => !job.requiredDocuments.some((r) => r.documentTypeId === e.typeId));
  const hasRequired = job.requiredDocuments.some((r) => r.isRequired);

  return (
    <ApplyLayout>
      <div className="flex flex-col gap-6">
        <Link to={`/careers/${slug}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to {job.title}
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Apply — {job.title}</h1>
          <p className="text-sm text-gray-500">{job.departmentName} · {job.location}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Supporting Documents</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {hasRequired
                ? 'Required documents are marked. Attach each file before submitting.'
                : 'Attach any supporting documents for your application.'}
            </p>
          </div>

          {/* Configured doc types from job post */}
          {configuredEntries.length === 0 && additionalEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No documents required for this position. You may add optional documents below.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {configuredEntries.map((entry) => {
                const dt = allDocTypes.find((d) => d.id === entry.typeId);
                if (!dt) return null;
                return (
                  <div key={entry.typeId} className="py-3 first:pt-0 last:pb-0">
                    <DocUploadRow
                      entry={entry}
                      dt={dt}
                      locked={entry.isRequired}
                      onToggleOff={() => removeOptionalDoc(entry.typeId)}
                      onSetFile={(file) => setFile(entry.typeId, file)}
                      onSwitchToUpload={() => switchToUpload(entry.typeId)}
                    />
                  </div>
                );
              })}
              {additionalEntries.map((entry) => {
                const dt = allDocTypes.find((d) => d.id === entry.typeId);
                if (!dt) return null;
                return (
                  <div key={entry.typeId} className="py-3 first:pt-0 last:pb-0">
                    <DocUploadRow
                      entry={entry}
                      dt={dt}
                      locked={false}
                      onToggleOff={() => removeOptionalDoc(entry.typeId)}
                      onSetFile={(file) => setFile(entry.typeId, file)}
                      onSwitchToUpload={() => switchToUpload(entry.typeId)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Additional optional documents */}
          {additionalDocTypes.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Add more documents (optional)</p>
              <div className="flex flex-wrap gap-2">
                {additionalDocTypes.map((dt) => (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => addAdditionalDoc(dt)}
                    className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[#004181] hover:text-[#004181] transition-colors"
                  >
                    + {dt.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(`/careers/${slug}`)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={isUploading || applying}
            disabled={submitted}
          >
            <CheckCircle2 className="h-4 w-4" />
            Submit Application
          </Button>
        </div>

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ApplyLayout>
  );
}
