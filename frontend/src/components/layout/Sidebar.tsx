import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, DollarSign, Users, Handshake,
  UserPlus, BarChart2, Bot, CheckSquare, Calendar,
  MessageSquare, Settings, ChevronDown, Truck, X
} from 'lucide-react'
import { useStore } from '../../store/useStore'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: DollarSign, label: 'Sales', path: '/sales' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Handshake, label: 'Deals', path: '/deals' },
  { icon: UserPlus, label: 'Leads', path: '/leads' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: Bot, label: 'AI Assistant', path: '/ai' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

const quickActions = [
  { icon: Truck, label: 'Add Vehicle', path: '/inventory/new' },
  { icon: UserPlus, label: 'New Lead', path: '/leads/new' },
  { icon: Handshake, label: 'Create Deal', path: '/deals/new' },
  { icon: Calendar, label: 'Schedule Meeting', path: '/calendar/new' },
]

export default function Sidebar() {
  const { user, sidebarCollapsed, toggleSidebar, darkMode } = useStore()

  return (
    <>
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30 flex flex-col
        transition-all duration-300 ease-in-out
        ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-200'}
        border-r
        ${sidebarCollapsed ? '-translate-x-full lg:-translate-x-full' : 'translate-x-0'}
        w-56
      `}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className={`font-semibold text-base tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>DealerX</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-xl mb-0.5 text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? darkMode
                    ? 'bg-[#1c1c20] text-white'
                    : 'bg-gray-100 text-gray-900'
                  : darkMode
                    ? 'text-gray-400 hover:bg-[#1c1c20] hover:text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={`px-3 pb-3 border-t pt-3 ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider px-3 mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            Quick Actions
          </p>
          {quickActions.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl text-sm transition-all duration-150 ${darkMode ? 'text-gray-400 hover:bg-[#1c1c20] hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className={`px-4 py-3 border-t ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
              <p className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{user?.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
        </div>
      </aside>
    </>
  )
}
