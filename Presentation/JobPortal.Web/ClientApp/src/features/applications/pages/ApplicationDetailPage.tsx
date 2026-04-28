import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, XCircle, MapPin, Briefcase, Clock, BarChart2, Users, GraduationCap, Layers, Tag, Building2, Phone, Star } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../contexts/AuthContext';
import { downloadWithAuth } from '../../../lib/download';
import { formatDate, formatDateTime } from '../../../lib/format';
import { canActOnStep, deriveStatus } from '../../../lib/applicationStatus';
import { cn } from '../../../lib/utils';
import {
  useGetApplicationByCodeQuery,
  usePassStepMutation,
  useFailStepMutation,
  useRejectApplicationMutation,
  useRateApplicationMutation,
} from '../api/applicationsApi';
import { useGetJobPostByIdQuery } from '../../jobPosts/api/jobPostsApi';
import type { ApplicationStepDto } from '../../../types/api';

function ratingColor(r: number) {
  if (r <= 4) return 'bg-red-50 text-red-600 ring-red-200 border-red-200';
  if (r <= 7) return 'bg-amber-50 text-amber-700 ring-amber-200 border-amber-200';
  return 'bg-green-50 text-green-700 ring-green-200 border-green-200';
}

const APP_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  InReview: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Accepted: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Rejected: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

const STEP_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-600',
  Passed: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Failed: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

const APP_STATUS_LABEL: Record<string, string> = {
  InReview: 'In Review',
};

const MIME_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
};
function friendlyFileType(mime: string) {
  return MIME_LABELS[mime] ?? mime.split('/').pop()?.toUpperCase() ?? mime;
}

export function ApplicationDetailPage() {
  const { code } = useParams<{ code: string }>();
  const { token } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();

  const { data: application, isLoading, isError } = useGetApplicationByCodeQuery(code!);
  const appId = application?.id ?? 0;
  const { data: jobPost } = useGetJobPostByIdQuery(application?.jobPostId ?? 0, { skip: !application });

  const [passStep, { isLoading: passingId }] = usePassStepMutation();
  const [failStep, { isLoading: failingId }] = useFailStepMutation();
  const [rejectApplication, { isLoading: rejecting }] = useRejectApplicationMutation();
  const [rateApplication, { isLoading: rating }] = useRateApplicationMutation();

  const [localRating, setLocalRating] = useState<number | null>(null);
  const [localNote, setLocalNote] = useState('');

  useEffect(() => {
    if (application) {
      setLocalRating(application.rating);
      setLocalNote(application.ratingNote ?? '');
    }
  }, [application]);

  const handlePassStep = async (step: ApplicationStepDto) => {
    try {
      await passStep({ applicationId: appId, stepId: step.id }).unwrap();
      addToast(`Step "${step.stepName}" marked as Passed.`, 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to update step.', 'error');
    }
  };

  const handleFailStep = async (step: ApplicationStepDto) => {
    try {
      await failStep({ applicationId: appId, stepId: step.id }).unwrap();
      addToast(`Step "${step.stepName}" marked as Failed.`, 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to update step.', 'error');
    }
  };

  const handleReject = async () => {
    try {
      await rejectApplication(appId).unwrap();
      addToast('Candidate rejected.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to reject candidate.', 'error');
    }
  };

  const handleRate = async () => {
    if (!localRating) return;
    try {
      await rateApplication({ applicationId: appId, rating: localRating, note: localNote || undefined }).unwrap();
      addToast('Rating saved.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to save rating.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-[var(--primary)]" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/applications" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Application not found or failed to load.
        </div>
      </div>
    );
  }

  const derivedStatus = deriveStatus(application);
  const isFinalized = derivedStatus === 'Accepted' || derivedStatus === 'Rejected';
  const canReject = !isFinalized;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/applications" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Application #{application.code}</h1>
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${APP_STATUS_BADGE[derivedStatus] ?? 'bg-gray-100 text-gray-600'}`}>
            {APP_STATUS_LABEL[derivedStatus] ?? derivedStatus}
          </span>
        </div>
      </div>

      {/* Card 1: Candidate */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Candidate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
          <div><span className="text-gray-500 font-medium block">Name</span><span className="text-gray-900">{application.candidateName || '—'}</span></div>
          <div><span className="text-gray-500 font-medium block">Email</span><span className="text-gray-900">{application.candidateEmail}</span></div>
          <div>
            <span className="text-gray-500 font-medium block">Phone</span>
            <span className="flex items-center gap-1.5 text-gray-900">
              {application.candidatePhone
                ? <><Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />{application.candidatePhone}</>
                : <span className="text-gray-400">—</span>}
            </span>
          </div>
          <div><span className="text-gray-500 font-medium block">Applied</span><span className="text-gray-900">{formatDate(application.appliedAt)}</span></div>
        </div>
      </div>

      {/* Card 2: HR Rating */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">HR Rating</h2>
          {application.ratedAt && (
            <span className="text-xs text-gray-400 ml-auto">Last rated: {formatDate(application.ratedAt)}</span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLocalRating(n)}
                className={cn(
                  'h-9 w-9 rounded-lg border text-sm font-semibold transition-all',
                  localRating === n
                    ? cn('ring-2 ring-offset-1', ratingColor(n))
                    : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                )}
              >
                {n}
              </button>
            ))}
            {localRating && (
              <span className={cn('ml-2 inline-flex items-center self-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', ratingColor(localRating))}>
                {localRating}/10
              </span>
            )}
          </div>
          <textarea
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Optional note about this candidate..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleRate}
              loading={rating}
              disabled={!localRating}
            >
              {application.rating ? 'Update Rating' : 'Save Rating'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Card 3: Job Post */}

        {/* Card 3: Job Post */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{application.jobPostTitle}</h2>
              {jobPost && <p className="text-sm text-gray-500 mt-0.5">{jobPost.departmentName} · {jobPost.jobCategoryName}</p>}
            </div>
            {jobPost && (
              <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 shrink-0">
                {jobPost.status}
              </span>
            )}
          </div>

          {jobPost && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />{jobPost.location}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />{jobPost.employmentTypeName}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />{jobPost.workModeName}</span>
                <span className="flex items-center gap-1.5"><BarChart2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />{jobPost.jobLevelName}</span>
                <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />{jobPost.departmentName}</span>
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />{jobPost.quota} open position{jobPost.quota !== 1 ? 's' : ''}</span>
                {jobPost.minEducationLevelName && (
                  <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-gray-400 shrink-0" />Min. {jobPost.minEducationLevelName}</span>
                )}
                {jobPost.minExperienceYears > 0 && (
                  <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-gray-400 shrink-0" />{jobPost.minExperienceYears}+ yrs experience</span>
                )}
              </div>

              {jobPost.isSalaryVisible && (jobPost.minSalary || jobPost.maxSalary) && (
                <p className="text-sm font-semibold text-[var(--primary)]">
                  {jobPost.currencyTypePrefix} {jobPost.minSalary?.toLocaleString()}
                  {jobPost.maxSalary ? ` – ${jobPost.currencyTypePrefix} ${jobPost.maxSalary.toLocaleString()}` : '+'}
                </p>
              )}

              {jobPost.preferredMajors.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400"><GraduationCap className="h-3 w-3" /> Preferred Majors</span>
                  <div className="flex flex-wrap gap-1.5">
                    {jobPost.preferredMajors.map((m) => (
                      <span key={m.id} className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-100">{m.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {jobPost.requiredSkills.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400"><Tag className="h-3 w-3" /> Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {jobPost.requiredSkills.map((s) => (
                      <span key={s.id} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[var(--primary)] ring-1 ring-inset ring-blue-100">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Card 3: Hiring Steps */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Hiring Steps</h2>
        {application.steps.length === 0 ? (
          <p className="text-sm text-gray-400">No steps defined for this job post.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {application.steps.map((step) => {
              const canAct = step.status === 'Pending' && !isFinalized && canActOnStep(step, application.steps);
              return (
                <div key={step.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center shrink-0">
                    {step.stepOrder}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{step.stepName}</span>
                      {step.isRequired && (
                        <span className="text-xs rounded bg-gray-100 px-1.5 py-0.5 text-gray-500 font-medium">Required</span>
                      )}
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STEP_STATUS_BADGE[step.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {step.status}
                      </span>
                    </div>
                    {step.completedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(step.completedAt)}</p>
                    )}
                  </div>
                  {step.status === 'Pending' && !isFinalized && (
                    canAct ? (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                          onClick={() => handlePassStep(step)}
                          loading={passingId}
                          disabled={failingId}
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Pass
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          className="gap-1.5"
                          onClick={() => handleFailStep(step)}
                          loading={failingId}
                          disabled={passingId}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Fail
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic shrink-0">Waiting previous step</span>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card 4: Documents */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Documents</h2>
        {application.documents.length === 0 ? (
          <p className="text-sm text-gray-400">No documents submitted.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">Document</th>
                  <th className="pb-2 pr-4">Uploaded At</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {application.documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {doc.documentType}{' '}
                      <span className="font-normal text-gray-400">[{friendlyFileType(doc.fileType)}]</span>
                      {doc.originalFileName && (
                        <span className="font-normal text-gray-500"> — {doc.originalFileName}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-gray-500">{formatDate(doc.createdAt)}</td>
                    <td className="py-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => downloadWithAuth(`/api/documents/${doc.id}/download`, token, doc.originalFileName)}
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {canReject && (
        <div className="flex justify-end gap-3 rounded-xl border border-gray-200 bg-white px-6 py-4">
          <Button variant="danger" onClick={handleReject} loading={rejecting}>
            Reject Candidate
          </Button>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
