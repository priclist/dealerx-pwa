import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Sales Manager' | 'Sales Agent'
  avatar?: string
}

interface AppStore {
  user: User | null
  darkMode: boolean
  sidebarCollapsed: boolean
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  toggleDarkMode: () => void
  toggleSidebar: () => void
}

export const useStore = create<AppStore>((set) => ({
  user: {
    id: '1',
    name: 'John Carter',
    email: 'john@dealerx.com',
    role: 'Admin',
  },
  darkMode: false,
  sidebarCollapsed: false,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
