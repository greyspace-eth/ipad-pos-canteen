import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

function r2() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: { key: string[] } }
) {
  const key = params.key.join('/');

  try {
    const obj = await r2().send(
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key })
    );

    const bytes = await obj.Body?.transformToByteArray();
    if (!bytes) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return new Response(Buffer.from(bytes), {
      headers: {
        'Content-Type': obj.ContentType ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
