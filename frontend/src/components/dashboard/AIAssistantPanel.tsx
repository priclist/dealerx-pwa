import { useState } from 'react'
import { Send, Mic, MoreHorizontal } from 'lucide-react'
import { useStore } from '../../store/useStore'

function RedXLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon points="0,20 35,50 0,80" fill="#dc2626" />
      <polygon points="30,0 65,30 100,0" fill="#ef4444" />
      <polygon points="35,50 65,80 30,100" fill="#b91c1c" />
      <polygon points="65,30 100,60 65,80" fill="#f87171" />
    </svg>
  )
}

const quickPrompts = [
  'Show me sales performance',
  'Which vehicles are low in stock?',
  'Summarize open deals',
  'Generate sales report',
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIAssistantPanel() {
  const { darkMode, user } = useStore()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', content: text }
    const botMsg: Message = { role: 'assistant', content: `Analyzing your request: "${text}". Based on current data, here's what I found...` }
    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput('')
  }

  return (
    <div className={`rounded-2xl border flex flex-col h-full min-h-[420px] ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center">
            <RedXLogo size={18} />
          </div>
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Assistant</span>
        </div>
        <button className={`p-1 rounded-lg ${darkMode ? 'hover:bg-[#1c1c20] text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}>
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <div>
            <p className={`text-base font-semibold mb-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Hi {user?.name?.split(' ')[0]},</p>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>How can I help you today?</p>
            <div className="space-y-2">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className={`w-full text-left text-xs px-3 py-2.5 rounded-xl border flex items-center gap-2 transition-colors ${darkMode ? 'border-[#2a2a2e] text-gray-300 hover:bg-[#1c1c20]' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                >
                  <RedXLogo size={14} />
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-black text-white'
                : darkMode ? 'bg-[#1c1c20] text-gray-200' : 'bg-gray-100 text-gray-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className={`p-4 border-t ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${darkMode ? 'border-[#2a2a2e] bg-[#1c1c20]' : 'border-gray-200 bg-gray-50'}`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask anything..."
            className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-700 placeholder-gray-400'}`}
          />
          <button className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => send(input)}
            className="p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
