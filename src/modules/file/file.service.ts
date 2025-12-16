import path from "path";
import fs from "fs/promises";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "../../db/index";
import { config } from "../../config";
import { FileListItem, FileMeta } from "../../types/file";

export async function uploadFile(
  file: Express.Multer.File,
  fileUuid?: string
): Promise<{
  id: string;
  name: string;
  extension: string;
  mime_type: string;
  size: number;
  uploaded_at: Date;
}> {
  const extension = path.extname(file.originalname).replace(".", "");
  const newId = fileUuid;
  if (!newId) {
    throw Object.assign(new Error("File id missing"), { status: 500 });
  }

  await db
    .insert(schema.files)
    .values({
      id: newId,
      originalName: file.originalname,
      extension,
      mimeType: file.mimetype,
      size: file.size,
    })
    .execute();

  return {
    id: newId,
    name: file.originalname,
    extension,
    mime_type: file.mimetype,
    size: file.size,
    uploaded_at: new Date(),
  };
}

export async function listFiles(
  listSize: number,
  offset: number
): Promise<{
  files: FileListItem[];
  total: number;
}> {
  const files = await db
    .select({
      id: schema.files.id,
      original_name: schema.files.originalName,
      extension: schema.files.extension,
      mime_type: schema.files.mimeType,
      size: schema.files.size,
      uploaded_at: schema.files.uploadedAt,
      updated_at: schema.files.updatedAt,
    })
    .from(schema.files)
    .orderBy(desc(schema.files.uploadedAt))
    .limit(listSize)
    .offset(offset);

  const [{ total }] =
    (await db
      .select({ total: sql`COUNT(*)`.as("total") })
      .from(schema.files)) || [];
  const totalNumber = Number(total) || 0;

  return { files, total: totalNumber };
}

export async function findFile(fileId: string): Promise<FileMeta | null> {
  const file = await db.query.files.findFirst({
    columns: {
      id: true,
      originalName: true,
      extension: true,
      mimeType: true,
      size: true,
      uploadedAt: true,
      updatedAt: true,
    },
    where: eq(schema.files.id, fileId),
  });
  return file ?? null;
}

export async function deleteFile(fileId: string): Promise<void> {
  const fileRow = await db.query.files.findFirst({
    columns: { id: true, extension: true },
    where: eq(schema.files.id, fileId),
  });

  if (!fileRow) {
    const error = Object.assign(new Error("File not found"), { status: 404 });
    throw error;
  }

  const filePath = path.join(
    config.uploadsDir,
    fileRow.extension ? `${fileRow.id}.${fileRow.extension}` : fileRow.id
  );
  await db.delete(schema.files).where(eq(schema.files.id, fileId));
  await fs.unlink(filePath).catch(() => {});
}

export async function updateFile(
  fileId: string,
  file: Express.Multer.File
): Promise<void> {
  const newUploadPath = path.isAbsolute(file.path)
    ? file.path
    : path.join(config.uploadsDir, file.filename);

  const existing = await db.query.files.findFirst({
    columns: { id: true, extension: true },
    where: eq(schema.files.id, fileId),
  });

  if (!existing) {
    await fs.unlink(newUploadPath).catch(() => {});
    const error = Object.assign(new Error("File not found"), { status: 404 });
    throw error;
  }

  const extension = path.extname(file.originalname).replace(".", "");
  const newPath = path.join(
    config.uploadsDir,
    extension ? `${fileId}.${extension}` : fileId
  );
  const oldPath = path.join(
    config.uploadsDir,
    existing.extension ? `${existing.id}.${existing.extension}` : existing.id
  );

  await db
    .update(schema.files)
    .set({
      originalName: file.originalname,
      extension,
      mimeType: file.mimetype,
      size: file.size,
    })
    .where(eq(schema.files.id, fileId));

  if (oldPath !== newPath) {
    await fs.unlink(oldPath).catch(() => {});
  }
}

export function buildDownloadPath(storedName: string): string {
  return path.join(config.uploadsDir, storedName);
}
