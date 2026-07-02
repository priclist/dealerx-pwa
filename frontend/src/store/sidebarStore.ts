import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  open: boolean
  toggle: () => void
  setOpen: (v: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      open: true,
      toggle: () => set((s) => ({ open: !s.open })),
      setOpen: (v) => set({ open: v }),
    }),
    { name: 'dealerx-sidebar' }
  )
)
