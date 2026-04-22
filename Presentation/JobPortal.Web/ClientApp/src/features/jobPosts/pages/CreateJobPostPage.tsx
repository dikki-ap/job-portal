import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from '../../../components/ui/Toast';
import { JobPostForm } from '../components/JobPostForm';
import { useToast } from '../../../hooks/useToast';

export function CreateJobPostPage() {
  const navigate = useNavigate();
  const { toasts, addToast, dismissToast } = useToast();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/jobs')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="h-4 w-px bg-gray-300" />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold text-gray-900">Create Job Post</h1>
          <p className="text-sm text-gray-500">Fill in the details below to create a new job posting.</p>
        </div>
      </div>
      <JobPostForm onSuccess={(msg) => addToast(msg, 'success')} onError={(msg) => addToast(msg, 'error')} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
