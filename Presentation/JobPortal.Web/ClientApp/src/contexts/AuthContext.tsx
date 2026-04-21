import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import keycloak, { initKeycloak } from '../lib/keycloak'
import type { UserDto } from '../types/api'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  currentUser: UserDto | null
  token: string | undefined
  userEmail: string | undefined
  userName: string | undefined
  login: () => void
  logout: () => void
  register: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function syncCurrentUser(): Promise<UserDto | null> {
  try {
    const res = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    })
    if (!res.ok) return null
    return (await res.json()) as UserDto
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null)

  useEffect(() => {
    initKeycloak()
      .then(async (authenticated) => {
        setIsAuthenticated(authenticated)
        if (authenticated) {
          const user = await syncCurrentUser()
          setCurrentUser(user)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        currentUser,
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
