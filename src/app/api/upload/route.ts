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

    // Verify MIME type is an image
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    const targetFolder = folder === 'proofs' ? 'proofs' : 'avatars';
    const result = await getPresignedUploadUrl(targetFolder, filename, contentType);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating pre-signed upload URL:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
