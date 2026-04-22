import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../contexts/AuthContext';
import { downloadWithAuth } from '../../../lib/download';
import { formatDate, formatDateTime } from '../../../lib/format';
import { canActOnStep, deriveStatus } from '../../../lib/applicationStatus';
import {
  useGetApplicationByIdQuery,
  usePassStepMutation,
  useFailStepMutation,
  useRejectApplicationMutation,
} from '../api/applicationsApi';
import type { ApplicationStepDto } from '../../../types/api';

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

const APP_STATUS_LABEL: Record<string, string> = { InReview: 'In Review' };

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
  const { id } = useParams<{ id: string }>();
  const appId = Number(id);
  const { token } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();

  const { data: application, isLoading, isError } = useGetApplicationByIdQuery(appId);
  const [passStep, { isLoading: passingId }] = usePassStepMutation();
  const [failStep, { isLoading: failingId }] = useFailStepMutation();
  const [rejectApplication, { isLoading: rejecting }] = useRejectApplicationMutation();

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
          <h1 className="text-2xl font-bold text-gray-900">Application #{application.id}</h1>
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${APP_STATUS_BADGE[application.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {APP_STATUS_LABEL[application.status] ?? application.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Candidate */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-900">Candidate</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500 font-medium">Name</dt>
            <dd className="text-gray-900">{application.candidateName || '—'}</dd>
            <dt className="text-gray-500 font-medium">Email</dt>
            <dd className="text-gray-900">{application.candidateEmail}</dd>
            <dt className="text-gray-500 font-medium">Applied</dt>
            <dd className="text-gray-900">{formatDate(application.appliedAt)}</dd>
          </dl>
        </div>

        {/* Card 2: Job Post */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-900">Job Post</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500 font-medium">Title</dt>
            <dd className="text-gray-900">{application.jobPostTitle}</dd>
            <dt className="text-gray-500 font-medium">Last Updated</dt>
            <dd className="text-gray-900">{formatDateTime(application.updatedAt)}</dd>
          </dl>
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
