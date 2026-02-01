'use client'

import { useState } from 'react'
import { Message, Artifact } from '@/lib/api'
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, Copy, Check, Code, FileText } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  onArtifactClick?: (artifact: Artifact) => void
}

export function MessageBubble({ message, onArtifactClick }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'user'
  const hasArtifacts = message.artifacts && message.artifacts.length > 0

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Simple markdown rendering
  const renderContent = (content: string) => {
    // Handle code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex} className="whitespace-pre-wrap">
            {renderInlineMarkdown(content.slice(lastIndex, match.index))}
          </span>
        )
      }

      // Add code block
      const language = match[1] || 'text'
      const code = match[2]
      parts.push(
        <pre key={match.index} className="bg-geo-primary-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3 text-sm font-mono">
          <div className="flex justify-between items-center mb-2 text-xs text-gray-400">
            <span>{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="hover:text-white"
            >
              <Copy size={14} />
            </button>
          </div>
          <code>{code}</code>
        </pre>
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={lastIndex} className="whitespace-pre-wrap">
          {renderInlineMarkdown(content.slice(lastIndex))}
        </span>
      )
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{content}</span>
  }

  const renderInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 py-0.5 rounded text-sm">$1</code>')
  }

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
        isUser ? 'bg-geo-secondary text-white' : 'bg-geo-primary text-white'
      }`}>
        {isUser ? '👤' : '🌍'}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-geo-secondary text-white'
            : 'bg-white text-geo-text shadow-sm border border-gray-100'
        }`}>
          {/* Header for assistant */}
          {!isUser && (
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <span className="font-semibold text-geo-primary">GeoMind</span>
              <span className="text-xs text-geo-text-muted">{formatTime(message.created_at)}</span>
            </div>
          )}

          {/* Message text */}
          <div className={`${isUser ? '' : 'prose prose-sm max-w-none'}`}>
            {renderContent(message.content)}
          </div>

          {/* Artifacts Section */}
          {hasArtifacts && (
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
              <p className="text-xs text-geo-text-muted font-medium">Artifacts</p>
              {message.artifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  onClick={() => onArtifactClick?.(artifact)}
                  className="w-full flex items-center gap-2 p-2 bg-geo-accent-50 hover:bg-geo-accent-100 rounded-lg text-left transition-colors"
                >
                  {artifact.type === 'code' ? (
                    <Code size={16} className="text-geo-accent" />
                  ) : (
                    <FileText size={16} className="text-geo-accent" />
                  )}
                  <span className="text-sm text-geo-accent-700 truncate flex-1">
                    {artifact.title}
                  </span>
                  <span className="text-xs text-geo-accent-500 px-2 py-0.5 bg-geo-accent-100 rounded">
                    {artifact.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={copyToClipboard}
              className="text-geo-text-muted hover:text-geo-text p-1 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} className="text-geo-success" /> : <Copy size={14} />}
            </button>
          </div>
        )}

        {/* Timestamp for user messages */}
        {isUser && (
          <span className="text-xs text-geo-text-muted mt-1">
            {formatTime(message.created_at)}
          </span>
        )}
      </div>
    </div>
  )
}
