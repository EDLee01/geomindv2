'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { ChatWindow } from '@/components/Chat/ChatWindow'
import { ArtifactPanel } from '@/components/Artifact/ArtifactPanel'
import { BookOpen, FolderPlus, Settings, User, Plus, LogOut, LogIn, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Project,
  Chat,
  Message,
  Artifact,
  getProjects,
  createProject,
  getChats,
  createChat,
  getChat,
  deleteChat,
  sendMessage,
} from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth()

  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [quickChats, setQuickChats] = useState<Chat[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default closed on mobile
  const [isLoading, setIsLoading] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Set sidebar open by default on desktop
  useEffect(() => {
    const checkDesktop = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true)
      }
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Load projects and quick chats on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [projectsRes, chatsRes] = await Promise.all([
        getProjects().catch(() => ({ projects: [], total: 0 })),
        getChats().catch(() => ({ chats: [], total: 0 })),
      ])
      setProjects(projectsRes.projects)
      setQuickChats(chatsRes.chats)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  // Create new project
  const handleCreateProject = async (name: string, topic?: string) => {
    try {
      const project = await createProject(name, topic)
      setProjects([project, ...projects])
      setActiveProject(project)
      setShowNewProjectModal(false)
      // Create initial chat for the project
      const chat = await createChat(project.id, 'Chat 1: Literature & Topic')
      setActiveChat(chat)
      setMessages([])
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  // Create new quick chat
  const handleNewQuickChat = async () => {
    try {
      const chat = await createChat(undefined, 'New Chat')
      setQuickChats([chat, ...quickChats])
      setActiveProject(null)
      setActiveChat(chat)
      setMessages([])
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  // Select a chat
  const handleSelectChat = async (chat: Chat) => {
    try {
      const fullChat = await getChat(chat.id)
      setActiveChat(fullChat)
      setMessages(fullChat.messages || [])
      if (chat.project_id) {
        const project = projects.find(p => p.id === chat.project_id)
        setActiveProject(project || null)
      } else {
        setActiveProject(null)
      }
    } catch (error) {
      console.error('Failed to load chat:', error)
    }
  }

  // Delete a chat
  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      setQuickChats(quickChats.filter(c => c.id !== chatId))
      if (activeChat?.id === chatId) {
        setActiveChat(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  // Send a message
  const handleSendMessage = async (content: string, searchLiterature: boolean = false) => {
    if (!activeChat) {
      // Create a new chat first
      await handleNewQuickChat()
      return
    }

    setIsLoading(true)
    try {
      const response = await sendMessage(activeChat.id, content, {
        searchLiterature,
        projectId: activeProject?.id,
      })

      // Add messages to state
      setMessages([...messages, response.user_message, response.assistant_message])

      // Extract artifacts from response
      if (response.assistant_message.artifacts?.length > 0) {
        setActiveArtifact(response.assistant_message.artifacts[0])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-geo-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-geo-primary flex items-center justify-between px-2 md:px-4 z-50">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-geo-primary-700 text-white md:hidden"
          >
            <Menu size={20} />
          </button>
          <span className="text-xl md:text-2xl">🌍</span>
          <span className="text-lg md:text-xl font-semibold text-white">GeoMind</span>
          <span className="text-xs text-geo-primary-300 bg-geo-primary-700 px-2 py-0.5 rounded hidden sm:inline">
            3.0
          </span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg bg-geo-accent hover:bg-geo-accent-600 text-white transition-colors"
          >
            <FolderPlus size={18} />
            <span className="text-sm hidden sm:inline">New Project</span>
          </button>
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-geo-primary-700 text-geo-primary-200 transition-colors">
            <BookOpen size={18} />
            <span className="text-sm hidden md:inline">Literature</span>
          </button>
          <button className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-geo-primary-700 text-geo-primary-200 transition-colors">
            <Settings size={18} />
          </button>

          {/* User Menu */}
          {isAuthLoading ? (
            <div className="w-8 h-8 rounded-full bg-geo-primary-600 animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-geo-accent text-white flex items-center justify-center hover:bg-geo-accent-600 transition-colors"
                title={user.username}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full" />
                ) : (
                  <span className="text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-geo-primary-800">{user.full_name || user.username}</p>
                    <p className="text-xs text-geo-primary-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setShowUserMenu(false)
                      router.push('/login')
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg bg-geo-accent hover:bg-geo-accent-600 text-white transition-colors"
            >
              <LogIn size={18} />
              <span className="text-sm hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex w-full pt-14">
        {/* Sidebar */}
        <Sidebar
          projects={projects}
          quickChats={quickChats}
          activeProject={activeProject}
          activeChat={activeChat}
          onSelectProject={(project) => setActiveProject(project)}
          onSelectChat={handleSelectChat}
          onNewQuickChat={handleNewQuickChat}
          onDeleteChat={handleDeleteChat}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Chat Area */}
        <main
          className={`flex-1 flex transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            activeProject={activeProject}
            onSendMessage={handleSendMessage}
            onArtifactClick={setActiveArtifact}
          />

          {/* Artifact Panel */}
          {activeArtifact && (
            <ArtifactPanel
              artifact={activeArtifact}
              onClose={() => setActiveArtifact(null)}
            />
          )}
        </main>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  )
}

// New Project Modal Component
function NewProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (name: string, topic?: string) => void
}) {
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim(), topic.trim() || undefined)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-semibold text-geo-primary mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-geo-text mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Dissolved Oxygen Prediction"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-accent focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-geo-text mb-1">
                Research Topic
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Predicting dissolved oxygen in rivers using deep learning"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-geo-accent focus:border-transparent h-24 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-geo-text-light hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-geo-accent text-white rounded-lg hover:bg-geo-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
