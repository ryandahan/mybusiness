import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get key from parameters and do some cleanup
    let key = decodeURIComponent(params.key);
    
    // Remove any file extension from the key
    key = key.replace(/\.pdf$/, '');
    
    // Always add the verification-docs/ prefix and .pdf extension
    const fullKey = `verification-docs/${key}.pdf`;
    
    console.log('Accessing S3 file with key:', fullKey);
    
    const command = new GetObjectCommand({
      Bucket: 'store-transition',
      Key: fullKey
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error generating document URL:', error);
    return NextResponse.json({ 
      error: 'Failed to access document',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}