// C:\Users\Raeean\store-transitions\src\app\api\admin\stores\[id]\approve\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient, Prisma } from '@prisma/client';
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
    
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    // Use transaction with REPEATABLE READ isolation
    const result = await prisma.$transaction(async (tx) => {
      // Check if it's a StoreTip first
      const storeTip = await tx.storeTip.findUnique({
        where: { id },
        include: { images: true } // Include related images
      });
      
      if (storeTip) {
        // Extract the discount value safely
        let discountValue = 10; // Default value
        if (typeof storeTip.discountPercentage === 'number') {
          discountValue = storeTip.discountPercentage;
        }
        
        // Create new store from tip
        const newStore = await tx.store.create({
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
            isApproved: true,
            storeType: storeTip.storeType || 'closing'
          }
        });

        // Transfer images if they exist
        if (storeTip.images && storeTip.images.length > 0) {
          for (const image of storeTip.images) {
            await tx.storeImage.create({
              data: {
                url: image.url,
                storeId: newStore.id
              }
            });
          }
        }
        
        // Delete the tip and its images (cascade should handle this automatically)
        await tx.storeTip.delete({
          where: { id }
        });
        
        return newStore;
      } else {
        // Regular store approval
        const updatedStore = await tx.store.update({
          where: { id },
          data: { isApproved: true }
        });
        
        return updatedStore;
      }
    }, {
      // Set REPEATABLE READ isolation level
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error approving record:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}