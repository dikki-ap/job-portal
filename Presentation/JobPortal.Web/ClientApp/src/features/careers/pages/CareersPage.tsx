import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, MapPin, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { useGetPublishedJobsQuery } from '../api/careersApi';
import { useGetJobCategoriesQuery } from '../../jobCategories/api/jobCategoriesApi';
import type { JobPostDto } from '../../../types/api';

const PAGE_SIZE = 9;

function JobCard({ job, onView }: { job: JobPostDto; onView: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:border-[#004181]/30 hover:shadow-sm transition-all">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-gray-900 leading-snug">{job.title}</h3>
        <p className="text-sm text-gray-500">{job.departmentName}</p>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.employmentTypeName}</span>
        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.workModeName}</span>
        {job.quota > 0 && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{job.quota} quota</span>}
      </div>

      {job.isSalaryVisible && (job.minSalary || job.maxSalary) && (
        <p className="text-sm font-medium text-[#004181]">
          {job.currencyTypePrefix} {job.minSalary?.toLocaleString()}{job.maxSalary ? ` – ${job.maxSalary.toLocaleString()}` : '+'}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{job.steps.length} hiring step{job.steps.length !== 1 ? 's' : ''}</span>
        <Button size="sm" onClick={onView}>View Details</Button>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`h-9 min-w-[36px] px-3 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-[#004181] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CareersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetPublishedJobsQuery({
    search: debouncedSearch || undefined,
    categoryId: categoryFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: categories = [] } = useGetJobCategoriesQuery();

  const debounceRef = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (val: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setDebouncedSearch(val);
          setPage(1);
        }, 400);
      };
    })(),
    []
  );

  const handleSearch = (val: string) => {
    setSearch(val);
    debounceRef(val);
  };

  const handleCategory = (val: number | undefined) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const jobs = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Open Positions</h1>
        <p className="text-sm text-gray-500">Explore available opportunities and apply today.</p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search positions..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20"
          />
        </div>
        <div className="relative sm:w-48">
          <select
            value={categoryFilter ?? ''}
            onChange={(e) => handleCategory(e.target.value ? Number(e.target.value) : undefined)}
            className="h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-9 text-sm text-gray-700 focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {!isLoading && !isError && (
          <p className="text-xs text-gray-400 sm:ml-auto">
            {totalCount} position{totalCount !== 1 ? 's' : ''} available
          </p>
        )}
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" className="text-[#004181]" /></div>}
      {isError && <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">Failed to load positions. Please try again.</div>}

      {!isLoading && !isError && (
        jobs.length === 0
          ? <div className="flex flex-col items-center justify-center py-16 text-gray-400"><p className="text-sm">No positions found.</p></div>
          : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onView={() => navigate(`/careers/${job.id}`)} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )
      )}
    </div>
  );
}
