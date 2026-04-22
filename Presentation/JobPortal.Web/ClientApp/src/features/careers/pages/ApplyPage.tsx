import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle2, X, Loader2, Building2, LogIn } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../contexts/AuthContext';
import keycloak from '../../../lib/keycloak';
import { useGetCareerByIdQuery, useApplyToJobMutation } from '../api/careersApi';
import { useUploadDocumentMutation } from '../../documents/api/documentsApi';
import { useGetDocumentTypesQuery } from '../../documentTypes/api/documentTypesApi';
import type { DocumentTypeDto } from '../../../types/api';

interface DocEntry {
  typeId: number;
  typeName: string;
  allowedMimes: string[];
  file: File | null;
  uploadedId: number | null;
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

export function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const jobPostId = Number(id);
  const navigate = useNavigate();
  const { toasts, addToast, dismissToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: job, isLoading: jobLoading } = useGetCareerByIdQuery(jobPostId);
  const { data: docTypes = [], isLoading: typesLoading } = useGetDocumentTypesQuery();
  const [applyToJob, { isLoading: applying }] = useApplyToJobMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [entries, setEntries] = useState<Record<number, DocEntry>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleType = (dt: DocumentTypeDto) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(dt.id)) {
        next.delete(dt.id);
        setEntries((e) => { const n = { ...e }; delete n[dt.id]; return n; });
      } else {
        next.add(dt.id);
        setEntries((e) => ({
          ...e,
          [dt.id]: { typeId: dt.id, typeName: dt.name, allowedMimes: dt.allowedMimeTypes, file: null, uploadedId: null, uploading: false, error: null },
        }));
      }
      return next;
    });
  };

  const setFile = (typeId: number, file: File | null) => {
    setEntries((e) => ({ ...e, [typeId]: { ...e[typeId], file, uploadedId: null, error: null } }));
  };

  const handleSubmit = async () => {
    const entryList = Object.values(entries);
    if (entryList.length === 0) {
      addToast('Please select at least one document type.', 'error');
      return;
    }
    const withFiles = entryList.filter((e) => e.file);
    if (withFiles.length === 0) {
      addToast('Please attach at least one file.', 'error');
      return;
    }

    const documentIds: number[] = [];
    for (const entry of withFiles) {
      setEntries((e) => ({ ...e, [entry.typeId]: { ...e[entry.typeId], uploading: true, error: null } }));
      try {
        const result = await uploadDocument({ file: entry.file!, documentTypeId: entry.typeId }).unwrap();
        documentIds.push(result.id);
        setEntries((e) => ({ ...e, [entry.typeId]: { ...e[entry.typeId], uploading: false, uploadedId: result.id } }));
      } catch (err: unknown) {
        const msg = (err as { data?: { error?: string } })?.data?.error ?? 'Failed to upload file.';
        setEntries((e) => ({ ...e, [entry.typeId]: { ...e[entry.typeId], uploading: false, error: msg } }));
        addToast(`Upload failed: ${msg}`, 'error');
        return;
      }
    }

    try {
      await applyToJob({ jobPostId, documentIds }).unwrap();
      setSubmitted(true);
      addToast('Application submitted successfully!', 'success');
      setTimeout(() => navigate('/my-applications'), 1500);
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

  return (
    <ApplyLayout>
      <div className="flex flex-col gap-6">
        <Link to={`/careers/${jobPostId}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to {job.title}
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Apply — {job.title}</h1>
          <p className="text-sm text-gray-500">{job.departmentName} · {job.location}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Supporting Documents</h2>
            <p className="text-sm text-gray-500 mt-0.5">Select the document types you want to include, then attach each file.</p>
          </div>

          {docTypes.length === 0 ? (
            <p className="text-sm text-gray-400">No document types configured.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {docTypes.map((dt) => {
                const isChecked = selected.has(dt.id);
                const entry = entries[dt.id];
                return (
                  <div key={dt.id} className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleType(dt)}
                        className="h-4 w-4 rounded border-gray-300 text-[#004181] focus:ring-[#004181]"
                      />
                      <span className="text-sm font-medium text-gray-900">{dt.name}</span>
                      <span className="text-xs text-gray-400">max {dt.maxFileSizeMb} MB</span>
                    </label>

                    {isChecked && (
                      <div className="ml-7">
                        {entry.uploadedId ? (
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{entry.file?.name} — uploaded</span>
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
                                onChange={(e) => setFile(dt.id, e.target.files?.[0] ?? null)}
                              />
                            </label>
                            {entry.file && (
                              <button type="button" onClick={() => setFile(dt.id, null)} className="text-gray-400 hover:text-red-500">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                            {entry.uploading && <Loader2 className="h-4 w-4 animate-spin text-[#004181]" />}
                          </div>
                        )}
                        {entry.error && <p className="text-xs text-red-600 mt-1">{entry.error}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(`/careers/${jobPostId}`)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={isUploading || applying}
            disabled={submitted || selected.size === 0}
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
