import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Briefcase, MapPin, Clock, Users, ChevronLeft, ChevronRight, ChevronDown, Check,
  TrendingUp, BookOpen, Heart, Wallet, Sun, Coffee, Laptop, Award, Smile, Star,
  ArrowDown,
} from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { cn } from '../../../lib/utils';
import { useGetPublishedJobsQuery, useGetPublishedCountriesQuery } from '../api/careersApi';
import { useGetJobCategoriesQuery } from '../../jobCategories/api/jobCategoriesApi';
import { useGetEmploymentTypesQuery } from '../../employmentTypes/api/employmentTypesApi';
import { useGetWorkModesQuery } from '../../workModes/api/workModesApi';
import { useGetMyApplicationsQuery } from '../../myApplications/api/myApplicationsApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useBranding } from '../../../contexts/BrandingContext';
import { stats } from '../../../content/companyProfile';
import { AnimatedStat } from '../../../components/AnimatedStat';
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

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Career Growth',
    desc: 'Clear advancement paths with mentorship programs and leadership development opportunities.',
  },
  {
    icon: BookOpen,
    title: 'Learning & Development',
    desc: 'Continuous learning with sponsored courses, certifications, and industry conferences.',
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    desc: 'Comprehensive health coverage for you and your family, plus wellness allowances.',
  },
  {
    icon: Users,
    title: 'Great Culture',
    desc: 'Collaborative, inclusive environment where every voice matters and diversity is celebrated.',
  },
  {
    icon: Wallet,
    title: 'Competitive Package',
    desc: 'Above-market salaries, performance bonuses, and transparent compensation reviews.',
  },
  {
    icon: Sun,
    title: 'Work-Life Balance',
    desc: 'Flexible hours, hybrid work options, and generous paid time off policy.',
  },
];

const CULTURE_TILES = [
  { icon: Coffee,  label: 'Team Hangouts',      bg: 'bg-[var(--primary)]/8'  },
  { icon: Laptop,  label: 'Flexible Work',       bg: 'bg-gray-50'              },
  { icon: Award,   label: 'Recognition Programs', bg: 'bg-[var(--primary)]/5'  },
  { icon: Smile,   label: 'Fun Team Events',      bg: 'bg-gray-50'              },
  { icon: Star,    label: 'Growth Awards',        bg: 'bg-[var(--primary)]/8'  },
  { icon: Briefcase, label: 'Impactful Projects', bg: 'bg-gray-50'             },
];

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroBanner({ totalPositions }: { totalPositions: number }) {
  const { companyName, description } = useBranding();

  const scrollToJobs = () => {
    document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden pt-32 pb-20 text-center"
      style={{
        background:
          'linear-gradient(135deg, var(--primary) 0%, var(--gradient-mid) 55%, var(--gradient-end) 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-56 w-56 rounded-full bg-white/5 blur-2xl" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80">
          <Briefcase className="h-3.5 w-3.5" />
          {totalPositions > 0
            ? `${totalPositions} open position${totalPositions !== 1 ? 's' : ''} available`
            : 'Careers at ' + companyName}
        </span>

        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
          Build Your Career at{' '}
          <span className="text-white/90">{companyName}</span>
        </h1>

        <p className="text-lg text-white/75 leading-relaxed max-w-xl">
          {description}
        </p>

        <button
          onClick={scrollToJobs}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[var(--primary)] shadow-lg hover:bg-gray-50 transition-colors"
        >
          Explore Open Positions
        </button>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToJobs}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors animate-bounce"
        aria-label="Scroll to positions"
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </section>
  );
}

// ─── Why Join Us ─────────────────────────────────────────────────────────────

function WhyJoinSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">
            Why Join Us
          </span>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            More Than Just a Job
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            We invest in our people — because great work starts with a great environment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-[var(--primary)]/20 hover:shadow-md transition-all"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/8 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                <b.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar() {
  return (
    <section
      className="py-14"
      style={{ background: 'var(--primary)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <AnimatedStat value={stat.value} className="text-4xl font-bold text-white" />
              <span className="text-xs font-medium text-white/60 uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Life at Company ─────────────────────────────────────────────────────────

function LifeSection() {
  const { companyName } = useBranding();

  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">
            Our Culture
          </span>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Life at {companyName}
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            A place where talented people do their best work — together.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CULTURE_TILES.map((tile, idx) => (
            <div
              key={tile.label}
              className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl p-8 aspect-[4/3] transition-shadow hover:shadow-md',
                tile.bg,
                idx % 3 === 1 ? 'border border-gray-100' : '',
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-[var(--primary)]">
                <tile.icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-semibold text-gray-700 text-center">{tile.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Filter components (unchanged) ───────────────────────────────────────────

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

// ─── Main Page ────────────────────────────────────────────────────────────────

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

  // Unfiltered count for the hero badge
  const { data: totalData } = useGetPublishedJobsQuery({ page: 1, pageSize: 1 });
  const totalOpenPositions = totalData?.totalCount ?? 0;

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

  const jobs = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex flex-col">
      {/* ── Employer branding sections ── */}
      <HeroBanner totalPositions={totalOpenPositions} />
      <WhyJoinSection />
      <StatsBar />
      <LifeSection />

      {/* ── Job listings ── */}
      <section id="open-positions" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* Section header */}
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-gray-900">Open Positions</h2>
            <p className="text-sm text-gray-500">Explore available opportunities and apply today.</p>
          </div>

          {/* Filters row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
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
              onChange={(v) => { setCountryFilter(v); setPage(1); }}
              placeholder="Country"
            />
            <CategoryFilter
              categories={categories}
              selected={categoryFilter}
              onChange={(ids) => { setCategoryFilter(ids); setPage(1); }}
            />
            <CategoryFilter
              categories={employmentTypes}
              selected={employmentTypeFilter}
              onChange={(ids) => { setEmploymentTypeFilter(ids); setPage(1); }}
              placeholder="Employment Type"
            />
            <CategoryFilter
              categories={workModes}
              selected={workModeFilter}
              onChange={(ids) => { setWorkModeFilter(ids); setPage(1); }}
              placeholder="Work Mode"
            />
            {!isLoading && !isError && (
              <p className="text-xs text-gray-400 sm:ml-auto">
                {totalCount} position{totalCount !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          {/* Results */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <Spinner size="lg" className="text-[var(--primary)]" />
            </div>
          )}
          {isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
              Failed to load positions. Please try again.
            </div>
          )}

          {!isLoading && !isError && (
            jobs.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <p className="text-sm">No positions match your filters.</p>
                </div>
              )
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
      </section>
    </div>
  );
}
