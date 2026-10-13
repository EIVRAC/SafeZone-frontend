import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '../api/auth'
import { setSession, clearSession, updateCachedUser } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Always require an explicit login when the app loads — no automatic
    // session restore, even if a previous login token is still saved.
    // This guarantees the login page shows first every time, on every
    // page load / dev server restart.
    clearSession()
    setUser(null)
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password, remember = true) => {
    const res = await authApi.login(email, password)
    setSession(res.token, res.user, remember)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    clearSession()
    setUser(null)
  }, [])

  const updateUser = useCallback((patch) => {
    setUser(updateCachedUser(patch))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
