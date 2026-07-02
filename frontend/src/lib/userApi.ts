import { useAuthStore } from '../store/authStore'
import type { AuthUser } from '../store/authStore'
import { api } from './api'

const API_URL = import.meta.env.VITE_API_URL || ''

export interface UserProfile {
  name?: string
  preferredName?: string
  email?: string
  phone?: string
  businessName?: string
  bio?: string
  logo?: string
}

export interface UserSettings {
  emailNotif?: boolean
  twoFa?: boolean
  pushNotif?: boolean
  emailAlerts?: boolean
  dailyBrief?: boolean
  offlineAlerts?: boolean
  darkTheme?: boolean
  language?: string
  currency?: string
  timezone?: string
  telegram?: boolean
  whatsapp?: boolean
  discord?: boolean
}

export const userApi = {
  me: () => api.get<AuthUser>('/users/me'),

  updateProfile: (body: Partial<UserProfile>) => api.put<AuthUser>('/users/me', body),

  updateSettings: (settings: Partial<UserSettings>) => api.put<AuthUser>('/users/me/settings', settings),

  uploadAvatar: async (formData: FormData): Promise<AuthUser> => {
    const token = useAuthStore.getState().accessToken
    const url = `${API_URL}/users/me/avatar`

    console.log('[userApi.uploadAvatar] POST', url)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      })

      console.log('[userApi.uploadAvatar] response status:', res.status, res.statusText)

      if (!res.ok) {
        const text = await res.text()
        console.error('[userApi.uploadAvatar] error response:', text)
        let msg = text
        try { msg = JSON.parse(text).error || text } catch {}
        throw new Error(msg || `HTTP ${res.status}`)
      }

      const text = await res.text()
      console.log('[userApi.uploadAvatar] success response:', text.substring(0, 200))
      return text ? JSON.parse(text) as AuthUser : (undefined as unknown as AuthUser)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.error('[userApi.uploadAvatar] request timed out')
        throw new Error('Upload timed out')
      }
      console.error('[userApi.uploadAvatar] fetch error:', err)
      throw err
    } finally {
      clearTimeout(timeout)
    }
  },
}
