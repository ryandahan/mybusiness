import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    const storeId = params.id;
    
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    return NextResponse.json(store);
  } catch (error) {
    console.error('Error fetching store details:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    const storeId = params.id;
    
    await prisma.store.delete({
      where: { id: storeId }
    });
    
    return new NextResponse(null, { status: 204 });
  }
  catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}