import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import keycloak, { initKeycloak } from '../lib/keycloak'
import type { UserDto } from '../types/api'

const CLIENT_ID = 'job-portal-web'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  currentUser: UserDto | null
  token: string | undefined
  userEmail: string | undefined
  userName: string | undefined
  roles: string[]
  isAdmin: boolean
  isHR: boolean
  isCandidate: boolean
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

function getClientRoles(): string[] {
  return (keycloak.resourceAccess?.[CLIENT_ID]?.roles as string[] | undefined) ?? []
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null)
  const [roles, setRoles] = useState<string[]>([])

  useEffect(() => {
    initKeycloak()
      .then(async (authenticated) => {
        setIsAuthenticated(authenticated)
        if (authenticated) {
          setRoles(getClientRoles())
          const user = await syncCurrentUser()
          setCurrentUser(user)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const isAdmin = roles.includes('Admin')
  const isHR = roles.includes('HR')
  const isCandidate = isAuthenticated && !isAdmin && !isHR

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        currentUser,
        token: keycloak.token,
        userEmail: keycloak.tokenParsed?.email,
        userName: keycloak.tokenParsed?.name,
        roles,
        isAdmin,
        isHR,
        isCandidate,
        login: () => keycloak.login({ redirectUri: window.location.origin + '/login' }),
        logout: () => keycloak.logout({ redirectUri: window.location.origin }),
        register: () => keycloak.register({ redirectUri: window.location.origin + '/login' }),
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
