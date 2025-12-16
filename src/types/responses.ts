export type TokenResponse = { token: string; refresh_token: string }
export type InfoResponse = { id: string | undefined }
export type MessageResponse = { message: string }
export interface FileUploadResponse {
  id: string
  name: string
  extension: string
  mime_type: string
  size: number
  uploaded_at: Date
}

export interface FileListResponse {
  page: number
  page_size: number
  total: number
  data: import('./file').FileListItem[]
}

export type FileMetaResponse = import('./file').FileMeta
