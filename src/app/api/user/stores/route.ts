import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const stores = await prisma.store.findMany({
      where: { userId: userId },
      include: {
        images: true // Include related images
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching user stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}