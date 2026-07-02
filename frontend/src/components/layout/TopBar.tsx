import { Bell, MessageSquare, Plus, Search, Sun, Moon, Menu, ChevronDown } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useAuthStore } from '../../store/authStore'

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { darkMode, toggleDarkMode, toggleSidebar } = useStore()
  const { user } = useAuthStore()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className={`sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b ${darkMode ? 'bg-[#111114]/90 border-[#2a2a2e]' : 'bg-white/90 border-gray-200'} backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-[#1c1c20] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-lg font-semibold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title === 'Overview' ? `${greeting()}, ${user?.name?.split(' ')[0]}. ☀️` : title}
          </h1>
          {subtitle && (
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${darkMode ? 'bg-[#1c1c20] border-[#2a2a2e] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
          <Search className="w-4 h-4" />
          <span>Search anything...</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-[#2a2a2e] text-gray-500' : 'bg-gray-200 text-gray-400'}`}>⌘S</span>
        </div>

        <button className={`relative p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-[#1c1c20] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className={`relative p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-[#1c1c20] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-[#1c1c20] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add New</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
