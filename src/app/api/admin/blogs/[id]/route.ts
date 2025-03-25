import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch a single blog for editing
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Await the params
  const resolvedParams = await params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const blog = await prisma.blog.findUnique({
      where: { id: resolvedParams.id }
    });
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

// PUT - Update a blog
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Await the params
  const resolvedParams = await params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, slug, content, imageUrl, published } = await req.json();
    
    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug and content are required' }, { status: 400 });
    }
    
    // Check if slug is unique (excluding current blog)
    const existingBlog = await prisma.blog.findFirst({
      where: { 
        slug, 
        id: { not: resolvedParams.id }
      }
    });
    
    if (existingBlog) {
      return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
    }
    
    const blog = await prisma.blog.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        slug,
        content,
        imageUrl,
        published: published || false
      }
    });
    
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE - Delete a blog
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Await the params
  const resolvedParams = await params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await prisma.blog.delete({
      where: { id: resolvedParams.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}