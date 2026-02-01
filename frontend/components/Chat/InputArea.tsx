'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, X, BookOpen } from 'lucide-react'
import { FileUploadResponse } from '@/lib/api'

interface InputAreaProps {
  onSendMessage: (content: string) => void
  onFileUpload: (file: File) => Promise<FileUploadResponse>
  isLoading: boolean
  searchLiterature?: boolean
  onToggleSearchLiterature?: () => void
}

export function InputArea({
  onSendMessage,
  onFileUpload,
  isLoading,
  searchLiterature = false,
  onToggleSearchLiterature,
}: InputAreaProps) {
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      await onFileUpload(file)
    } catch (error) {
      setUploadError('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <div className="space-y-3">
      {/* Upload Error */}
      {uploadError && (
        <div className="p-2 bg-red-50 text-geo-error text-sm rounded-lg flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Options Row */}
      <div className="flex items-center gap-2">
        {onToggleSearchLiterature && (
          <button
            onClick={onToggleSearchLiterature}
            className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm transition-colors ${
              searchLiterature
                ? 'bg-geo-accent text-white'
                : 'bg-gray-100 text-geo-text-light hover:bg-gray-200'
            }`}
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Search Literature</span>
            <span className="sm:hidden">Literature</span>
          </button>
        )}
      </div>

      {/* Input Row */}
      <div className="flex items-end gap-2 md:gap-3">
        {/* File Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isLoading}
          className="p-2 md:p-2.5 text-geo-text-light hover:text-geo-text hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Upload file (Excel, CSV)"
        >
          <Paperclip size={18} className="md:hidden" />
          <Paperclip size={20} className="hidden md:block" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.json,.geojson"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Earth Sciences..."
            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-geo-bg border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-geo-accent focus:border-transparent min-h-[44px] md:min-h-[48px] max-h-[200px] text-sm md:text-base text-geo-text placeholder:text-geo-text-muted"
            rows={1}
            disabled={isLoading}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className="p-2.5 md:p-3 bg-geo-accent text-white rounded-xl hover:bg-geo-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} className="md:hidden" />
          <Send size={20} className="hidden md:block" />
        </button>
      </div>

      {/* Uploading indicator */}
      {isUploading && (
        <div className="text-sm text-geo-text-light flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-geo-accent border-t-transparent rounded-full animate-spin"></div>
          Uploading file...
        </div>
      )}
    </div>
  )
}
