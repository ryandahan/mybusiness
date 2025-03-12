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
    
    // Update store to approved status
    const updatedStore = await prisma.store.update({
      where: { id: params.id },
      data: { isApproved: true }
    });
    
    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('Error approving store:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}