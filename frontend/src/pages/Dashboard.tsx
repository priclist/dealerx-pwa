import { DollarSign, Package, UserPlus, Handshake } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import StatCard from '../components/dashboard/StatCard'
import SalesChart from '../components/dashboard/SalesChart'
import InventoryChart from '../components/dashboard/InventoryChart'
import RecentActivity from '../components/dashboard/RecentActivity'
import AIAssistantPanel from '../components/dashboard/AIAssistantPanel'
import TopVehicles from '../components/dashboard/TopVehicles'
import TasksWidget from '../components/dashboard/TasksWidget'
import CalendarWidget from '../components/dashboard/CalendarWidget'
import SalesPipeline from '../components/dashboard/SalesPipeline'
import { useStore } from '../store/useStore'

const sparkData = (base: number) =>
  Array.from({ length: 8 }, (_, i) => ({ v: base + Math.sin(i) * base * 0.2 + Math.random() * base * 0.1 }))

export default function Dashboard() {
  const { darkMode } = useStore()

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Overview" subtitle="Here's what's happening with your dealership today." />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Sales" value="$2,480,000" change={12.5} changeLabel="vs last month" data={sparkData(200000)} color="#3b82f6" icon={<DollarSign className="w-5 h-5" />} />
          <StatCard title="Total Vehicles" value="248" change={8.2} changeLabel="vs last month" data={sparkData(220)} color="#8b5cf6" icon={<Package className="w-5 h-5" />} />
          <StatCard title="New Leads" value="64" change={16.3} changeLabel="vs last month" data={sparkData(50)} color="#10b981" icon={<UserPlus className="w-5 h-5" />} />
          <StatCard title="Open Deals" value="18" change={5.6} changeLabel="vs last month" data={sparkData(15)} color="#f59e0b" icon={<Handshake className="w-5 h-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <SalesChart />
          </div>
          <div className="lg:col-span-1">
            <InventoryChart />
          </div>
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TopVehicles />
          </div>
          <div className="lg:col-span-1 grid grid-cols-1 gap-4">
            <TasksWidget />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SalesPipeline />
          </div>
          <div className="lg:col-span-1 grid grid-cols-1 gap-4">
            <CalendarWidget />
            <AIAssistantPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
