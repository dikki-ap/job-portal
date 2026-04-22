import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

function roleLabel(isAdmin: boolean, isHR: boolean): string | null {
  if (isAdmin) return 'Admin';
  if (isHR) return 'HR';
  return null;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { userName, userEmail, logout, isAdmin, isHR } = useAuth();
  const role = roleLabel(isAdmin, isHR);

  return (
    <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-900">{userName || 'User'}</span>
            {role && (
              <span className="rounded-md bg-[#004181] px-1.5 py-0.5 text-xs font-semibold text-white">{role}</span>
            )}
          </div>
          <span className="text-xs text-gray-500">{userEmail}</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004181] text-white shrink-0">
          <User className="h-5 w-5" />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  );
}
