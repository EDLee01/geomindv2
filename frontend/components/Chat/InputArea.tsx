'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, X } from 'lucide-react'
import { FileUploadResponse } from '@/lib/api'

interface InputAreaProps {
  onSendMessage: (content: string) => void
  onFileUpload: (file: File) => Promise<FileUploadResponse>
  isLoading: boolean
}

export function InputArea({ onSendMessage, onFileUpload, isLoading }: InputAreaProps) {
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
    <div className="border-t border-slate-200 p-4 bg-white">
      {/* Upload Error */}
      {uploadError && (
        <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* File Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isLoading}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          title="Upload file (Excel, CSV)"
        >
          <Paperclip size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
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
            placeholder="Ask about Earth Sciences, analyze data, or search literature..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] max-h-[200px]"
            rows={1}
            disabled={isLoading}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>

      {/* Uploading indicator */}
      {isUploading && (
        <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Uploading file...
        </div>
      )}
    </div>
  )
}
