// /app/api/blogs/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `blog-images/${uuidv4()}.${fileExtension}`;
    
    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Error uploading file to Supabase:', error);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}