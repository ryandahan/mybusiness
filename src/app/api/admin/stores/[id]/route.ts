import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Define an extended type that includes documentKey
interface EnhancedStore {
  documentKey?: string;
  submitterType?: 'owner' | 'shopper';
  submitterEmail?: string;
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
      const enhancedStore: EnhancedStore = { 
        ...store, 
        isStoreTip: false,
        submitterType: 'owner' 
      };
      
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
      // Debug log to see what's in the storeTip object
      console.log('StoreTip from database:', storeTip);
      
      const enhancedTip: EnhancedStore = {
        ...storeTip,
        isStoreTip: true,
        submitterType: 'shopper',
        // Use the storeTip's submitterEmail as the submitterEmail
        submitterEmail: storeTip.submitterEmail,
        // Convert storeName to businessName for consistency
        businessName: storeTip.storeName,
        // ADDED THIS LINE TO FIX THE ISSUE:
        discountPercentage: storeTip.discountPercentage
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