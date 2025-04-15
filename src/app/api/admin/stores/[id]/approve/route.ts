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
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get ID from context and ensure it exists - now with await
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    // Check if it's a StoreTip first
    const storeTip = await prisma.storeTip.findUnique({
      where: { id }
    });
    
    if (storeTip) {
      // Extract the discount value safely
      let discountValue = 10; // Default value
      if (typeof storeTip.discountPercentage === 'number') {
        discountValue = storeTip.discountPercentage;
      }
      
      // Create new store from tip - without using storeType field
      const newStore = await prisma.store.create({
        data: {
          businessName: storeTip.storeName,
          category: storeTip.category,
          address: storeTip.address,
          city: storeTip.city,
          state: storeTip.state,
          zipCode: storeTip.zipCode,
          phone: 'N/A',
          email: storeTip.submitterEmail,
          closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          discountPercentage: discountValue,
          inventoryDescription: 'Submitted via tip from shopper',
          ownerName: 'Unknown (Shopper Tip)',
          contactPreference: 'email',
          storeImageUrl: storeTip.storeImageUrl,
          latitude: storeTip.latitude,
          longitude: storeTip.longitude,
          isApproved: true
        }
      });
      
      // Delete the tip
      await prisma.storeTip.delete({
        where: { id }
      });
      
      return NextResponse.json(newStore);
    } else {
      // Regular store approval
      const updatedStore = await prisma.store.update({
        where: { id },
        data: { isApproved: true }
      });
      
      return NextResponse.json(updatedStore);
    }
  } catch (error) {
    console.error('Error approving record:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}