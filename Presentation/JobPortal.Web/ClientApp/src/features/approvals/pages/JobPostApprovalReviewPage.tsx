import { useState } from 'react';
import {
  ArrowLeft, MapPin, Clock, Briefcase, GraduationCap, Tag,
  CheckCircle, XCircle, Users, BarChart2, Layers,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import {
  useGetApprovalJobPostQuery,
  useGetApprovalStatusQuery,
  useApproveJobPostMutation,
  useRejectJobPostMutation,
} from '../api/approvalsApi';
import { useToast } from '../../../hooks/useToast';
import { useFormatter } from '../../../lib/useFormatter';

function buildSalary(prefix: string | null, min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const p = prefix ?? '';
  const minStr = min ? `${p} ${min.toLocaleString()}`.trim() : null;
  const maxStr = max ? `${p} ${max.toLocaleString()}`.trim() : null;
  if (minStr && maxStr) return `${minStr} – ${maxStr}`;
  if (minStr) return `From ${minStr}`;
  return `Up to ${maxStr}`;
}

const STEP_STATUS_BADGE: Record<string, string> = {
  Passed: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
  Pending: 'bg-amber-100 text-amber-700',
};

const STEP_BORDER: Record<string, string> = {
  Passed: 'border-green-200 bg-green-50',
  Failed: 'border-red-200 bg-red-50',
  Pending: 'border-gray-200 bg-white',
};

export function JobPostApprovalReviewPage() {
  const navigate = useNavigate();
  const { formatDateTime } = useFormatter();
  const { id } = useParams<{ id: string }>();
  const jobPostId = Number(id);
  const { toasts, addToast, dismissToast } = useToast();

  const { data: job, isLoading, isError } = useGetApprovalJobPostQuery(jobPostId);
  const { data: approvalStatus } = useGetApprovalStatusQuery(jobPostId);

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [approveComment, setApproveComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [rejectError, setRejectError] = useState('');

  const [approve, { isLoading: isApproving }] = useApproveJobPostMutation();
  const [reject, { isLoading: isRejecting }] = useRejectJobPostMutation();

  const isResolved = approvalStatus?.instanceStatus === 'Completed' || approvalStatus?.instanceStatus === 'Rejected';

  const handleApprove = async () => {
    try {
      await approve({ jobPostId, comment: approveComment || undefined }).unwrap();
      setApproveModal(false);
      setApproveComment('');
      addToast('Job post approved successfully.', 'success');
      setTimeout(() => navigate('/approvals'), 1500);
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to approve.', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) { setRejectError('Comment is required when rejecting.'); return; }
    try {
      await reject({ jobPostId, comment: rejectComment }).unwrap();
      setRejectModal(false);
      setRejectComment('');
      setRejectError('');
      addToast('Job post rejected.', 'success');
      setTimeout(() => navigate('/approvals'), 1500);
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to reject.', 'error');
    }
  };

  const salary = job ? buildSalary(job.currencyTypePrefix, job.minSalary, job.maxSalary) : null;

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6 pb-12">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/approvals')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Approvals
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" className="text-[var(--primary)]" /></div>}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Failed to load job post details.
        </div>
      )}

      {!isLoading && !isError && job && (
        <>
          {/* Header card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-sm text-gray-500">{job.departmentName} · {job.jobCategoryName}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{job.city}, {job.country}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />{job.employmentTypeName}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400" />{job.workModeName}</span>
              <span className="flex items-center gap-1.5"><BarChart2 className="h-4 w-4 text-gray-400" />{job.jobLevelName}</span>
              {job.minEducationLevelName && (
                <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-gray-400" />Min. {job.minEducationLevelName}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gray-400" />
                {job.quota} open position{job.quota !== 1 ? 's' : ''}
              </span>
              {job.minExperienceYears > 0 && (
                <span className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-gray-400" />
                  {job.minExperienceYears}+ years experience
                </span>
              )}
            </div>

            {salary && (
              <p className="text-base font-semibold text-[var(--primary)]">{salary}</p>
            )}
          </div>

          {/* Required skills */}
          {job.requiredSkills.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">Required Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[var(--primary)] ring-1 ring-inset ring-blue-100"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
            <h2 className="text-base font-semibold text-gray-900">Job Description</h2>
            <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: job.description }} />
          </div>

          {/* Hiring process */}
          {job.steps.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">Hiring Process</h2>
              <div className="flex flex-col gap-3">
                {job.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-800 font-medium">{step.name}</span>
                    {!step.isRequired && (
                      <span className="text-xs text-gray-400 rounded bg-gray-100 px-1.5 py-0.5">Optional</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval timeline */}
          {approvalStatus && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">Approval Status</h2>
              <div className="flex flex-col gap-3">
                {approvalStatus.steps.map((step) => (
                  <div key={step.stepOrder} className={`rounded-lg border px-4 py-3 ${STEP_BORDER[step.status] ?? 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">
                        Level {step.stepOrder} — {step.approverName}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STEP_STATUS_BADGE[step.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {step.status}
                      </span>
                    </div>
                    {step.comment && (
                      <p className="text-sm text-gray-600 italic mt-1">"{step.comment}"</p>
                    )}
                    {step.actionAt && (
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(step.actionAt)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons — hidden once resolved */}
          {!isResolved && (
            <div className="flex gap-3 justify-end">
              <Button
                variant="danger"
                onClick={() => { setRejectModal(true); setRejectComment(''); setRejectError(''); }}
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => { setApproveModal(true); setApproveComment(''); }}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Approve
              </Button>
            </div>
          )}
        </>
      )}

      {/* Approve modal */}
      <Modal
        open={approveModal}
        onClose={() => setApproveModal(false)}
        title="Confirm Approval"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setApproveModal(false)} disabled={isApproving}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} loading={isApproving}>
              Confirm Approve
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">
            Comment <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Add a comment..."
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
            disabled={isApproving}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
          />
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Confirm Rejection"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRejectModal(false)} disabled={isRejecting}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={isRejecting}>Confirm Reject</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Provide a reason for rejection..."
            value={rejectComment}
            onChange={(e) => { setRejectComment(e.target.value); setRejectError(''); }}
            disabled={isRejecting}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
          />
          {rejectError && <p className="text-xs text-red-600">{rejectError}</p>}
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
