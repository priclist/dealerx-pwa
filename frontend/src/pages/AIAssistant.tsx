import { useState } from 'react'
import { Send, Mic, Sparkles, Bot, TrendingUp, Package, Handshake, BarChart2 } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const suggestions = [
  { icon: TrendingUp, text: 'What is my most profitable vehicle category?' },
  { icon: Package, text: 'Which vehicles have been in stock the longest?' },
  { icon: Handshake, text: 'What is my lead conversion rate this month?' },
  { icon: BarChart2, text: 'Generate a performance summary for May' },
]

const mockReplies: Record<string, string> = {
  default: "Based on your current data, I can see strong performance across your dealership. Trucks are your top revenue category at 48% of inventory. Your conversion rate has improved 3.2% this month. Would you like a detailed breakdown of any specific area?",
}

export default function AIAssistant() {
  const { darkMode, user } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: now }])
    setInput('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: mockReplies.default,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="AI Assistant" subtitle="Your intelligent dealership advisor" />
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6 gap-4">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Hi {user?.name?.split(' ')[0]}, I'm DealerX Brain
            </h2>
            <p className={`text-sm mb-8 max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Ask me anything about your business — sales performance, inventory insights, lead analysis, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {suggestions.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => send(text)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${darkMode ? 'bg-[#111114] border-[#2a2a2e] text-gray-300 hover:border-[#3a3a3e]' : 'bg-white border-gray-100 text-gray-700 hover:shadow-md'}`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-sm">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-black text-white rounded-br-sm'
                      : darkMode ? 'bg-[#1c1c20] text-gray-200 rounded-bl-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}>
                    {msg.content}
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${darkMode ? 'bg-[#1c1c20]' : 'bg-white border border-gray-100 shadow-sm'}`}>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`flex items-center gap-3 p-3 rounded-2xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-200 shadow-sm'}`}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask DealerX Brain anything..."
            className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}`}
          />
          <button className={`p-2 rounded-xl ${darkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-[#1c1c20]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} transition-colors`}>
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
