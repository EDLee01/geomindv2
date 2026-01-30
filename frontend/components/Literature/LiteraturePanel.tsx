'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search, ExternalLink, BookOpen, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { searchLiterature, LiteratureSearchResult, Paper } from '@/lib/api'

interface LiteraturePanelProps {
  onClose: () => void
}

export function LiteraturePanel({ onClose }: LiteraturePanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LiteratureSearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set())

  // Filters
  const [yearFrom, setYearFrom] = useState<number | undefined>()
  const [yearTo, setYearTo] = useState<number | undefined>()
  const [minCitations, setMinCitations] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState<'relevance' | 'citations' | 'year'>('relevance')

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await searchLiterature(query, 15, yearFrom, yearTo, minCitations)

      // Sort results if needed
      if (sortBy === 'citations') {
        result.papers.sort((a, b) => b.citations - a.citations)
      } else if (sortBy === 'year') {
        result.papers.sort((a, b) => (b.year || 0) - (a.year || 0))
      }

      setResults(result)
    } catch (err) {
      setError('Failed to search literature. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [query, yearFrom, yearTo, minCitations, sortBy])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const togglePaperSelection = (paperId: string) => {
    setSelectedPapers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(paperId)) {
        newSet.delete(paperId)
      } else {
        newSet.add(paperId)
      }
      return newSet
    })
  }

  const clearSelection = () => {
    setSelectedPapers(new Set())
  }

  return (
    <div className="w-96 border-l border-slate-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" />
          <span className="font-medium text-slate-800">Literature Search</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search papers..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-3 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
        >
          <Filter size={14} />
          <span>Filters</span>
          {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-3 p-3 bg-slate-50 rounded-lg">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-slate-500">Year From</label>
                <input
                  type="number"
                  value={yearFrom || ''}
                  onChange={(e) => setYearFrom(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="2020"
                  className="w-full mt-1 px-2 py-1 text-sm border border-slate-200 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500">Year To</label>
                <input
                  type="number"
                  value={yearTo || ''}
                  onChange={(e) => setYearTo(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="2024"
                  className="w-full mt-1 px-2 py-1 text-sm border border-slate-200 rounded"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Min Citations</label>
              <input
                type="number"
                value={minCitations || ''}
                onChange={(e) => setMinCitations(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="10"
                className="w-full mt-1 px-2 py-1 text-sm border border-slate-200 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full mt-1 px-2 py-1 text-sm border border-slate-200 rounded"
              >
                <option value="relevance">Relevance</option>
                <option value="citations">Citations</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {results && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-600">
                Found {results.total} papers
              </span>
            </div>

            <div className="space-y-3">
              {results.papers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  isSelected={selectedPapers.has(paper.id)}
                  onToggleSelect={() => togglePaperSelection(paper.id)}
                />
              ))}
            </div>
          </div>
        )}

        {!results && !isLoading && !error && (
          <div className="p-8 text-center text-slate-500">
            <Search size={48} className="mx-auto mb-4 text-slate-300" />
            <p>Search for scientific papers</p>
            <p className="text-sm mt-2">
              Enter keywords like "water quality monitoring" or "river dissolved oxygen"
            </p>
          </div>
        )}
      </div>

      {/* Selection Footer */}
      {selectedPapers.size > 0 && (
        <div className="p-4 border-t border-slate-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedPapers.size} paper(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearSelection}
                className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800"
              >
                Clear
              </button>
              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add to Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface PaperCardProps {
  paper: Paper
  isSelected: boolean
  onToggleSelect: () => void
}

function PaperCard({ paper, isSelected, onToggleSelect }: PaperCardProps) {
  const [showAbstract, setShowAbstract] = useState(false)

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        isSelected
          ? 'border-blue-300 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 rounded border-slate-300"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-800 line-clamp-2">
            {paper.title}
          </h4>
          <p className="text-xs text-slate-600 mt-1">
            {paper.author_display} ({paper.year})
          </p>
          <p className="text-xs text-slate-500">
            {paper.journal} | Citations: {paper.citations}
          </p>

          {/* Score indicator */}
          {paper.score && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-emerald-600 font-medium">
                {Math.round(paper.score * 100)}% match
              </span>
            </div>
          )}

          {/* Abstract toggle */}
          {paper.abstract && (
            <button
              onClick={() => setShowAbstract(!showAbstract)}
              className="text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              {showAbstract ? 'Hide abstract' : 'Show abstract'}
            </button>
          )}

          {showAbstract && paper.abstract && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-4">
              {paper.abstract}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {paper.openalex_url && (
              <a
                href={paper.openalex_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <ExternalLink size={12} />
                <span>DOI</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
