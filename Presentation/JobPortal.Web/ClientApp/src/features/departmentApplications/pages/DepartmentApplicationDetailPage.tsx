import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Eye, CheckCircle, XCircle, MapPin, Briefcase,
  Clock, BarChart2, Users, GraduationCap, Layers, Tag, Building2, Phone, Star, FolderOpen, Plus, CalendarClock, Pencil, Trash2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { DocumentPreviewModal } from '../../../components/ui/DocumentPreviewModal';
import { UploadCompanyDocumentModal } from '../../../components/ui/UploadCompanyDocumentModal';
import { UpdateCompanyDocumentModal } from '../../../components/ui/UpdateCompanyDocumentModal';
import { ScheduleInterviewModal } from '../../../components/ui/ScheduleInterviewModal';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../contexts/AuthContext';
import { downloadWithAuth } from '../../../lib/download';
import { useFormatter } from '../../../lib/useFormatter';
import { canActOnStep, deriveStatus } from '../../../lib/applicationStatus';
import { cn } from '../../../lib/utils';
import {
  useGetDepartmentApplicationByIdQuery,
  usePassStepMutation,
  useFailStepMutation,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
  useRateDepartmentApplicationMutation,
  useScheduleStepMutation,
} from '../api/departmentApplicationsApi';
import { useUploadCompanyDocumentMutation, useDeleteCompanyDocumentMutation, useUpdateCompanyDocumentMutation } from '../../applications/api/applicationsApi';
import { useGetJobPostByIdQuery } from '../../jobPosts/api/jobPostsApi';
import type { ApplicationStepDto } from '../../../types/api';

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

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

const APP_STATUS_LABEL: Record<string, string> = { InReview: 'In Review' };

const STEP_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-600',
  Passed: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Failed: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

const MIME_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
};

const MIME_PREVIEW_TYPE: Record<string, true> = {
  'application/pdf': true,
  'image/jpeg': true,
  'image/png': true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
};

function friendlyFileType(mime: string) {
  return MIME_LABELS[mime] ?? mime.split('/').pop()?.toUpperCase() ?? mime;
}

export function DepartmentApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { formatDate, formatDateTime } = useFormatter();
  const { token } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();
  const [previewDoc, setPreviewDoc] = useState<{ id: number; fileType: string; fileName: string } | null>(null);
  const [companyDocModal, setCompanyDocModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<{
    stepId: number; stepName: string;
    existing: { scheduledAt: string | null; scheduledLocation: string | null; scheduledNote: string | null } | null;
  } | null>(null);

  const [localDmRating, setLocalDmRating] = useState<number | null>(null);
  const [localDmNote, setLocalDmNote] = useState('');

  const { data: application, isLoading, isError } = useGetDepartmentApplicationByIdQuery(Number(id));
  const { data: jobPost } = useGetJobPostByIdQuery(application?.jobPostId ?? 0, { skip: !application });

  const appId = application?.id ?? 0;

  const [passStep, { isLoading: passingStep }] = usePassStepMutation();
  const [failStep, { isLoading: failingStep }] = useFailStepMutation();
  const [acceptApplication, { isLoading: accepting }] = useAcceptApplicationMutation();
  const [rejectApplication, { isLoading: rejecting }] = useRejectApplicationMutation();
  const [rateDmApplication, { isLoading: ratingDm }] = useRateDepartmentApplicationMutation();
  const [uploadCompanyDocument, { isLoading: uploadingCompanyDoc }] = useUploadCompanyDocumentMutation();
  const [deleteCompanyDocument] = useDeleteCompanyDocumentMutation();
  const [updateCompanyDocument, { isLoading: updatingCompanyDoc }] = useUpdateCompanyDocumentMutation();
  const [scheduleStep, { isLoading: scheduling }] = useScheduleStepMutation();
  const [updateDocTarget, setUpdateDocTarget] = useState<{ id: number; name: string; originalFileName: string } | null>(null);
  const [deleteDocConfirm, setDeleteDocConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (application) {
      setLocalDmRating(application.dmRating);
      setLocalDmNote(application.dmRatingNote ?? '');
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

  const handleAccept = async () => {
    try {
      await acceptApplication(appId).unwrap();
      addToast('Candidate accepted.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to accept candidate.', 'error');
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

  const handleUploadCompanyDoc = async (name: string, file: File) => {
    if (!application) return;
    try {
      await uploadCompanyDocument({ code: application.code, name, file, applicationId: application.id }).unwrap();
      setCompanyDocModal(false);
      addToast('Document uploaded successfully.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to upload document.', 'error');
    }
  };

  const handleDeleteCompanyDoc = async (docId: number) => {
    if (!application) return;
    try {
      await deleteCompanyDocument({ code: application.code, documentId: docId, applicationId: application.id }).unwrap();
      setDeleteDocConfirm(null);
      addToast('Document deleted.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      setDeleteDocConfirm(null);
      addToast(data?.error ?? 'Failed to delete document.', 'error');
    }
  };

  const handleUpdateCompanyDoc = async (name: string, file: File | null) => {
    if (!updateDocTarget || !application) return;
    try {
      await updateCompanyDocument({ code: application.code, documentId: updateDocTarget.id, name, file, applicationId: application.id }).unwrap();
      setUpdateDocTarget(null);
      addToast('Document updated successfully.', 'success');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to update document.', 'error');
    }
  };

  const handleScheduleStep = async (data: { scheduledAt: string | null; scheduledLocation: string | null; scheduledNote: string | null }) => {
    if (!scheduleModal) return;
    try {
      await scheduleStep({ applicationId: appId, stepId: scheduleModal.stepId, ...data }).unwrap();
      setScheduleModal(null);
      addToast('Schedule saved.', 'success');
    } catch (err: unknown) {
      const d = (err as { data?: { error?: string } })?.data;
      addToast(d?.error ?? 'Failed to save schedule.', 'error');
    }
  };

  const handleDmRate = async () => {
    if (!localDmRating) return;
    try {
      await rateDmApplication({
        applicationId: appId,
        rating: localDmRating,
        note: localDmNote || undefined,
      }).unwrap();
      addToast('DM rating saved.', 'success');
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
        <Link to="/department-applications" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Application not found or you do not have access to it.
        </div>
      </div>
    );
  }

  const derivedStatus = deriveStatus(application);
  const isFinalized = derivedStatus === 'Accepted' || derivedStatus === 'Rejected';
  const canReject = !isFinalized;
  const canAccept = derivedStatus === 'InReview';

  return (
    <div className="flex flex-col gap-6">
      <Link to="/department-applications" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Application #{application.code}</h1>
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${APP_STATUS_BADGE[derivedStatus] ?? 'bg-gray-100 text-gray-600'}`}>
            {APP_STATUS_LABEL[derivedStatus] ?? derivedStatus}
          </span>
        </div>
      </div>

      {/* Card: Candidate */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Candidate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
          <div><span className="text-gray-500 font-medium block">Name</span><span className="text-gray-900">{application.candidateName || '—'}</span></div>
          <div><span className="text-gray-500 font-medium block">Email</span><span className="text-gray-900 break-all">{application.candidateEmail}</span></div>
          <div>
            <span className="text-gray-500 font-medium block">Phone</span>
            <span className="flex items-center gap-1.5 text-gray-900">
              {application.candidatePhone
                ? <><Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />{application.candidatePhone}</>
                : <span className="text-gray-400">—</span>}
            </span>
          </div>
          <div><span className="text-gray-500 font-medium block">Applied</span><span className="text-gray-900">{formatDate(application.appliedAt)}</span></div>
          {application.source && (
            <div><span className="text-gray-500 font-medium block">Source</span><span className="text-gray-900">{application.source}</span></div>
          )}
          {application.candidateDateOfBirth && (
            <div>
              <span className="text-gray-500 font-medium block">Age</span>
              <span className="text-gray-900">{calculateAge(application.candidateDateOfBirth)} years old</span>
            </div>
          )}
        </div>
        {(application.candidateEducationLevelName || application.candidateEducationMajorName || application.candidateInstitutionName) && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-start gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-x-1 gap-y-1 text-gray-700">
                {application.candidateEducationLevelName && <span>{application.candidateEducationLevelName}</span>}
                {application.candidateEducationMajorName && <span className="text-gray-500">· {application.candidateEducationMajorName}</span>}
                {application.candidateInstitutionName && <span className="text-gray-500">· {application.candidateInstitutionName}</span>}
                {application.candidateEducationStartYear && (
                  <span className="text-gray-500">
                    · {application.candidateEducationStartYear}
                    {application.candidateEducationEndYear ? ` – ${application.candidateEducationEndYear}` : ' – present'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card: HR Rating (read-only) */}
      {application.rating != null && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Star className="h-4 w-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">HR Rating</h2>
            {application.ratedAt && (
              <span className="text-xs text-gray-400 ml-auto">Rated: {formatDate(application.ratedAt)}</span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${ratingColor(application.rating)}`}>
              {application.rating} / 10
            </span>
            {application.ratingNote && (
              <span className="text-sm text-gray-600 italic">"{application.ratingNote}"</span>
            )}
          </div>
        </div>
      )}

      {/* Card: DM Rating (interactive) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Star className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="text-base font-semibold text-gray-900">My Rating</h2>
          {application.dmRatedAt && (
            <span className="text-xs text-gray-400 ml-auto">Last rated: {formatDate(application.dmRatedAt)}</span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLocalDmRating(n)}
                className={cn(
                  'h-9 w-9 rounded-lg border text-sm font-semibold transition-all',
                  localDmRating === n
                    ? cn('ring-2 ring-offset-1', ratingColor(n))
                    : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                )}
              >
                {n}
              </button>
            ))}
            {localDmRating && (
              <span className={cn('ml-2 inline-flex items-center self-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', ratingColor(localDmRating))}>
                {localDmRating}/10
              </span>
            )}
          </div>
          <textarea
            value={localDmNote}
            onChange={(e) => setLocalDmNote(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Optional note about this candidate from your department's perspective..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleDmRate}
              loading={ratingDm}
              disabled={!localDmRating}
            >
              {application.dmRating ? 'Update My Rating' : 'Save My Rating'}
            </Button>
          </div>
        </div>
      </div>

      {/* Card: Job Post */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
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
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />{jobPost.city}, {jobPost.country}</span>
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

      {/* Card: Hiring Steps (interactive) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Hiring Steps</h2>
        {application.steps.length === 0 ? (
          <p className="text-sm text-gray-400">No steps defined for this job post.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {application.steps.map((step) => {
              const canAct = step.status === 'Pending' && !isFinalized && canActOnStep(step, application.steps);
              return (
                <div key={step.id} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center shrink-0 self-start sm:self-center">
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
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(step.completedAt)}
                        {step.completedByName && <span className="ml-1">· by {step.completedByName}</span>}
                      </p>
                    )}
                    {step.scheduledAt && (
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-blue-600">
                        <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{formatDateTime(step.scheduledAt)}</span>
                        {step.scheduledLocation && <span className="text-blue-500">· {step.scheduledLocation}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {step.status === 'Pending' && !isFinalized && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-blue-600 hover:bg-blue-50"
                        onClick={() => setScheduleModal({ stepId: step.id, stepName: step.stepName, existing: { scheduledAt: step.scheduledAt, scheduledLocation: step.scheduledLocation, scheduledNote: step.scheduledNote } })}
                        disabled={scheduling}
                      >
                        <CalendarClock className="h-3.5 w-3.5" /> {step.scheduledAt ? 'Edit Schedule' : 'Schedule'}
                      </Button>
                    )}
                    {step.status === 'Pending' && !isFinalized && (
                      canAct ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                            onClick={() => handlePassStep(step)}
                            loading={passingStep}
                            disabled={failingStep}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Pass
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="gap-1.5"
                            onClick={() => handleFailStep(step)}
                            loading={failingStep}
                            disabled={passingStep}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Fail
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic self-center">Waiting previous step</span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card: Candidate Documents */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Candidate Documents</h2>
        {application.documents.filter(d => !d.isCompanyDocument).length === 0 ? (
          <p className="text-sm text-gray-400">No documents submitted.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[480px] px-4 sm:px-0">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4 pl-4 sm:pl-0">Document</th>
                  <th className="pb-2 pr-4 hidden sm:table-cell">Uploaded At</th>
                  <th className="pb-2 text-right pr-4 sm:pr-0">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {application.documents.filter(d => !d.isCompanyDocument).map((doc) => (
                  <tr key={doc.id}>
                    <td className="py-2 pr-4 pl-4 sm:pl-0 font-medium text-gray-900">
                      {doc.documentType}{' '}
                      <span className="font-normal text-gray-400">[{friendlyFileType(doc.fileType)}]</span>
                      {doc.originalFileName && (
                        <span className="font-normal text-gray-500 hidden sm:inline"> — {doc.originalFileName}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-gray-500 hidden sm:table-cell">{formatDate(doc.createdAt)}</td>
                    <td className="py-2 text-right pr-4 sm:pr-0">
                      <div className="flex items-center justify-end gap-1">
                        {MIME_PREVIEW_TYPE[doc.fileType] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-[var(--primary)] hover:bg-blue-50"
                            onClick={() => setPreviewDoc({ id: doc.id, fileType: doc.fileType, fileName: doc.originalFileName ?? doc.documentType })}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => downloadWithAuth(`/api/documents/${doc.id}/download`, token, doc.originalFileName)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card: Additional Documents From Company */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-base font-semibold text-gray-900">Additional Documents From Company</h2>
          </div>
          <Button
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => setCompanyDocModal(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Add Document
          </Button>
        </div>
        {application.documents.filter(d => d.isCompanyDocument).length === 0 ? (
          <p className="text-sm text-gray-400">No additional documents uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm min-w-[480px] px-4 sm:px-0">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4 pl-4 sm:pl-0">Document</th>
                  <th className="pb-2 pr-4 hidden sm:table-cell">Uploaded At</th>
                  <th className="pb-2 text-right pr-4 sm:pr-0">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {application.documents.filter(d => d.isCompanyDocument).map((doc) => (
                  <tr key={doc.id}>
                    <td className="py-2 pr-4 pl-4 sm:pl-0 font-medium text-gray-900">
                      {doc.documentType}{' '}
                      <span className="font-normal text-gray-400">[{friendlyFileType(doc.fileType)}]</span>
                      {doc.originalFileName && (
                        <span className="font-normal text-gray-500 hidden sm:inline"> — {doc.originalFileName}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-gray-500 hidden sm:table-cell">{formatDate(doc.createdAt)}</td>
                    <td className="py-2 text-right pr-4 sm:pr-0">
                      <div className="flex items-center justify-end gap-1">
                        {MIME_PREVIEW_TYPE[doc.fileType] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-[var(--primary)] hover:bg-blue-50"
                            onClick={() => setPreviewDoc({ id: doc.id, fileType: doc.fileType, fileName: doc.originalFileName ?? doc.documentType })}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => downloadWithAuth(`/api/documents/${doc.id}/download`, token, doc.originalFileName)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => setUpdateDocTarget({ id: doc.id, name: doc.documentType, originalFileName: doc.originalFileName })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Update</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleteDocConfirm(doc.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {(canAccept || canReject) && (
        <div className="flex flex-wrap justify-end gap-3 rounded-xl border border-gray-200 bg-white px-4 sm:px-6 py-4">
          {canAccept && (
            <Button
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAccept}
              loading={accepting}
              disabled={rejecting}
            >
              Accept Candidate
            </Button>
          )}
          {canReject && (
            <Button
              variant="danger"
              className="flex-1 sm:flex-none"
              onClick={handleReject}
              loading={rejecting}
              disabled={accepting}
            >
              Reject Candidate
            </Button>
          )}
        </div>
      )}

      {deleteDocConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Delete Document</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteDocConfirm(null)}>Cancel</Button>
              <Button variant="danger" size="sm" className="gap-1.5" onClick={() => handleDeleteCompanyDoc(deleteDocConfirm)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <DocumentPreviewModal
        open={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        documentId={previewDoc?.id ?? 0}
        fileType={previewDoc?.fileType ?? ''}
        fileName={previewDoc?.fileName ?? ''}
        token={token}
      />

      <UploadCompanyDocumentModal
        open={companyDocModal}
        onClose={() => setCompanyDocModal(false)}
        onUpload={handleUploadCompanyDoc}
        isUploading={uploadingCompanyDoc}
      />

      <UpdateCompanyDocumentModal
        open={updateDocTarget !== null}
        onClose={() => setUpdateDocTarget(null)}
        currentName={updateDocTarget?.name ?? ''}
        currentFileName={updateDocTarget?.originalFileName ?? ''}
        onUpdate={handleUpdateCompanyDoc}
        isUpdating={updatingCompanyDoc}
      />

      <ScheduleInterviewModal
        open={scheduleModal !== null}
        onClose={() => setScheduleModal(null)}
        stepName={scheduleModal?.stepName ?? ''}
        existing={scheduleModal?.existing ?? null}
        onSave={handleScheduleStep}
        isSaving={scheduling}
      />
    </div>
  );
}
