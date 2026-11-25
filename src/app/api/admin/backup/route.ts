import { NextResponse } from 'next/server';
import { getFullBackupZipBuffer } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const zipBuffer = getFullBackupZipBuffer();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `portfolio-backup-${timestamp}.zip`;

    const uint8Array = new Uint8Array(zipBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate backup archive';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
