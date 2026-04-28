import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { JobPostForm } from '../components/JobPostForm';
import { useGetJobPostByIdQuery } from '../api/jobPostsApi';
import { useToast } from '../../../hooks/useToast';

export function EditJobPostPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toasts, addToast, dismissToast } = useToast();
  const { data: jobPost, isLoading, isError } = useGetJobPostByIdQuery(Number(id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/jobs')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="h-4 w-px bg-gray-300" />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold text-gray-900">Edit Job Post</h1>
          <p className="text-sm text-gray-500">Update the details for this job posting.</p>
        </div>
      </div>
      {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" className="text-[var(--primary)]" /></div>}
      {isError && <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">Failed to load job post. Please try again.</div>}
      {!isLoading && !isError && jobPost && (
        <JobPostForm editing={jobPost} onSuccess={(msg) => addToast(msg, 'success')} onError={(msg) => addToast(msg, 'error')} />
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
