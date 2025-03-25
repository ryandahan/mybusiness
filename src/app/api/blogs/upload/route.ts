// /app/api/blogs/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Configure AWS S3 with your specific credentials
const s3Client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: "AKIAVY2PG5G5KJLNR7T6",
    secretAccessKey: "GMUAr4q0uYcCtVhGqCokZIYLyBa1GOIf3pc4pRmy"
  }
});

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
    const contentType = file.type;
    const fileName = `blog-images/${uuidv4()}.${fileExtension}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: "store-transition",
      Key: fileName,
      Body: buffer,
      ContentType: contentType
    });

    await s3Client.send(command);
    const imageUrl = `https://store-transition.s3.us-east-2.amazonaws.com/${fileName}`;

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}