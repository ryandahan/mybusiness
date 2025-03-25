import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth'; // Correct the import path for authOptions

const prisma = new PrismaClient();

// GET - Fetch all blogs for admin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST - Create new blog
export async function POST(req: NextRequest) {
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
    
    // Check if slug is unique
    const existingBlog = await prisma.blog.findUnique({ where: { slug } });
    if (existingBlog) {
      return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
    }
    
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        imageUrl,
        published: published || false,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}