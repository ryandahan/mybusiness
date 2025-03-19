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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = params.id;
    
    // Try to find in StoreTip
    let storeTip = await prisma.storeTip.findUnique({
      where: { id }
    });
    
    if (storeTip) {
      // Delete from StoreTip
      await prisma.storeTip.delete({
        where: { id }
      });
    } else {
      // Delete from Store
      await prisma.store.delete({
        where: { id }
      });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error rejecting record:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}