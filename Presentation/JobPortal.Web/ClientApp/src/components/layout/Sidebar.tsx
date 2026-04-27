import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Settings,
  Briefcase,
  FileText,
  ChevronDown,
  Building2,
  Globe,
  ExternalLink,
  ClipboardList,
  UserCircle,
  ClipboardCheck,
  BarChart2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useIsApproverQuery } from '../../features/approvals/api/approvalsApi';

interface NavItem {
  label: string;
  to?: string;
  icon: React.ReactNode;
  children?: { label: string; to: string }[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

function NavGroup({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(true);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 hover:bg-white/10 transition-colors"
        >
          {item.icon}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 opacity-60 transition-transform duration-200',
              open ? 'rotate-0' : '-rotate-90'
            )}
          />
        </button>
        <div
          className={cn(
            'overflow-hidden transition-all duration-200 ease-in-out',
            open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-white/20 pl-4 pb-1">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-white text-[#004181] font-semibold'
                      : 'text-blue-100 hover:bg-white/10'
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.to!}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-white text-[#004181]'
            : 'text-blue-100 hover:bg-white/10'
        )
      }
    >
      {item.icon}
      {item.label}
    </NavLink>
  );
}

function SectionedNav({ sections }: { sections: NavSection[] }) {
  return (
    <>
      {sections.map((section, si) => (
        <div key={section.label} className={cn('flex flex-col gap-0.5', si > 0 && 'mt-4')}>
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-blue-300/70">
            {section.label}
          </p>
          {section.items.map((item) => (
            <NavGroup key={item.label} item={item} />
          ))}
        </div>
      ))}
    </>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { isAdmin, isCandidate } = useAuth();
  const { data: isApprover } = useIsApproverQuery(undefined, { skip: isCandidate });

  const hrAdminSections: NavSection[] = [
    {
      label: 'Recruitment',
      items: [
        { label: 'Analytics', to: '/analytics', icon: <BarChart2 className="h-5 w-5" /> },
        { label: 'Job Management', to: '/jobs', icon: <Briefcase className="h-5 w-5" /> },
        { label: 'Applications', to: '/applications', icon: <FileText className="h-5 w-5" /> },
        ...(isAdmin || isApprover
          ? [{ label: 'Approvals', to: '/approvals', icon: <ClipboardCheck className="h-5 w-5" /> }]
          : []),
      ],
    },
    ...(isAdmin
      ? [
          {
            label: 'Administration',
            items: [
              {
                label: 'Master Settings',
                icon: <Settings className="h-5 w-5" />,
                children: [
                  { label: 'Currency Type', to: '/master/currency-types' },
                  { label: 'Department', to: '/master/departments' },
                  { label: 'Document Type', to: '/master/document-types' },
                  { label: 'Education Level', to: '/master/education-levels' },
                  { label: 'Education Major', to: '/master/education-majors' },
                  { label: 'Employment Type', to: '/master/employment-types' },
                  { label: 'Approval Levels', to: '/master/approval-levels' },
                  { label: 'Hiring Template', to: '/master/hiring-templates' },
                  { label: 'Job Category', to: '/master/job-categories' },
                  { label: 'Job Level', to: '/master/job-levels' },
                  { label: 'Privacy Consent', to: '/master/privacy-consent' },
                  { label: 'Skill', to: '/master/skills' },
                  { label: 'Work Mode', to: '/master/work-modes' },
                ],
              },
            ],
          },
        ]
      : []),
    {
      label: 'Candidate Portal',
      items: [
        { label: 'Open Positions', to: '/careers', icon: <Globe className="h-5 w-5" /> },
        { label: 'My Applications', to: '/my-applications', icon: <ClipboardList className="h-5 w-5" /> },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'My Profile', to: '/profile', icon: <UserCircle className="h-5 w-5" /> },
      ],
    },
  ];

  const candidateItems: NavItem[] = [
    { label: 'My Profile', to: '/profile', icon: <UserCircle className="h-5 w-5" /> },
    { label: 'My Applications', to: '/my-applications', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Open Positions', to: '/careers', icon: <Briefcase className="h-5 w-5" /> },
  ];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-20 bg-black/50 lg:hidden transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#004181] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/20 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Building2 className="h-5 w-5 text-[#004181]" />
          </div>
          <span className="text-lg font-bold text-white flex-1">JobPortal</span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View Company Site"
            className="text-blue-200 hover:text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <nav className="flex flex-col overflow-y-auto p-4">
          {isCandidate ? (
            <div className="flex flex-col gap-0.5">
              {candidateItems.map((item) => (
                <NavGroup key={item.label} item={item} />
              ))}
            </div>
          ) : (
            <SectionedNav sections={hrAdminSections} />
          )}
        </nav>
      </aside>
    </>
  );
}
