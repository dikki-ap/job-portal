import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Download, MapPin, Briefcase, Building2, ExternalLink, BarChart2 } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { useGetMyApplicationByCodeQuery } from '../api/myApplicationsApi';
import { useAuth } from '../../../contexts/AuthContext';
import { downloadWithAuth } from '../../../lib/download';
import { formatDate, formatDateTime } from '../../../lib/format';

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  InReview: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Accepted: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Rejected: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};
const STATUS_LABEL: Record<string, string> = { InReview: 'In Review' };

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

function StepIcon({ status }: { status: string }) {
  if (status === 'Passed')
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === 'Failed')
    return <XCircle className="h-5 w-5 text-red-500" />;
  return <Clock className="h-5 w-5 text-gray-300" />;
}

export function MyApplicationDetailPage() {
  const { code } = useParams<{ code: string }>();
  const { token } = useAuth();
  const { data: application, isLoading, isError } = useGetMyApplicationByCodeQuery(code!);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-[#004181]" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/my-applications" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to My Applications
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Application not found.
        </div>
      </div>
    );
  }

  const passedCount = application.steps.filter((s) => s.status === 'Passed').length;
  const totalSteps = application.steps.length;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link to="/my-applications" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to My Applications
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-gray-900">{application.jobPostTitle}</h1>
            <p className="text-sm text-gray-500">#{application.code}</p>
          </div>
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${STATUS_BADGE[application.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABEL[application.status] ?? application.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />Applied {formatDate(application.appliedAt)}</span>
          <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400" />Last updated {formatDateTime(application.updatedAt)}</span>
        </div>
      </div>

      {/* Job Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900">Job Details</h2>
          {application.jobPostSlug && (
            <Link
              to={`/careers/${application.jobPostSlug}`}
              className="inline-flex items-center gap-1 text-xs text-[#004181] hover:underline font-medium"
            >
              View listing <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          {application.jobPostDepartmentName && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{application.jobPostDepartmentName}</span>
            </div>
          )}
          {(application.jobPostCity || application.jobPostCountry) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{application.jobPostCity}{application.jobPostCity && application.jobPostCountry ? `, ${application.jobPostCountry}` : application.jobPostCountry}</span>
            </div>
          )}
          {application.jobPostEmploymentTypeName && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{application.jobPostEmploymentTypeName}</span>
            </div>
          )}
          {application.jobPostWorkModeName && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{application.jobPostWorkModeName}</span>
            </div>
          )}
          {application.jobPostJobLevelName && (
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{application.jobPostJobLevelName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hiring Progress */}
      {application.steps.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Hiring Progress</h2>
            <span className="text-sm text-gray-400">{passedCount} / {totalSteps} completed</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#004181] transition-all duration-500"
              style={{ width: totalSteps > 0 ? `${(passedCount / totalSteps) * 100}%` : '0%' }}
            />
          </div>

          {/* Steps timeline */}
          <div className="flex flex-col gap-0">
            {application.steps.map((step, idx) => {
              const isLast = idx === application.steps.length - 1;
              return (
                <div key={step.id} className="flex gap-4">
                  {/* Timeline line + icon */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-100 bg-white shrink-0">
                      <StepIcon status={step.status} />
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                  </div>

                  {/* Step content */}
                  <div className={`flex flex-col gap-0.5 pb-4 ${isLast ? '' : ''}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{step.stepName}</span>
                      {!step.isRequired && (
                        <span className="text-xs rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">Optional</span>
                      )}
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        step.status === 'Passed' ? 'bg-green-50 text-green-700' :
                        step.status === 'Failed' ? 'bg-red-50 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {step.status}
                      </span>
                    </div>
                    {step.completedAt && (
                      <p className="text-xs text-gray-400">{formatDateTime(step.completedAt)}</p>
                    )}
                    {step.status === 'Pending' && (
                      <p className="text-xs text-gray-400 italic">Awaiting review</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final status message */}
          {application.status === 'Accepted' && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">
              Congratulations! Your application has been accepted.
            </div>
          )}
          {application.status === 'Rejected' && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              Your application was not selected at this time. Thank you for applying.
            </div>
          )}
        </div>
      )}

      {/* Submitted Documents */}
      {application.documents.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-900">Submitted Documents</h2>
          <div className="flex flex-col divide-y divide-gray-100">
            {application.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-900">
                    {doc.documentType}{' '}
                    <span className="font-normal text-gray-400">[{friendlyFileType(doc.fileType)}]</span>
                    {doc.originalFileName && <span className="font-normal text-gray-500"> — {doc.originalFileName}</span>}
                  </span>
                  <span className="text-xs text-gray-400">Uploaded {formatDate(doc.createdAt)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shrink-0"
                  onClick={() => downloadWithAuth(`/api/documents/${doc.id}/download`, token, doc.originalFileName)}
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
