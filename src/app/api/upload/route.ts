import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPresignedUploadUrl } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { filename, contentType, folder } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and contentType are required' },
        { status: 400 }
      );
    }

    // Verify MIME type is an image or PDF
    if (!contentType.startsWith('image/') && contentType !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only image files or PDFs are allowed' },
        { status: 400 }
      );
    }

    const validFolders = ['proofs', 'bills', 'books', 'avatars'];
    const targetFolder = validFolders.includes(folder) ? folder : 'uploads';
    const result = await getPresignedUploadUrl(targetFolder, filename, contentType);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error generating pre-signed upload URL:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate upload URL';
    const isUnconfigured = message.includes('R2_NOT_CONFIGURED') || message.includes('not configured');
    return NextResponse.json(
      { error: isUnconfigured ? 'File storage is not configured.' : message },
      { status: isUnconfigured ? 503 : 500 }
    );
  }
}
