import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import keycloak from '../lib/keycloak'

export function LoginPage() {
  const { isAuthenticated, isLoading, isAdmin, isHR } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (from) {
        navigate(from, { replace: true })
      } else if (isAdmin || isHR) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/my-applications', { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, isHR, navigate, from])

  const handleLogin = () => {
    keycloak.login({ redirectUri: window.location.origin + '/login' })
  }

  const handleRegister = () => {
    keycloak.register({ redirectUri: window.location.origin + '/login' })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel - branding */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-12 text-white"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        <div className="max-w-sm text-center">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Job Portal</h1>
            <p className="text-blue-200 text-sm">Internal Recruitment System</p>
          </div>
          <p className="text-blue-100 leading-relaxed">
            Find your next opportunity and build your career with us. Apply for open positions and track your application progress.
          </p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-white">
        {/* Mobile logo */}
        <div className="md:hidden mb-8 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>Job Portal</h1>
          <p className="text-sm text-gray-500">Internal Recruitment System</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
              style={{ backgroundColor: 'var(--primary)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              Sign In
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">or</span>
              </div>
            </div>

            <button
              onClick={handleRegister}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] border-2"
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f5ff' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Create Account
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <span className="underline cursor-pointer" style={{ color: 'var(--primary)' }}>Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer" style={{ color: 'var(--primary)' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
