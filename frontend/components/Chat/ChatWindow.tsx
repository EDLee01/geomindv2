'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { InputArea } from './InputArea'
import { Message, Project, Artifact, uploadFile, FileUploadResponse } from '@/lib/api'
import { MessageSquarePlus, BookOpen, Database, Code, FileText } from 'lucide-react'

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  activeProject: Project | null
  onSendMessage: (content: string, searchLiterature?: boolean) => void
  onArtifactClick: (artifact: Artifact) => void
}

export function ChatWindow({
  messages,
  isLoading,
  activeProject,
  onSendMessage,
  onArtifactClick,
}: ChatWindowProps) {
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(null)
  const [searchLiterature, setSearchLiterature] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    onSendMessage(content, searchLiterature)
  }

  const handleFileUpload = async (file: File) => {
    try {
      const response = await uploadFile(file)
      setUploadedFile(response)
      return response
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  // Empty state - Welcome screen
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-geo-bg-light">
        {/* Project Header (if in a project) */}
        {activeProject && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-white">
            <h2 className="text-base md:text-lg font-semibold text-geo-primary">{activeProject.name}</h2>
            {activeProject.topic && (
              <p className="text-sm text-geo-text-light mt-1 line-clamp-2">{activeProject.topic}</p>
            )}
          </div>
        )}

        {/* Welcome Content */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="text-center max-w-2xl px-4 md:px-6 py-6">
            <div className="text-4xl md:text-6xl mb-4 md:mb-6">🌍</div>
            <h2 className="text-2xl md:text-3xl font-bold text-geo-primary mb-2 md:mb-3">
              Welcome to GeoMind 3.0
            </h2>
            <p className="text-geo-text-light text-base md:text-lg mb-6 md:mb-8">
              Your AI research assistant for Earth Sciences.
              Search verified literature, analyze data, and write papers.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="p-4 bg-white rounded-xl border border-gray-200 text-left">
                <BookOpen className="text-geo-accent mb-2" size={24} />
                <h3 className="font-semibold text-geo-text">Literature Search</h3>
                <p className="text-sm text-geo-text-light">
                  700,000+ verified papers with DOI validation
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-200 text-left">
                <Database className="text-geo-accent mb-2" size={24} />
                <h3 className="font-semibold text-geo-text">Data Analysis</h3>
                <p className="text-sm text-geo-text-light">
                  Upload Excel/CSV for instant analysis
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-200 text-left">
                <Code className="text-geo-accent mb-2" size={24} />
                <h3 className="font-semibold text-geo-text">Code Execution</h3>
                <p className="text-sm text-geo-text-light">
                  Run Python code with visualization
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-200 text-left">
                <FileText className="text-geo-accent mb-2" size={24} />
                <h3 className="font-semibold text-geo-text">Paper Writing</h3>
                <p className="text-sm text-geo-text-light">
                  Full workflow from literature to draft
                </p>
              </div>
            </div>

            {/* Quick Start Suggestions */}
            <div className="space-y-2">
              <p className="text-sm text-geo-text-muted mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  '帮我找关于溶解氧预测的文献',
                  'LSTM在水质预测中的应用',
                  '如何进行Mann-Kendall趋势分析',
                  '帮我分析这份水质数据',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-2 md:px-3 py-1.5 md:py-2 bg-white border border-gray-200 rounded-lg text-xs md:text-sm text-geo-text hover:bg-geo-accent-50 hover:border-geo-accent transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-2 md:p-4">
          <InputArea
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            searchLiterature={searchLiterature}
            onToggleSearchLiterature={() => setSearchLiterature(!searchLiterature)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-geo-bg-light">
      {/* Project Header (if in a project) */}
      {activeProject && (
        <div className="px-4 md:px-6 py-2 md:py-3 border-b border-gray-200 bg-white">
          <h2 className="text-base md:text-lg font-semibold text-geo-primary truncate">{activeProject.name}</h2>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-2 md:py-4 px-2 md:px-4 space-y-3 md:space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onArtifactClick={onArtifactClick}
            />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-geo-primary flex items-center justify-center text-white">
                🌍
              </div>
              <div className="flex items-center gap-1.5 px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-2 h-2 bg-geo-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-geo-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-geo-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Uploaded File Indicator */}
      {uploadedFile && (
        <div className="px-4 py-2 bg-geo-accent-50 border-t border-geo-accent-200">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
            <span className="text-geo-accent-700">
              📎 {uploadedFile.filename} ({uploadedFile.preview?.rows || 0} rows, {uploadedFile.preview?.columns || 0} columns)
            </span>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-geo-accent-600 hover:text-geo-accent-800"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 md:p-4 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <InputArea
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            searchLiterature={searchLiterature}
            onToggleSearchLiterature={() => setSearchLiterature(!searchLiterature)}
          />
        </div>
      </div>
    </div>
  )
}
