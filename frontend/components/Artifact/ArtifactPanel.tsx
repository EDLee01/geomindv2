'use client'

import { useState } from 'react'
import { X, Copy, Download, Code, FileText, Image, Table, BookOpen } from 'lucide-react'
import type { Artifact } from '@/lib/api'

interface ArtifactPanelProps {
  artifact: Artifact | null
  onClose: () => void
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false)

  if (!artifact) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      markdown: '.md',
      code: artifact.language === 'python' ? '.py' : '.txt',
      image: '.png',
      table: '.md',
      bibtex: '.bib',
      references: '.md',
    }
    const ext = extensions[artifact.type] || '.txt'
    const blob = new Blob([artifact.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifact.title.replace(/\s+/g, '_')}${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getIcon = () => {
    switch (artifact.type) {
      case 'code':
        return <Code size={18} />
      case 'image':
        return <Image size={18} />
      case 'table':
        return <Table size={18} />
      case 'bibtex':
      case 'references':
        return <BookOpen size={18} />
      default:
        return <FileText size={18} />
    }
  }

  const renderContent = () => {
    switch (artifact.type) {
      case 'code':
        return (
          <pre className="bg-geo-primary-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm font-mono">
            <code>{artifact.content}</code>
          </pre>
        )
      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={`data:image/png;base64,${artifact.content}`}
              alt={artifact.title}
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>
        )
      case 'table':
        return (
          <div className="overflow-auto">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(artifact.content) }}
            />
          </div>
        )
      case 'markdown':
      case 'references':
        return (
          <div
            className="prose prose-sm max-w-none prose-headings:text-geo-primary prose-a:text-geo-accent"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(artifact.content) }}
          />
        )
      case 'bibtex':
        return (
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm font-mono text-geo-text">
            <code>{artifact.content}</code>
          </pre>
        )
      default:
        return (
          <div className="whitespace-pre-wrap text-geo-text">{artifact.content}</div>
        )
    }
  }

  return (
    <div className="w-[400px] h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-geo-accent">{getIcon()}</span>
          <h3 className="font-semibold text-geo-primary truncate">{artifact.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy"
          >
            <Copy size={16} className={copied ? 'text-geo-success' : 'text-geo-text-light'} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download"
          >
            <Download size={16} className="text-geo-text-light" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X size={16} className="text-geo-text-light" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {renderContent()}
      </div>

      {/* Footer with type badge */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-geo-accent-100 text-geo-accent-700 text-xs font-medium rounded">
            {artifact.type}
          </span>
          {artifact.language && (
            <span className="px-2 py-1 bg-geo-primary-100 text-geo-primary-700 text-xs font-medium rounded">
              {artifact.language}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Simple markdown to HTML converter for basic rendering
function markdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-geo-accent hover:underline">$1</a>')
    // Code inline
    .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    // Unordered lists
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    // Tables (basic)
    .replace(/\|(.+)\|/gim, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c.trim()))) {
        return '' // Skip separator row
      }
      const cellHtml = cells.map(c => `<td class="border px-3 py-2">${c.trim()}</td>`).join('')
      return `<tr>${cellHtml}</tr>`
    })
    // Paragraphs
    .replace(/\n\n/gim, '</p><p class="mb-3">')
    // Line breaks
    .replace(/\n/gim, '<br>')
}
