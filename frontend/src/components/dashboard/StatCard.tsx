import { TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { useStore } from '../../store/useStore'

interface StatCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  data: { v: number }[]
  color: string
  icon: React.ReactNode
}

export default function StatCard({ title, value, change, changeLabel, data, color, icon }: StatCardProps) {
  const { darkMode } = useStore()
  const isPositive = change >= 0

  return (
    <div className={`rounded-2xl p-5 border transition-all hover:shadow-md ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{title}</p>
          <p className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl`} style={{ background: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        {isPositive
          ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          : <TrendingDown className="w-3.5 h-3.5 text-red-500" />
        }
        <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{changeLabel}</span>
      </div>
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#grad-${title})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
