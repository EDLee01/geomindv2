'use client'

import { useState } from 'react'
import { Message } from '@/app/page'
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, Copy, Check } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [showLiterature, setShowLiterature] = useState(false)
  const [copied, setCopied] = useState(false)

  const isUser = message.role === 'user'
  const hasLiterature = message.literature && message.literature.length > 0

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
        isUser ? 'bg-slate-600 text-white' : 'bg-blue-600 text-white'
      }`}>
        {isUser ? '👤' : '🌍'}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-800'
        }`}>
          {/* Header for assistant */}
          {!isUser && (
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
              <span className="font-medium text-slate-700">GeoMind</span>
              <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>
            </div>
          )}

          {/* Message text */}
          <div className={`${isUser ? '' : 'message-content'} whitespace-pre-wrap`}>
            {message.content}
          </div>

          {/* Literature Section */}
          {hasLiterature && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowLiterature(!showLiterature)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <BookOpen size={16} />
                <span>Related Literature ({message.literature!.length})</span>
                {showLiterature ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showLiterature && (
                <div className="mt-3 space-y-2">
                  {message.literature!.map((paper, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg border border-slate-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800 line-clamp-2">
                            {paper.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {paper.author_display} ({paper.year}) | {paper.journal}
                          </p>
                        </div>
                        {paper.openalex_url && (
                          <a
                            href={paper.openalex_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                      {paper.score && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-slate-200 rounded-full">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${paper.score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {Math.round(paper.score * 100)}% match
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={copyToClipboard}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}

        {/* Timestamp for user messages */}
        {isUser && (
          <span className="text-xs text-slate-400 mt-1">
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  )
}
