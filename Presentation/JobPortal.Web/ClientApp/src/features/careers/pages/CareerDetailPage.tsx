import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, BarChart2, GraduationCap, CheckCircle2, Tag, BookOpen } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useGetCareerBySlugQuery } from '../api/careersApi';
import { useGetMyApplicationsQuery } from '../../myApplications/api/myApplicationsApi';
import { useAuth } from '../../../contexts/AuthContext';

const MAX_VISIBLE_SKILLS = 5;
const MAX_VISIBLE_MAJORS = 3;

const APP_STATUS_LABEL: Record<string, string> = {
  Pending: 'Pending',
  InReview: 'In Review',
  Accepted: 'Accepted',
  Rejected: 'Rejected',
};

export function CareerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: job, isLoading, isError } = useGetCareerBySlugQuery(slug!);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllMajors, setShowAllMajors] = useState(false);

  const { data: myApplications = [] } = useGetMyApplicationsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const appliedStatus = job ? myApplications.find((a) => a.jobPostId === job.id)?.status : undefined;

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/careers/${slug}/apply` } });
    } else {
      navigate(`/careers/${slug}/apply`);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center pt-32"><Spinner size="lg" className="text-[#004181]" /></div>;
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col gap-4">
        <Link to="/careers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Careers
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Job post not found or no longer available.
        </div>
      </div>
    );
  }

  const skills = [...(job.requiredSkills ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const visibleSkills = showAllSkills ? skills : skills.slice(0, MAX_VISIBLE_SKILLS);
  const majors = job.preferredMajors ?? [];
  const visibleMajors = showAllMajors ? majors : majors.slice(0, MAX_VISIBLE_MAJORS);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col gap-6">
      <Link to="/careers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Open Positions
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-sm text-gray-500">{job.departmentName} · {job.jobCategoryName}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{job.location}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />{job.employmentTypeName}</span>
          <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400" />{job.workModeName}</span>
          {job.jobLevelName && (
            <span className="flex items-center gap-1.5"><BarChart2 className="h-4 w-4 text-gray-400" />{job.jobLevelName}</span>
          )}
          {job.minEducationLevelName && (
            <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-gray-400" />Min. {job.minEducationLevelName}</span>
          )}
        </div>

        {job.isSalaryVisible && (job.minSalary || job.maxSalary) && (
          <p className="text-base font-semibold text-[#004181]">
            {job.currencyTypePrefix} {job.minSalary?.toLocaleString()}{job.maxSalary ? ` – ${job.maxSalary.toLocaleString()}` : '+'}
          </p>
        )}

        {job.minExperienceYears > 0 && (
          <p className="text-sm text-gray-600">{job.minExperienceYears}+ years of experience required</p>
        )}
      </div>

      {/* Preferred Majors */}
      {majors.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Preferred Education Majors</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleMajors.map((major) => (
              <span
                key={major.id}
                className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-100"
              >
                {major.name}
              </span>
            ))}
          </div>
          {majors.length > MAX_VISIBLE_MAJORS && (
            <button
              onClick={() => setShowAllMajors((v) => !v)}
              className="self-start text-xs font-medium text-purple-700 hover:underline"
            >
              {showAllMajors ? 'Show less' : `Show all ${majors.length} majors`}
            </button>
          )}
        </div>
      )}

      {/* Required Skills */}
      {skills.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Required Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#004181] ring-1 ring-inset ring-blue-100"
              >
                {skill.name}
              </span>
            ))}
          </div>
          {skills.length > MAX_VISIBLE_SKILLS && (
            <button
              onClick={() => setShowAllSkills((v) => !v)}
              className="self-start text-xs font-medium text-[#004181] hover:underline"
            >
              {showAllSkills ? 'Show less' : `Show all ${skills.length} skills`}
            </button>
          )}
        </div>
      )}

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
        <h2 className="text-base font-semibold text-gray-900">Job Description</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: job.description }} />
      </div>

      {/* Hiring Pipeline */}
      {job.steps.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-900">Hiring Process</h2>
          <div className="flex flex-col gap-3">
            {job.steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#004181]/10 text-[#004181] text-xs font-semibold flex items-center justify-center shrink-0">
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

      {/* CTA */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4">
        <div className="flex-1">
          {appliedStatus ? (
            <>
              <p className="text-sm font-medium text-gray-900">You've already applied</p>
              <p className="text-xs text-gray-500">Current status: {APP_STATUS_LABEL[appliedStatus] ?? appliedStatus}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900">Interested in this role?</p>
              <p className="text-xs text-gray-500">
                {isAuthenticated
                  ? 'Submit your application with supporting documents.'
                  : 'Sign in to submit your application.'}
              </p>
            </>
          )}
        </div>
        <Button onClick={handleApply} className="shrink-0" disabled={!!appliedStatus}>
          <CheckCircle2 className="h-4 w-4" />
          {appliedStatus ? 'Applied' : isAuthenticated ? 'Apply Now' : 'Sign In to Apply'}
        </Button>
      </div>
    </div>
  );
}
