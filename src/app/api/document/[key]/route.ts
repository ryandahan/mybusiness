import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    
    console.log('Accessing Supabase file with key:', fullKey);
    
    // Generate a signed URL for the document (expires in 15 minutes)
    const { data, error } = await supabase.storage
      .from('uploads')
      .createSignedUrl(fullKey, 900); // 900 seconds = 15 minutes
    
    if (error) {
      console.error('Error generating signed URL:', error);
      return NextResponse.json({ 
        error: 'Failed to access document',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({ url: data.signedUrl });
  } catch (error) {
    console.error('Error generating document URL:', error);
    return NextResponse.json({ 
      error: 'Failed to access document',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}