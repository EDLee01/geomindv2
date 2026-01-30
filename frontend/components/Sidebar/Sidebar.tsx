'use client'

import { Conversation } from '@/app/page'
import { MessageSquarePlus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
  conversations: Conversation[]
  activeConversation: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onToggle
}: SidebarProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return d.toLocaleDateString()
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-40 p-1.5 bg-white border border-slate-200 rounded-r-lg shadow-sm hover:bg-slate-50 transition-all ${
          isOpen ? 'left-64' : 'left-0'
        }`}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* New Conversation Button */}
        <div className="p-3">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageSquarePlus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              <MessageSquare className="mx-auto mb-2 text-slate-400" size={24} />
              <p>No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative rounded-lg transition-colors ${
                    activeConversation === conversation.id
                      ? 'bg-blue-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className="w-full text-left px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare
                        size={16}
                        className={
                          activeConversation === conversation.id
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }
                      />
                      <span
                        className={`flex-1 truncate text-sm ${
                          activeConversation === conversation.id
                            ? 'text-blue-700 font-medium'
                            : 'text-slate-700'
                        }`}
                      >
                        {conversation.title}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 pl-6">
                      {formatDate(conversation.createdAt)}
                    </div>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conversation.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            GeoMind v2.0
          </div>
        </div>
      </aside>
    </>
  )
}
