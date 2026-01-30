'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { InputArea } from './InputArea'
import { Message, Conversation, Literature } from '@/app/page'
import { chatCompletion, uploadFile, FileUploadResponse } from '@/lib/api'
import { MessageSquarePlus } from 'lucide-react'

interface ChatWindowProps {
  conversation: Conversation | undefined
  onUpdateMessages: (messages: Message[]) => void
  onNewConversation: () => void
}

export function ChatWindow({ conversation, onUpdateMessages, onNewConversation }: ChatWindowProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleSendMessage = async (content: string) => {
    if (!conversation) {
      onNewConversation()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    const updatedMessages = [...conversation.messages, userMessage]
    onUpdateMessages(updatedMessages)

    setIsLoading(true)

    try {
      // Prepare file context if available
      const fileContext = uploadedFile?.preview
        ? `File: ${uploadedFile.filename}\nRows: ${uploadedFile.preview.rows}, Columns: ${uploadedFile.preview.columns}\nColumns: ${uploadedFile.preview.column_names.join(', ')}`
        : undefined

      const response = await chatCompletion(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        true,
        fileContext
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        literature: response.literature as Literature[]
      }

      onUpdateMessages([...updatedMessages, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      }
      onUpdateMessages([...updatedMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
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

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Welcome to GeoMind
          </h2>
          <p className="text-slate-600 mb-6">
            Your AI-powered research assistant for Earth Sciences.
            Upload data, search literature, and get expert analysis.
          </p>
          <button
            onClick={onNewConversation}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <MessageSquarePlus size={20} />
            Start New Conversation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-20">
            <p className="text-lg">Start your conversation</p>
            <p className="text-sm mt-2">
              Ask questions about Earth Sciences, upload data for analysis, or search for literature.
            </p>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 p-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
              🌍
            </div>
            <div className="flex items-center gap-1 px-4 py-3 bg-slate-100 rounded-lg">
              <div className="w-2 h-2 bg-slate-400 rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full loading-dot"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full loading-dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded File Indicator */}
      {uploadedFile && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">
              📎 {uploadedFile.filename} ({uploadedFile.preview.rows} rows, {uploadedFile.preview.columns} columns)
            </span>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <InputArea
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
      />
    </div>
  )
}
