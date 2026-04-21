import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import keycloak, { initKeycloak } from '../lib/keycloak'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  token: string | undefined
  userEmail: string | undefined
  userName: string | undefined
  login: () => void
  logout: () => void
  register: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initKeycloak()
      .then((authenticated) => {
        setIsAuthenticated(authenticated)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token: keycloak.token,
        userEmail: keycloak.tokenParsed?.email,
        userName: keycloak.tokenParsed?.name,
        login: () => keycloak.login({ redirectUri: window.location.origin + '/dashboard' }),
        logout: () => keycloak.logout({ redirectUri: window.location.origin }),
        register: () => keycloak.register(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
