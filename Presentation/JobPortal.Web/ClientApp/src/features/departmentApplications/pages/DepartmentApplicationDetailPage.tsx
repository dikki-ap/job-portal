import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, MapPin, Briefcase, Clock, BarChart2, Users, GraduationCap, Layers, Tag, Building2, Phone, Star } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useAuth } from '../../../contexts/AuthContext';
import { downloadWithAuth } from '../../../lib/download';
import { useFormatter } from '../../../lib/useFormatter';
import { deriveStatus } from '../../../lib/applicationStatus';
import { useGetDepartmentApplicationByIdQuery } from '../api/departmentApplicationsApi';
import { useGetJobPostByIdQuery } from '../../jobPosts/api/jobPostsApi';

const APP_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  InReview: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Accepted: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Rejected: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

const APP_STATUS_LABEL: Record<string, string> = {
  InReview: 'In Review',
};

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
function friendlyFileType(mime: string) {
  return MIME_LABELS[mime] ?? mime.split('/').pop()?.toUpperCase() ?? mime;
}

function ratingColor(r: number) {
  if (r <= 4) return 'bg-red-50 text-red-600 ring-red-200';
  if (r <= 7) return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-green-50 text-green-700 ring-green-200';
}

export function DepartmentApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { formatDate, formatDateTime } = useFormatter();
  const { token } = useAuth();

  const { data: application, isLoading, isError } = useGetDepartmentApplicationByIdQuery(Number(id));
  const { data: jobPost } = useGetJobPostByIdQuery(application?.jobPostId ?? 0, { skip: !application });

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

  return (
    <div className="flex flex-col gap-6">
      <Link to="/department-applications" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Application #{application.code}</h1>
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${APP_STATUS_BADGE[derivedStatus] ?? 'bg-gray-100 text-gray-600'}`}>
            {APP_STATUS_LABEL[derivedStatus] ?? derivedStatus}
          </span>
        </div>
      </div>

      {/* Card: Candidate */}
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

      {/* Card: HR Rating (read-only display) */}
      {application.rating != null && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">HR Rating</h2>
            {application.ratedAt && (
              <span className="text-xs text-gray-400 ml-auto">Last rated: {formatDate(application.ratedAt)}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${ratingColor(application.rating)}`}>
              {application.rating} / 10
            </span>
            {application.ratingNote && (
              <span className="text-sm text-gray-600 italic">"{application.ratingNote}"</span>
            )}
          </div>
        </div>
      )}

      {/* Card: Job Post */}
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

      {/* Card: Hiring Steps (read-only) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-900">Hiring Steps</h2>
        {application.steps.length === 0 ? (
          <p className="text-sm text-gray-400">No steps defined for this job post.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {application.steps.map((step) => (
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card: Documents */}
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
    </div>
  );
}
