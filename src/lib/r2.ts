import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_BUCKET_NAME || 'warden-uploads';
const publicUrlBase = process.env.CLOUDFLARE_PUBLIC_URL || 'https://pub-placeholder.r2.dev';

export function isR2Configured(): boolean {
  return Boolean(
    accountId &&
    accessKeyId &&
    secretAccessKey &&
    !accountId.includes('placeholder') &&
    !accountId.includes('your-account-id')
  );
}

export function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId || 'placeholder'}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId || 'placeholder',
      secretAccessKey: secretAccessKey || 'placeholder',
    },
  });
}

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Generates a pre-signed PUT URL for direct client-to-R2 upload
 */
export async function getPresignedUploadUrl(
  folder: 'avatars' | 'proofs',
  filename: string,
  contentType: string
): Promise<PresignedUrlResult> {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueKey = `${folder}/${Date.now()}-${sanitizedFilename}`;

  // If R2 is not fully configured, return a deterministic simulation for local dev
  if (!isR2Configured()) {
    return {
      uploadUrl: '',
      publicUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      key: uniqueKey,
    };
  }

  const s3 = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${uniqueKey}`;

  return {
    uploadUrl,
    publicUrl,
    key: uniqueKey,
  };
}
