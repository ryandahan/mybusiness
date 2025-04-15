import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Await the params
    const params = await context.params;
    const id = params.id;
    
    const store = await prisma.store.findUnique({
      where: { id }
    });
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    // Define update data with conditional storeType assignment
    const updateData: any = {
      isFeatured: !store.isFeatured
    };
    
    // If featuring the store and storeType is missing, set a default
    if (!store.isFeatured && !store.storeType) {
      updateData.storeType = 'closing';
    }
    
    // Update the store
    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}