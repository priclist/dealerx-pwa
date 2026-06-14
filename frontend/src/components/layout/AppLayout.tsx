import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useStore } from '../../store/useStore'

export default function AppLayout() {
  const { darkMode, sidebarCollapsed } = useStore()

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-56'}`}>
        <Outlet />
      </div>
    </div>
  )
}
