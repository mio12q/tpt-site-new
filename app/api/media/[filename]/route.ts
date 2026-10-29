import { NextRequest, NextResponse } from 'next/server';
import {
  isValidUploadedImageFilename,
  verifyImageAssetToken,
} from '@/lib/security';
import { readStoredWebpUpload } from '@/lib/security/image-processor';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!isValidUploadedImageFilename(filename)) {
    return NextResponse.json(
      { error: 'Invalid media asset identifier.' },
      { status: 400 }
    );
  }

  const sig = req.nextUrl.searchParams.get('sig') || '';
  if (!verifyImageAssetToken(filename, sig)) {
    return NextResponse.json(
      { error: 'Forbidden: Missing or invalid cryptographic media signature.' },
      { status: 403 }
    );
  }

  const fileBuffer = readStoredWebpUpload(filename);
  if (!fileBuffer) {
    return NextResponse.json(
      { error: 'Media asset not found.' },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(fileBuffer.byteLength),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=3600, immutable',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; sandbox",
    },
  });
}
