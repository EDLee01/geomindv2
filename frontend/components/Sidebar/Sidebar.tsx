'use client'

import { useState } from 'react'
import { Project, Chat } from '@/lib/api'
import {
  MessageSquarePlus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react'

interface SidebarProps {
  projects: Project[]
  quickChats: Chat[]
  activeProject: Project | null
  activeChat: Chat | null
  onSelectProject: (project: Project) => void
  onSelectChat: (chat: Chat) => void
  onNewQuickChat: () => void
  onDeleteChat: (chatId: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({
  projects,
  quickChats,
  activeProject,
  activeChat,
  onSelectProject,
  onSelectChat,
  onNewQuickChat,
  onDeleteChat,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return d.toLocaleDateString()
  }

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const getStageProgress = (stages: Project['stages']) => {
    const total = Object.keys(stages).length
    const done = Object.values(stages).filter((s) => s === 'done').length
    return Math.round((done / total) * 100)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-40 p-1.5 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 transition-all ${
          isOpen ? 'left-64' : 'left-0'
        }`}
      >
        {isOpen ? (
          <ChevronLeft size={16} className="text-geo-text-light" />
        ) : (
          <ChevronRight size={16} className="text-geo-text-light" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewQuickChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-geo-accent text-white rounded-lg hover:bg-geo-accent-600 transition-colors"
          >
            <MessageSquarePlus size={18} />
            <span>Quick Chat</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Projects Section */}
          {projects.length > 0 && (
            <div className="mb-4">
              <div className="px-4 py-2 text-xs font-semibold text-geo-text-light uppercase tracking-wider">
                Projects
              </div>
              <div className="space-y-1 px-2">
                {projects.map((project) => (
                  <div key={project.id}>
                    {/* Project Header */}
                    <button
                      onClick={() => {
                        onSelectProject(project)
                        toggleProject(project.id)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        activeProject?.id === project.id
                          ? 'bg-geo-primary-100 text-geo-primary'
                          : 'hover:bg-gray-50 text-geo-text'
                      }`}
                    >
                      <FolderOpen
                        size={16}
                        className={
                          activeProject?.id === project.id
                            ? 'text-geo-primary'
                            : 'text-geo-text-light'
                        }
                      />
                      <span className="flex-1 text-left text-sm truncate font-medium">
                        {project.name}
                      </span>
                      {expandedProjects.has(project.id) ? (
                        <ChevronUp size={14} className="text-geo-text-muted" />
                      ) : (
                        <ChevronDown size={14} className="text-geo-text-muted" />
                      )}
                    </button>

                    {/* Project Progress Bar */}
                    {activeProject?.id === project.id && (
                      <div className="mx-3 mt-1 mb-2">
                        <div className="flex justify-between text-xs text-geo-text-muted mb-1">
                          <span>Progress</span>
                          <span>{getStageProgress(project.stages)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-geo-accent rounded-full transition-all"
                            style={{ width: `${getStageProgress(project.stages)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Project Chats (expandable) */}
                    {expandedProjects.has(project.id) && (
                      <div className="ml-4 pl-2 border-l border-gray-200 space-y-1 mt-1">
                        {project.chat_count === 0 ? (
                          <div className="px-3 py-2 text-xs text-geo-text-muted">
                            No chats yet
                          </div>
                        ) : (
                          <div className="text-xs text-geo-text-muted px-3 py-1">
                            {project.chat_count} chat(s)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Chats Section */}
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-geo-text-light uppercase tracking-wider">
              Quick Chats
            </div>
            {quickChats.length === 0 ? (
              <div className="px-4 py-6 text-center text-geo-text-muted text-sm">
                <MessageSquare className="mx-auto mb-2 text-geo-text-muted" size={24} />
                <p>No conversations yet</p>
                <p className="text-xs mt-1">Start a quick chat to begin</p>
              </div>
            ) : (
              <div className="space-y-1 px-2">
                {quickChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative rounded-lg transition-colors ${
                      activeChat?.id === chat.id
                        ? 'bg-geo-accent-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => onSelectChat(chat)}
                      className="w-full text-left px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare
                          size={16}
                          className={
                            activeChat?.id === chat.id
                              ? 'text-geo-accent'
                              : 'text-geo-text-muted'
                          }
                        />
                        <span
                          className={`flex-1 truncate text-sm ${
                            activeChat?.id === chat.id
                              ? 'text-geo-accent-700 font-medium'
                              : 'text-geo-text'
                          }`}
                        >
                          {chat.title}
                        </span>
                      </div>
                      <div className="text-xs text-geo-text-muted mt-1 pl-6">
                        {formatDate(chat.created_at)}
                      </div>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-geo-text-muted hover:text-geo-error hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <div className="text-xs text-geo-text-muted text-center">
            GeoMind v3.0
          </div>
        </div>
      </aside>
    </>
  )
}
