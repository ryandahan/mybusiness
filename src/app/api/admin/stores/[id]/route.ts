import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Define an extended type that includes documentKey
interface EnhancedStore {
  documentKey?: string;
  [key: string]: any; // This allows any other properties from the original store
}

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
    const id = params.id;
    
    // Try to find in Store first
    const store = await prisma.store.findUnique({
      where: { id }
    });
    
    if (store) {
      // Process store record
      const enhancedStore: any = { ...store, isStoreTip: false };
      
      if (store.verificationDocUrl) {
        try {
          const url = new URL(store.verificationDocUrl);
          const pathParts = url.pathname.split('/');
          const documentKey = pathParts[pathParts.length - 1];
          enhancedStore.documentKey = documentKey;
        } catch (err) {}
      }
      
      return NextResponse.json(enhancedStore);
    }
    
    // If not in Store, check StoreTip
    const storeTip = await prisma.storeTip.findUnique({
      where: { id }
    });
    
    if (storeTip) {
      const enhancedTip = {
        ...storeTip,
        isStoreTip: true
      };
      
      return NextResponse.json(enhancedTip);
    }
    
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching record details:', error);
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