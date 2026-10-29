import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  MAX_IMAGE_UPLOAD_BYTES,
  verifyImageMagicBytes,
  generateRandomWebpFilename,
  isValidUploadedImageFilename,
  signImageAssetToken,
  type AllowedImageMagicFormat,
} from './index';

export const CMS_UPLOADS_DIR = path.join(process.cwd(), '.cms-uploads');

export interface ProcessedWebpImage {
  webpBuffer: Buffer;
  width: number;
  height: number;
  detectedFormat: AllowedImageMagicFormat;
}

/**
 * Verifies raw magic bytes, strips all EXIF / GPS / IPTC / XMP metadata,
 * normalizes orientation, and re-encodes the image from scratch to WebP.
 */
export async function sanitizeAndReencodeToWebp(
  inputBuffer: Buffer
): Promise<ProcessedWebpImage> {
  if (!inputBuffer || inputBuffer.byteLength === 0) {
    throw new Error('Uploaded image buffer is empty.');
  }

  if (inputBuffer.byteLength > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(
      `Image exceeds the maximum allowed upload size of ${MAX_IMAGE_UPLOAD_BYTES} bytes (5 MB).`
    );
  }

  const magicCheck = verifyImageMagicBytes(inputBuffer);
  if (!magicCheck.valid || !magicCheck.detectedFormat) {
    throw new Error(magicCheck.error || 'Invalid image binary signature.');
  }

  // sharp strips all EXIF, XMP, IPTC, and ICC metadata by default when .withMetadata() is omitted.
  // .rotate() auto-orients pixels based on any EXIF orientation tag before stripping the tag.
  const { data, info } = await sharp(inputBuffer, {
    failOn: 'error',
    limitInputPixels: 4096 * 4096,
  })
    .rotate()
    .webp({ quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    webpBuffer: data,
    width: info.width,
    height: info.height,
    detectedFormat: magicCheck.detectedFormat,
  };
}

export interface StoredSignedImageResult {
  filename: string;
  signedUrl: string;
  byteLength: number;
  width: number;
  height: number;
  detectedFormat: AllowedImageMagicFormat;
}

/**
 * Sanitizes, strips EXIF, re-encodes to WebP, saves under a random 32-char hex filename
 * inside /.cms-uploads (outside /public), and generates an HMAC-signed serving URL.
 */
export async function storeSanitizedWebpUpload(
  inputBuffer: Buffer
): Promise<StoredSignedImageResult> {
  const processed = await sanitizeAndReencodeToWebp(inputBuffer);
  const filename = generateRandomWebpFilename();

  if (!fs.existsSync(CMS_UPLOADS_DIR)) {
    fs.mkdirSync(CMS_UPLOADS_DIR, { recursive: true, mode: 0o700 });
  }

  const targetPath = path.join(CMS_UPLOADS_DIR, filename);
  fs.writeFileSync(targetPath, processed.webpBuffer, { mode: 0o600 });

  const sig = signImageAssetToken(filename);
  const signedUrl = `/api/media/${filename}?sig=${sig}`;

  return {
    filename,
    signedUrl,
    byteLength: processed.webpBuffer.byteLength,
    width: processed.width,
    height: processed.height,
    detectedFormat: processed.detectedFormat,
  };
}

export function readStoredWebpUpload(filename: string): Buffer | null {
  if (!isValidUploadedImageFilename(filename)) {
    return null;
  }
  const targetPath = path.join(CMS_UPLOADS_DIR, filename);
  if (!fs.existsSync(targetPath)) {
    return null;
  }
  return fs.readFileSync(targetPath);
}
