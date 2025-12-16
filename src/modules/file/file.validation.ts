import type { Express } from 'express'

export function parsePagination(listSizeRaw?: string, pageRaw?: string) {
  const listSize = Math.max(1, parseInt(listSizeRaw || '', 10) || 10)
  const page = Math.max(1, parseInt(pageRaw || '', 10) || 1)
  return { listSize, page }
}

export function ensureFileProvided(file?: Express.Multer.File) {
  if (!file) {
    const error = Object.assign(new Error('No file uploaded'), { status: 400 })
    throw error
  }
}
