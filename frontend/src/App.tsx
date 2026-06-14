import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import Customers from './pages/Customers'
import Deals from './pages/Deals'
import Leads from './pages/Leads'
import Analytics from './pages/Analytics'
import AIAssistant from './pages/AIAssistant'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Messages from './pages/Messages'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/new" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/deals/new" element={<Deals />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/new" element={<Leads />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/calendar/new" element={<Calendar />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
