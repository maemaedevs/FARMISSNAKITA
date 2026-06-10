import fs from 'fs';
import path from 'path';

import multer from 'multer';

const AVATAR_DIR = path.join(process.cwd(), 'uploads', 'avatars');

fs.mkdirSync(AVATAR_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    default:
      return '.jpg';
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    const farmerId = req.auth?.sub ?? 'unknown';
    const fromName = path.extname(file.originalname).toLowerCase();
    const ext = ALLOWED_EXTENSIONS.has(fromName)
      ? fromName
      : extensionForMime(file.mimetype);
    cb(null, `${farmerId}${ext}`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  },
});

export function avatarPublicPath(filename: string): string {
  return `/uploads/avatars/${filename}`;
}

export function avatarAbsolutePath(filename: string): string {
  return path.join(AVATAR_DIR, filename);
}

export function removeAvatarFilesForFarmer(farmerId: string, keepFilename?: string) {
  for (const entry of fs.readdirSync(AVATAR_DIR)) {
    if (!entry.startsWith(farmerId)) continue;
    if (keepFilename && entry === keepFilename) continue;
    fs.unlinkSync(path.join(AVATAR_DIR, entry));
  }
}

const LAND_DOC_DIR = path.join(process.cwd(), 'uploads', 'land-documents');

fs.mkdirSync(LAND_DOC_DIR, { recursive: true });

const LAND_DOC_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);
const LAND_DOC_MIMES = new Set(['image/jpeg', 'image/png', 'application/pdf']);

function extensionForLandDocument(mime: string, originalName: string): string {
  const fromName = path.extname(originalName).toLowerCase();
  if (LAND_DOC_EXTENSIONS.has(fromName)) return fromName;

  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'application/pdf':
      return '.pdf';
    default:
      return '.bin';
  }
}

const landDocumentStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const rawId = req.params.id;
    const farmerId = Array.isArray(rawId) ? rawId[0] : rawId ?? 'unknown';
    const dir = path.join(LAND_DOC_DIR, farmerId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = extensionForLandDocument(file.mimetype, file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

export const landDocumentUpload = multer({
  storage: landDocumentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (LAND_DOC_MIMES.has(file.mimetype) || LAND_DOC_EXTENSIONS.has(ext)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only JPEG, PNG, or PDF files are allowed'));
  },
});

export function landDocumentPublicPath(farmerId: string, filename: string): string {
  return `/uploads/land-documents/${farmerId}/${filename}`;
}
