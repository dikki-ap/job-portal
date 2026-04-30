import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { navLinks } from '../../content/companyProfile';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { companyName, logoUrl } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const solid = !isHome || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      if (!isHome) {
        navigate('/');
        setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          solid
            ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors overflow-hidden',
                  !logoUrl && (solid ? 'bg-[var(--primary)]' : 'bg-white/20 backdrop-blur-sm')
                )}
              >
                {logoUrl
                  ? <img src={logoUrl} alt={companyName} className="h-8 w-8 object-contain" />
                  : <Building2 className="h-4 w-4 text-white" />
                }
              </div>
              <span
                className={cn(
                  'text-base font-bold transition-colors',
                  solid ? 'text-gray-900' : 'text-white'
                )}
              >
                {companyName}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    solid
                      ? 'text-gray-600 hover:text-[var(--primary)] hover:bg-blue-50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                    solid
                      ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                      : 'bg-white text-[var(--primary)] hover:bg-white/90'
                  )}
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      solid
                        ? 'text-gray-600 hover:text-[var(--primary)]'
                        : 'text-white/80 hover:text-white'
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/careers')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                      solid
                        ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                        : 'bg-white text-[var(--primary)] hover:bg-white/90'
                    )}
                  >
                    View Positions
                  </button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors',
                solid ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              )}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          'fixed inset-x-0 top-16 z-40 bg-white shadow-lg border-b border-gray-100 lg:hidden transition-all duration-200',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[var(--primary)] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 flex gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}
                className="flex-1 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/login'); }}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/careers'); }}
                  className="flex-1 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold"
                >
                  View Positions
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
