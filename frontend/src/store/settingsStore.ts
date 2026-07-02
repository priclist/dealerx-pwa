import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '../lib/api'

export interface UserSettings {
  emailNotif: boolean
  twoFa: boolean
  pushNotif: boolean
  emailAlerts: boolean
  dailyBrief: boolean
  offlineAlerts: boolean
  darkTheme: boolean
  language: string
  currency: string
  timezone: string
  telegram: boolean
  whatsapp: boolean
  discord: boolean
}

const DEFAULT_SETTINGS: UserSettings = {
  emailNotif: true,
  twoFa: false,
  pushNotif: true,
  emailAlerts: true,
  dailyBrief: true,
  offlineAlerts: false,
  darkTheme: false,
  language: 'en-US',
  currency: 'ZAR',
  timezone: 'Africa/Johannesburg',
  telegram: false,
  whatsapp: false,
  discord: false,
}

interface SettingsState extends UserSettings {
  loaded: boolean
  syncQueue: { key: string; value: unknown }[]
  loadSettings: () => Promise<void>
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>
  flushSyncQueue: () => Promise<void>
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      loaded: false,
      syncQueue: [],

      loadSettings: async () => {
        try {
          const data = await api.get<UserSettings>('/users/me/settings')
          // Server data takes precedence — overwrite localStorage
          set({ ...data, loaded: true, syncQueue: [] })
          // Flush any queued changes from offline usage
          await get().flushSyncQueue()
        } catch {
          // Offline — keep localStorage values
          set({ loaded: true })
        }
      },

      updateSetting: async (key, value) => {
        // 1. Update local state immediately (persisted to localStorage by Zustand)
        set({ [key]: value } as Pick<SettingsState, typeof key>)
        // 2. Try sync to server
        try {
          await api.put('/users/me/settings', { [key]: value })
        } catch {
          // 3. Queue for retry if offline
          const queue = get().syncQueue
          const existing = queue.findIndex(q => q.key === key)
          if (existing >= 0) queue[existing].value = value
          else queue.push({ key, value })
          set({ syncQueue: queue })
        }
      },

      updateSettings: async (partial) => {
        set(partial)
        try {
          await api.put('/users/me/settings', partial)
        } catch {
          const queue = get().syncQueue
          for (const [key, value] of Object.entries(partial)) {
            const existing = queue.findIndex(q => q.key === key)
            if (existing >= 0) queue[existing].value = value
            else queue.push({ key, value })
          }
          set({ syncQueue: queue })
        }
      },

      flushSyncQueue: async () => {
        const queue = get().syncQueue
        if (queue.length === 0) return
        const payload: Record<string, unknown> = {}
        for (const item of queue) payload[item.key] = item.value
        try {
          await api.put('/users/me/settings', payload)
          set({ syncQueue: [] })
        } catch {
          // Still offline — keep queue
        }
      },

      resetSettings: () => set({ ...DEFAULT_SETTINGS, loaded: false, syncQueue: [] }),
    }),
    {
      name: 'dealerx-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        emailNotif: state.emailNotif,
        twoFa: state.twoFa,
        pushNotif: state.pushNotif,
        emailAlerts: state.emailAlerts,
        dailyBrief: state.dailyBrief,
        offlineAlerts: state.offlineAlerts,
        darkTheme: state.darkTheme,
        language: state.language,
        currency: state.currency,
        timezone: state.timezone,
        telegram: state.telegram,
        whatsapp: state.whatsapp,
        discord: state.discord,
      }),
    }
  )
)
