import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  avatarUrl?: string
  businessName?: string
  logo?: string
  phone?: string
  bio?: string
  preferredName?: string
}

export interface TenantBrief {
  id: string
  name: string
  slug: string
}

export interface DeviceBrief {
  fingerprint: string
  label: string
  platform: string
  userAgent: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
  tenant?: TenantBrief
  device?: DeviceBrief
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  tenant: TenantBrief | null
  device: DeviceBrief | null
  isAuthenticated: boolean
  isRestoring: boolean
  setSession: (payload: LoginResponse) => void
  setUser: (user: AuthUser) => void
  setAccessToken: (token: string) => void
  setRestoring: (restoring: boolean) => void
  refreshTokens: () => Promise<string>
  logout: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      tenant: null,
      device: null,
      isAuthenticated: false,
      isRestoring: false,

      setSession: (payload) => {
        const user = payload.user
          ? {
              ...payload.user,
              avatarUrl:
                payload.user.avatarUrl ||
                payload.user.avatar ||
                (payload.user.email
                  ? localStorage.getItem(`dealerx-avatar-${payload.user.email}`) || undefined
                  : undefined),
            }
          : payload.user
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user,
          tenant: payload.tenant ?? null,
          device: payload.device ?? null,
          isAuthenticated: true,
        })
      },

      setUser: (user) => {
        if (user?.email && (user.avatarUrl || user.avatar)) {
          localStorage.setItem(
            `dealerx-avatar-${user.email}`,
            user.avatarUrl || user.avatar || ''
          )
        }
        set({ user })
      },

      setAccessToken: (token) => set({ accessToken: token }),

      setRestoring: (restoring) => set({ isRestoring: restoring }),

      refreshTokens: async () => {
        const currentRefresh = get().refreshToken
        if (!currentRefresh) throw new Error('No refresh token available')

        const res = await fetch(
          `${import.meta.env.VITE_API_URL || ''}/auth/refresh`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: currentRefresh }),
          }
        )

        if (!res.ok) {
          get().clearSession()
          throw new Error('Session expired')
        }

        const data = await res.json()
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        })
        return data.accessToken
      },

      logout: async () => {
        const token = get().accessToken
        if (token) {
          try {
            await fetch(`${import.meta.env.VITE_API_URL || ''}/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            })
          } catch {
            // ignore network errors on logout
          }
        }
        get().clearSession()
      },

      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          tenant: null,
          device: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'dealerx-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
        tenant: state.tenant,
        device: state.device,
      }),
    }
  )
)
