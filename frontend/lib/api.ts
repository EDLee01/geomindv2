/**
 * GeoMind 3.0 API Client
 * Handles all communication with the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ============================================
// Types
// ============================================

// Project types
export interface Project {
  id: string
  name: string
  topic: string | null
  stages: ProjectStages
  memory: ProjectMemory
  created_at: string
  updated_at: string
  chat_count: number
  file_count: number
}

export interface ProjectStages {
  literature: 'pending' | 'in_progress' | 'done'
  gap: 'pending' | 'in_progress' | 'done'
  methodology: 'pending' | 'in_progress' | 'done'
  data_prep: 'pending' | 'in_progress' | 'done'
  execution: 'pending' | 'in_progress' | 'done'
  visualization: 'pending' | 'in_progress' | 'done'
  results: 'pending' | 'in_progress' | 'done'
  discussion: 'pending' | 'in_progress' | 'done'
  references: 'pending' | 'in_progress' | 'done'
  draft: 'pending' | 'in_progress' | 'done'
}

export interface ProjectMemory {
  literature_list: any[]
  gap_selected: string | null
  methodology: any | null
  data_profile: any | null
  results_data: any | null
  figures: any[]
  tables: any[]
  sections: {
    introduction: string | null
    methods: string | null
    results: string | null
    discussion: string | null
  }
}

// Chat types
export interface Chat {
  id: string
  project_id: string | null
  title: string
  chat_type: string
  created_at: string
  updated_at: string
  messages: Message[]
  message_count: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  artifacts: Artifact[]
  created_at: string
}

export interface Artifact {
  id: string
  type: 'markdown' | 'code' | 'image' | 'table' | 'bibtex' | 'references'
  title: string
  content: string
  language?: string
}

// Literature types
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
  doi: string
  impact_factor?: number
  cas_zone?: string
  verified?: boolean
  search_reason?: string
}

export interface LiteratureSearchResult {
  total: number
  query: string
  papers: Paper[]
  verified_count: number
  removed_count: number
  message?: string
}

// File types
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
  file_type: string
  file_size: string
  preview: FilePreview | null
  created_at: string
}

// Legacy types (for compatibility)
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

// ============================================
// Project API
// ============================================

/**
 * Get all projects
 */
export async function getProjects(): Promise<{ projects: Project[], total: number }> {
  const response = await fetch(`${API_BASE_URL}/api/projects`)
  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }
  return response.json()
}

/**
 * Create a new project
 */
export async function createProject(name: string, topic?: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, topic }),
  })
  if (!response.ok) {
    throw new Error('Failed to create project')
  }
  return response.json()
}

/**
 * Get a specific project
 */
export async function getProject(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }
  return response.json()
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update project')
  }
  return response.json()
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete project')
  }
}

/**
 * Get project chats
 */
export async function getProjectChats(projectId: string): Promise<{ chats: Chat[], total: number }> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/chats`)
  if (!response.ok) {
    throw new Error('Failed to fetch project chats')
  }
  return response.json()
}

// ============================================
// Chat API
// ============================================

/**
 * Get all chats (quick chats without project)
 */
export async function getChats(projectId?: string): Promise<{ chats: Chat[], total: number }> {
  const params = projectId ? `?project_id=${projectId}` : ''
  const response = await fetch(`${API_BASE_URL}/api/chats${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch chats')
  }
  return response.json()
}

/**
 * Create a new chat
 */
export async function createChat(projectId?: string, title?: string, chatType?: string): Promise<Chat> {
  const response = await fetch(`${API_BASE_URL}/api/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: projectId,
      title: title || 'New Chat',
      chat_type: chatType || 'general',
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to create chat')
  }
  return response.json()
}

/**
 * Get a specific chat with messages
 */
export async function getChat(chatId: string): Promise<Chat> {
  const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch chat')
  }
  return response.json()
}

/**
 * Delete a chat
 */
export async function deleteChat(chatId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete chat')
  }
}

/**
 * Send a message to a chat
 */
export async function sendMessage(
  chatId: string,
  content: string,
  options?: {
    searchLiterature?: boolean
    fileContext?: string
    projectId?: string
    skills?: string[]
  }
): Promise<{
  user_message: Message
  assistant_message: Message
  literature: any[]
  artifacts: Artifact[]
  intent: string | null
  suggested_skills: string[]
}> {
  const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      search_literature: options?.searchLiterature ?? false,
      file_context: options?.fileContext,
      project_id: options?.projectId,
      skills: options?.skills || [],
    }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Failed to send message')
  }
  return response.json()
}

// ============================================
// Literature API
// ============================================

/**
 * Search for scientific literature
 */
export async function searchLiterature(
  query: string,
  options?: {
    limit?: number
    yearFrom?: number
    yearTo?: number
    minCitations?: number
    autoVerify?: boolean
  }
): Promise<LiteratureSearchResult> {
  const params = new URLSearchParams({
    q: query,
    limit: (options?.limit || 20).toString(),
  })

  if (options?.yearFrom !== undefined) {
    params.append('year_from', options.yearFrom.toString())
  }
  if (options?.yearTo !== undefined) {
    params.append('year_to', options.yearTo.toString())
  }
  if (options?.minCitations !== undefined) {
    params.append('min_citations', options.minCitations.toString())
  }

  const response = await fetch(`${API_BASE_URL}/api/literature/search?${params}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'Literature search failed')
  }

  return response.json()
}

// ============================================
// File API
// ============================================

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

// ============================================
// Legacy API (for compatibility)
// ============================================

/**
 * Send a chat completion request (legacy endpoint)
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

// ============================================
// Utility
// ============================================

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; version: string }> {
  const response = await fetch(`${API_BASE_URL}/health`)

  if (!response.ok) {
    throw new Error('Health check failed')
  }

  return response.json()
}
