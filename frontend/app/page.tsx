'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { ChatWindow } from '@/components/Chat/ChatWindow'
import { LiteraturePanel } from '@/components/Literature/LiteraturePanel'
import { BookOpen, FolderOpen, Settings, User } from 'lucide-react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  literature?: Literature[]
}

export interface Literature {
  title: string
  author_display: string
  year: number | null
  journal: string
  openalex_url: string
  score?: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [showLiteraturePanel, setShowLiteraturePanel] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const currentConversation = conversations.find(c => c.id === activeConversation)

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date()
    }
    setConversations(prev => [newConv, ...prev])
    setActiveConversation(newConv.id)
  }

  const updateConversation = (conversationId: string, messages: Message[]) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        // Update title based on first user message
        const firstUserMsg = messages.find(m => m.role === 'user')
        const title = firstUserMsg
          ? firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
          : conv.title
        return { ...conv, messages, title }
      }
      return conv
    }))
  }

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    if (activeConversation === conversationId) {
      setActiveConversation(conversations.length > 1 ? conversations[0].id : null)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="text-xl font-semibold text-slate-800">GeoMind</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLiteraturePanel(!showLiteraturePanel)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showLiteraturePanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <BookOpen size={18} />
            <span className="text-sm">Literature</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600">
            <FolderOpen size={18} />
            <span className="text-sm">Projects</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600">
            <Settings size={18} />
          </button>
          <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <User size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex w-full pt-14">
        {/* Sidebar */}
        <Sidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={setActiveConversation}
          onNewConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Chat Area */}
        <main className={`flex-1 flex transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <ChatWindow
            conversation={currentConversation}
            onUpdateMessages={(messages) => {
              if (activeConversation) {
                updateConversation(activeConversation, messages)
              }
            }}
            onNewConversation={createNewConversation}
          />

          {/* Literature Panel */}
          {showLiteraturePanel && (
            <LiteraturePanel onClose={() => setShowLiteraturePanel(false)} />
          )}
        </main>
      </div>
    </div>
  )
}
