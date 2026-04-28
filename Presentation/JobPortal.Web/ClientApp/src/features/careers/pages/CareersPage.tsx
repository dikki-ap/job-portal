import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, MapPin, Clock, Users, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { cn } from '../../../lib/utils';
import { useGetPublishedJobsQuery, useGetPublishedCountriesQuery } from '../api/careersApi';
import { useGetJobCategoriesQuery } from '../../jobCategories/api/jobCategoriesApi';
import { useGetEmploymentTypesQuery } from '../../employmentTypes/api/employmentTypesApi';
import { useGetWorkModesQuery } from '../../workModes/api/workModesApi';
import { useGetMyApplicationsQuery } from '../../myApplications/api/myApplicationsApi';
import { useAuth } from '../../../contexts/AuthContext';
import type { JobPostDto } from '../../../types/api';

const PAGE_SIZE = 9;
const MAX_VISIBLE_CATEGORIES = 5;

const APP_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  InReview: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Accepted: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Rejected: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

const APP_STATUS_LABEL: Record<string, string> = {
  InReview: 'In Review',
};

function CategoryFilter({
  categories,
  selected,
  onChange,
  placeholder = 'All Categories',
}: {
  categories: { id: number; name: string }[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const visible = showAll ? filtered : filtered.slice(0, MAX_VISIBLE_CATEGORIES);

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? categories.find((c) => c.id === selected[0])?.name ?? '1 selected'
        : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'h-10 flex items-center gap-2 rounded-lg border bg-white px-3 text-sm transition-colors',
          open ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20' : 'border-gray-300 hover:bg-gray-50',
          selected.length > 0 ? 'text-[var(--primary)] font-medium' : 'text-gray-700',
        )}
      >
        <span className="max-w-[160px] truncate">{label}</span>
        {selected.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white shrink-0">
            {selected.length}
          </span>
        )}
        <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search categories..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
                className="h-8 w-full rounded-md border border-gray-200 pl-8 pr-3 text-xs focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/20"
              />
            </div>
          </div>

          {/* Clear all */}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full px-3 py-1.5 text-left text-xs font-medium text-[var(--primary)] hover:bg-blue-50 border-b border-gray-100"
            >
              Clear all ({selected.length})
            </button>
          )}

          {/* Items */}
          <div className="py-1">
            {visible.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400 text-center">No categories found.</p>
            ) : (
              visible.map((c) => {
                const checked = selected.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                      checked ? 'bg-blue-50 text-[var(--primary)]' : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    <span className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                      checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-gray-300',
                    )}>
                      {checked && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Show more/less */}
          {filtered.length > MAX_VISIBLE_CATEGORIES && (
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="w-full px-3 py-2 text-left text-xs font-medium text-[var(--primary)] hover:bg-gray-50"
              >
                {showAll ? 'Show less' : `Show ${filtered.length - MAX_VISIBLE_CATEGORIES} more`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StringFilter({
  options,
  selected,
  onChange,
  placeholder = 'All',
}: {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  };

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`;

  if (options.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'h-10 flex items-center gap-2 rounded-lg border bg-white px-3 text-sm transition-colors',
          open ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20' : 'border-gray-300 hover:bg-gray-50',
          selected.length > 0 ? 'text-[var(--primary)] font-medium' : 'text-gray-700',
        )}
      >
        <span className="max-w-[160px] truncate">{label}</span>
        {selected.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white shrink-0">
            {selected.length}
          </span>
        )}
        <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-lg">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full px-3 py-1.5 text-left text-xs font-medium text-[var(--primary)] hover:bg-blue-50 border-b border-gray-100"
            >
              Clear all ({selected.length})
            </button>
          )}
          <div className="py-1">
            {options.map((val) => {
              const checked = selected.includes(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggle(val)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                    checked ? 'bg-blue-50 text-[var(--primary)]' : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  <span className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-gray-300',
                  )}>
                    {checked && <Check className="h-2.5 w-2.5 text-white" />}
                  </span>
                  <span className="truncate">{val}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ job, appliedStatus, onClick }: { job: JobPostDto; appliedStatus?: string; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className="relative flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:border-[var(--primary)]/30 hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
    >
      {appliedStatus && (
        <span className={`absolute top-4 right-4 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${APP_STATUS_BADGE[appliedStatus] ?? 'bg-gray-100 text-gray-600'}`}>
          {APP_STATUS_LABEL[appliedStatus] ?? appliedStatus}
        </span>
      )}

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-gray-900 leading-snug pr-20">{job.title}</h3>
        <p className="text-sm text-gray-500">{job.departmentName}</p>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.city}{job.country ? `, ${job.country}` : ''}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.employmentTypeName}</span>
        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.workModeName}</span>
        {job.quota > 0 && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{job.quota} quota</span>}
      </div>

      {job.isSalaryVisible && (job.minSalary || job.maxSalary) && (
        <p className="text-sm font-medium text-[var(--primary)]">
          {job.currencyTypePrefix} {job.minSalary?.toLocaleString()}{job.maxSalary ? ` – ${job.maxSalary.toLocaleString()}` : '+'}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{job.steps.length} hiring step{job.steps.length !== 1 ? 's' : ''}</span>
        <span className="text-xs font-medium text-[var(--primary)]">View Details →</span>
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
                ? 'bg-[var(--primary)] text-white'
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
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number[]>([]);
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<number[]>([]);
  const [workModeFilter, setWorkModeFilter] = useState<number[]>([]);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetPublishedJobsQuery({
    search: debouncedSearch || undefined,
    categoryIds: categoryFilter.length > 0 ? categoryFilter : undefined,
    employmentTypeIds: employmentTypeFilter.length > 0 ? employmentTypeFilter : undefined,
    workModeIds: workModeFilter.length > 0 ? workModeFilter : undefined,
    countries: countryFilter.length > 0 ? countryFilter : undefined,
    page,
    pageSize: PAGE_SIZE,
  }, { refetchOnMountOrArgChange: true });

  const { data: categories = [] } = useGetJobCategoriesQuery();
  const { data: employmentTypes = [] } = useGetEmploymentTypesQuery();
  const { data: workModes = [] } = useGetWorkModesQuery();
  const { data: availableCountries = [] } = useGetPublishedCountriesQuery();

  const { data: myApplications = [] } = useGetMyApplicationsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const appliedMap = new Map(myApplications.map((a) => [a.jobPostId, a.status]));

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

  const handleCategoryChange = (ids: number[]) => {
    setCategoryFilter(ids);
    setPage(1);
  };

  const handleEmploymentTypeChange = (ids: number[]) => {
    setEmploymentTypeFilter(ids);
    setPage(1);
  };

  const handleWorkModeChange = (ids: number[]) => {
    setWorkModeFilter(ids);
    setPage(1);
  };

  const handleCountryChange = (values: string[]) => {
    setCountryFilter(values);
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
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>
        <StringFilter
          options={availableCountries}
          selected={countryFilter}
          onChange={handleCountryChange}
          placeholder="Country"
        />
        <CategoryFilter
          categories={categories}
          selected={categoryFilter}
          onChange={handleCategoryChange}
        />
        <CategoryFilter
          categories={employmentTypes}
          selected={employmentTypeFilter}
          onChange={handleEmploymentTypeChange}
          placeholder="Employment Type"
        />
        <CategoryFilter
          categories={workModes}
          selected={workModeFilter}
          onChange={handleWorkModeChange}
          placeholder="Work Mode"
        />
        {!isLoading && !isError && (
          <p className="text-xs text-gray-400 sm:ml-auto">
            {totalCount} position{totalCount !== 1 ? 's' : ''} available
          </p>
        )}
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" className="text-[var(--primary)]" /></div>}
      {isError && <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">Failed to load positions. Please try again.</div>}

      {!isLoading && !isError && (
        jobs.length === 0
          ? <div className="flex flex-col items-center justify-center py-16 text-gray-400"><p className="text-sm">No positions found.</p></div>
          : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    appliedStatus={appliedMap.get(job.id)}
                    onClick={() => navigate(`/careers/${job.slug}`)}
                  />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )
      )}
    </div>
  );
}
