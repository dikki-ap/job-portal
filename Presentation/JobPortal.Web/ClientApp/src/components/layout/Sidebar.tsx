import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Briefcase,
  FileText,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  to?: string;
  icon: React.ReactNode;
  children?: { label: string; to: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  {
    label: 'Master Settings',
    icon: <Settings className="h-5 w-5" />,
    children: [
      { label: 'Department', to: '/master/departments' },
      { label: 'Skill', to: '/master/skills' },
      { label: 'Work Mode', to: '/master/work-modes' },
      { label: 'Employment Type', to: '/master/employment-types' },
      { label: 'Job Category', to: '/master/job-categories' },
      { label: 'Job Level', to: '/master/job-levels' },
    ],
  },
  { label: 'Job Management', to: '/jobs', icon: <Briefcase className="h-5 w-5" /> },
  { label: 'Applications', to: '/applications', icon: <FileText className="h-5 w-5" /> },
];

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
            open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
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
          <span className="text-lg font-bold text-white">JobPortal</span>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <NavGroup key={item.label} item={item} />
          ))}
        </nav>
      </aside>
    </>
  );
}
