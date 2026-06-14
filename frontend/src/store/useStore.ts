import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
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
  logout: () => void
}

const savedToken = localStorage.getItem('dealerx_token')
const savedUser = localStorage.getItem('dealerx_user')

export const useStore = create<AppStore>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  darkMode: localStorage.getItem('dealerx_dark') === 'true',
  sidebarCollapsed: false,
  token: savedToken,
  setUser: (user) => {
    if (user) localStorage.setItem('dealerx_user', JSON.stringify(user))
    else localStorage.removeItem('dealerx_user')
    set({ user })
  },
  setToken: (token) => {
    if (token) localStorage.setItem('dealerx_token', token)
    else localStorage.removeItem('dealerx_token')
    set({ token })
  },
  toggleDarkMode: () => set((s) => {
    localStorage.setItem('dealerx_dark', String(!s.darkMode))
    return { darkMode: !s.darkMode }
  }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  logout: () => {
    localStorage.removeItem('dealerx_token')
    localStorage.removeItem('dealerx_user')
    set({ user: null, token: null })
  },
}))
