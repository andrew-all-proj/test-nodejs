import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as fileService from './file.service';
import { ensureFileProvided, parsePagination } from './file.validation';
import { FileListResponse, FileMetaResponse, FileUploadResponse, MessageResponse } from '../../types/responses';

export async function uploadFileController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response<FileUploadResponse> | void> {
  try {
    ensureFileProvided(req.file);
    const payload = await fileService.uploadFile(req.file!, req.fileUuid);
    const body: FileUploadResponse = payload;
    return res.status(201).json(body);
  } catch (err) {
    return next(err);
  }
}

export async function listFilesController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response<FileListResponse> | void> {
  try {
    const { listSize, page } = parsePagination(
      req.query.list_size as string,
      req.query.page as string
    );
    const offset = (page - 1) * listSize;
    const { files, total } = await fileService.listFiles(listSize, offset);
    const body: FileListResponse = {
      page,
      page_size: listSize,
      total,
      data: files
    };
    return res.json(body);
  } catch (err) {
    return next(err);
  }
}

export async function downloadFileController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const fileId = req.params.id;
    const fileRow = await fileService.findFile(fileId);
    if (!fileRow) {
      return res.status(404).json({ error: 'File not found' });
    }
    const storedName = fileRow.extension ? `${fileRow.id}.${fileRow.extension}` : fileRow.id;
    const filePath = fileService.buildDownloadPath(storedName);
    return res.download(filePath, fileRow.originalName, err => {
      if (err) return next(err);
    });
  } catch (err) {
    return next(err);
  }
}

export async function deleteFileController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response<MessageResponse> | void> {
  try {
    const fileId = req.params.id;
    await fileService.deleteFile(fileId);
    const body: MessageResponse = { message: 'File deleted' };
    return res.json(body);
  } catch (err) {
    return next(err);
  }
}

export async function updateFileController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response<MessageResponse> | void> {
  try {
    ensureFileProvided(req.file);
    const fileId = req.params.id;
    await fileService.updateFile(fileId, req.file!);
    const body: MessageResponse = { message: 'File updated' };
    return res.json(body);
  } catch (err) {
    return next(err);
  }
}

export async function getFileController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response<FileMetaResponse> | void> {
  try {
    const fileId = req.params.id;
    const fileRow = await fileService.findFile(fileId);
    if (!fileRow) {
      return res.status(404).json({ error: 'File not found' });
    }
    const body: FileMetaResponse = fileRow;
    return res.json(body);
  } catch (err) {
    return next(err);
  }
}
