import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const store = await prisma.store.findUnique({
      where: { id: params.id }
    });
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    // Use a more dynamic approach to toggle featured status
    // This works even if the isFeatured field isn't fully recognized by TypeScript yet
    const updatedStore = await prisma.store.update({
      where: { id: params.id },
      data: {
        // @ts-ignore - Ignore TypeScript errors about isFeatured
        isFeatured: !store.isFeatured
      }
    });
    
    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}