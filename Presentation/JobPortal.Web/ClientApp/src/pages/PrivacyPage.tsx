import { Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useBranding } from '../contexts/BrandingContext';
import { useGetLegalPageQuery } from '../features/legalPages/api/legalPagesApi';
import { Spinner } from '../components/ui/Spinner';

export function PrivacyPage() {
  const { companyName, logoUrl } = useBranding();
  const { data, isLoading } = useGetLegalPageQuery('privacy');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden${!logoUrl ? ' bg-[var(--primary)]' : ''}`}>
            {logoUrl
              ? <img src={logoUrl} alt={companyName} className="h-7 w-7 object-contain" />
              : <Building2 className="h-4 w-4 text-white" />
            }
          </div>
          <span className="text-sm font-bold text-gray-900 flex-1">{companyName}</span>
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500">{companyName}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-[var(--primary)]" />
          </div>
        ) : data?.content ? (
          <div
            className="prose prose-sm prose-gray max-w-none bg-white rounded-xl border border-gray-200 p-6 sm:p-8"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content) }}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            Privacy Policy content has not been configured yet.
          </div>
        )}

        <p className="text-xs text-center text-gray-400">
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
    </div>
  );
}
