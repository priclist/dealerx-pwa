import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { authApi } from '../lib/authApi'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refreshToken, setSession, setAccessToken, setRestoring, clearSession, user: persistedUser } =
    useAuthStore()
  const [ready, setReady] = useState(false)
  const didInit = useRef(false)

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    async function restore() {
      if (!refreshToken) {
        setReady(true)
        return
      }

      setRestoring(true)
      try {
        // 1. Refresh tokens
        const refreshed = await authApi.refresh(refreshToken)
        setAccessToken(refreshed.accessToken)

        // 2. Fetch current user
        const user = await authApi.me()

        // 3. Merge persisted profile fields into backend user so they survive backend restarts
        const mergedUser =
          persistedUser && user && persistedUser.email === user.email
            ? {
                ...user,
                name: user.name || persistedUser.name,
                preferredName: user.preferredName || persistedUser.preferredName,
                phone: user.phone || persistedUser.phone,
                bio: user.bio || persistedUser.bio,
                avatarUrl: user.avatarUrl || persistedUser.avatarUrl || persistedUser.avatar || undefined,
                avatar: user.avatarUrl || user.avatar || persistedUser.avatarUrl || persistedUser.avatar || undefined,
              }
            : user

        // 4. Build full session
        setSession({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          user: mergedUser,
          tenant: refreshed.tenant,
          device: refreshed.device,
        })
      } catch (err) {
        console.warn('Session restore failed:', err)
        clearSession()
      } finally {
        setRestoring(false)
        setReady(true)
      }
    }

    restore()
  }, [refreshToken, setSession, setAccessToken, setRestoring, clearSession, persistedUser])

  // Flush settings sync queue when back online
  useEffect(() => {
    const handleOnline = () => {
      useSettingsStore.getState().flushSyncQueue()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return <>{children}</>
}
