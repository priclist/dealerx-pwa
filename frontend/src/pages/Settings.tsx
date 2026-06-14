import { User, Bell, Shield, Moon, Sun, ChevronRight } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

export default function Settings() {
  const { darkMode, toggleDarkMode, user } = useStore()

  const sections = [
    {
      title: 'Profile',
      icon: User,
      items: [
        { label: 'Full Name', value: user?.name },
        { label: 'Email', value: user?.email },
        { label: 'Role', value: user?.role },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'New lead alerts', value: 'Enabled' },
        { label: 'Deal updates', value: 'Enabled' },
        { label: 'Weekly report', value: 'Disabled' },
      ],
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Two-factor authentication', value: 'Off' },
        { label: 'Session timeout', value: '30 min' },
        { label: 'Password', value: '••••••••' },
      ],
    },
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Settings" subtitle="Manage your account and preferences" />
      <div className="p-6 max-w-2xl space-y-5">
        <div className={`rounded-2xl border p-5 flex items-center justify-between ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-500" />}
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{darkMode ? 'Dark theme active' : 'Light theme active'}</p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${darkMode ? 'left-6 bg-white' : 'left-1 bg-white shadow-sm'}`} />
          </button>
        </div>

        {sections.map(section => {
          const Icon = section.icon
          return (
            <div key={section.title} className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
              <div className={`flex items-center gap-2.5 px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
                <Icon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{section.title}</h3>
              </div>
              <div>
                {section.items.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between px-5 py-3.5 border-b last:border-0 cursor-pointer transition-colors ${darkMode ? 'border-[#2a2a2e] hover:bg-[#1c1c20]' : 'border-gray-50 hover:bg-gray-50'}`}>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.value}</span>
                      <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
