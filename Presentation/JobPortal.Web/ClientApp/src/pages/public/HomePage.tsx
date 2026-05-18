import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Cloud,
  Code2,
  BarChart3,
  Shield,
  Cpu,
  RefreshCw,
  MapPin,
  Clock,
  Briefcase,
  ChevronRight,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { company, stats, services, projects, values } from '../../content/companyProfile';
import { AnimatedStat } from '../../components/AnimatedStat';
import { useGetPublishedJobsQuery } from '../../features/careers/api/careersApi';
import { useBranding } from '../../contexts/BrandingContext';
import type { JobPostDto } from '../../types/api';

const iconMap: Record<string, React.ReactNode> = {
  Cloud: <Cloud className="h-6 w-6" />,
  Code2: <Code2 className="h-6 w-6" />,
  BarChart3: <BarChart3 className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
  Cpu: <Cpu className="h-6 w-6" />,
  RefreshCw: <RefreshCw className="h-6 w-6" />,
};

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--gradient-mid) 50%, var(--gradient-end) 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 mb-6">
          IT Services & Consulting
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          {company.tagline}
        </h1>
        <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
          {company.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/careers')}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[var(--primary)] hover:bg-gray-50 transition-colors shadow-lg"
          >
            Explore Careers <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const el = document.querySelector('#services');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Our Services
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <AnimatedStat value={stat.value} className="text-3xl font-bold text-white" />
              <span className="text-xs text-white/60">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <div className="h-8 w-5 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5">
          <div className="h-1.5 w-1 rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">What We Do</span>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Our Services</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            End-to-end technology solutions tailored to your business challenges and growth ambitions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:border-[var(--primary)]/20 hover:shadow-md transition-all"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                {iconMap[service.icon]}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  const categoryColors: Record<string, string> = {
    'Cloud Migration': 'bg-sky-50 text-sky-700',
    'Custom Development': 'bg-violet-50 text-violet-700',
    'Data & Analytics': 'bg-amber-50 text-amber-700',
    'Digital Transformation': 'bg-emerald-50 text-emerald-700',
  };

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">Our Work</span>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Featured Projects</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            A selection of transformative projects we've delivered for clients across industries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
            >
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[project.category] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {project.category}
              </span>
              <h3 className="text-base font-semibold text-gray-900 leading-snug">{project.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { companyName } = useBranding();
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">Who We Are</span>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">About {companyName}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Founded in {company.foundedYear}, {companyName} has grown from a boutique IT consulting firm into
              a trusted technology partner for enterprises across Southeast Asia. We combine deep technical
              expertise with business acumen to deliver solutions that create lasting value.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our multidisciplinary team of engineers, architects, and consultants bring diverse industry
              experience across banking, manufacturing, government, healthcare, and retail.
            </p>
            <div className="flex flex-col gap-4">
              {values.map((value) => (
                <div key={value.title} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{value.title}</p>
                    <p className="text-sm text-gray-500">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-1 ${
                  idx % 2 === 0 ? 'bg-[var(--primary)] text-white' : 'bg-white border border-gray-100 shadow-sm'
                }`}
              >
                <AnimatedStat
                  value={stat.value}
                  className={`text-4xl font-bold ${idx % 2 === 0 ? 'text-white' : 'text-[var(--primary)]'}`}
                />
                <span className={`text-xs font-medium ${idx % 2 === 0 ? 'text-white/70' : 'text-gray-500'}`}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function JobCard({ job, onView }: { job: JobPostDto; onView: () => void }) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-[var(--primary)]/20 hover:shadow-sm transition-all cursor-pointer" onClick={onView}>
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.city}, {job.country}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.employmentTypeName}</span>
          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.workModeName}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[var(--primary)] shrink-0 transition-colors" />
    </div>
  );
}

function CareersSection() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetPublishedJobsQuery({ page: 1, pageSize: 3 });
  const preview = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <section id="careers" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-80 shrink-0 flex flex-col gap-4">
            <span className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">Join the Team</span>
            <h2 className="text-3xl font-bold text-gray-900">Open Positions</h2>
            <p className="text-gray-500 leading-relaxed">
              We're always looking for exceptional talent. Explore our current openings and find your next
              challenge.
            </p>
            <button
              onClick={() => navigate('/careers')}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors w-fit"
            >
              View All Positions <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : preview.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
                <p className="text-sm text-gray-400">No open positions at the moment. Check back soon!</p>
              </div>
            ) : (
              <>
                {preview.map((job) => (
                  <JobCard key={job.id} job={job} onView={() => navigate(`/careers/${job.id}`)} />
                ))}
                {totalCount > 3 && (
                  <button
                    onClick={() => navigate('/careers')}
                    className="text-sm font-medium text-[var(--primary)] hover:underline text-center mt-1"
                  >
                    View {totalCount - 3} more position{totalCount - 3 !== 1 ? 's' : ''} →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const { contactEmail, contactPhone, address } = useBranding();
  return (
    <section id="contact" className="py-20 bg-[var(--primary)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
          Whether you're looking to modernize your systems, build something new, or find the right technology
          partner — we'd love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[var(--primary)] hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-4 w-4" /> {contactEmail}
          </a>
          <a
            href={`tel:${contactPhone}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <Phone className="h-4 w-4" /> {contactPhone}
          </a>
        </div>
        <p className="text-white/60 text-sm">{address}</p>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <ProjectsSection />
      <AboutSection />
      <CareersSection />
      <ContactSection />
    </>
  );
}
