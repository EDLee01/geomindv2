/**
 * GeoMind API Client
 * Handles all communication with the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  content: string
  literature: {
    title: string
    author_display: string
    year: number | null
    journal: string
    openalex_url: string
    score?: number
  }[]
}

export interface Paper {
  id: string
  title: string
  authors: string[]
  author_display: string
  year: number | null
  journal: string
  abstract: string
  citations: number
  score: number
  openalex_url: string
  impact_factor?: number
  cas_zone?: string
  is_top?: boolean
}

export interface LiteratureSearchResult {
  total: number
  query: string
  papers: Paper[]
}

export interface FilePreview {
  rows: number
  columns: number
  column_names: string[]
  head: Record<string, any>[]
  dtypes: Record<string, string>
}

export interface FileUploadResponse {
  id: string
  filename: string
  size: number
  preview: FilePreview
}

// API Functions

/**
 * Send a chat completion request
 */
export async function chatCompletion(
  messages: ChatMessage[],
  searchLiterature: boolean = true,
  fileContext?: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      search_literature: searchLiterature,
      file_context: fileContext,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Chat request failed')
  }

  return response.json()
}

/**
 * Search for scientific literature
 */
export async function searchLiterature(
  query: string,
  limit: number = 15,
  yearFrom?: number,
  yearTo?: number,
  minCitations?: number
): Promise<LiteratureSearchResult> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  })

  if (yearFrom !== undefined) {
    params.append('year_from', yearFrom.toString())
  }
  if (yearTo !== undefined) {
    params.append('year_to', yearTo.toString())
  }
  if (minCitations !== undefined) {
    params.append('min_citations', minCitations.toString())
  }

  const response = await fetch(`${API_BASE_URL}/api/literature/search?${params}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Literature search failed')
  }

  return response.json()
}

/**
 * Upload a file for analysis
 */
export async function uploadFile(file: File): Promise<FileUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'File upload failed')
  }

  return response.json()
}

/**
 * Get file information
 */
export async function getFileInfo(fileId: string): Promise<{
  id: string
  filename: string
  rows: number
  columns: number
  column_names: string[]
  summary: string
}> {
  const response = await fetch(`${API_BASE_URL}/api/files/file/${fileId}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Failed to get file info')
  }

  return response.json()
}

/**
 * Get file summary for AI context
 */
export async function getFileSummary(fileId: string): Promise<{
  id: string
  summary: string
}> {
  const response = await fetch(`${API_BASE_URL}/api/files/file/${fileId}/summary`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Failed to get file summary')
  }

  return response.json()
}

/**
 * Delete an uploaded file
 */
export async function deleteFile(fileId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/files/file/${fileId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Failed to delete file')
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`)

  if (!response.ok) {
    throw new Error('Health check failed')
  }

  return response.json()
}
