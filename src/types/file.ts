export interface FileListItem {
  id: string;
  original_name: string | null;
  extension: string | null;
  mime_type: string | null;
  size: number | null;
  uploaded_at: Date | null;
  updated_at: Date | null;
}

export interface FileMeta {
  id: string;
  originalName: string;
  extension: string | null;
  mimeType: string | null;
  size: number | null;
  uploadedAt: Date | null;
  updatedAt: Date | null;
}
