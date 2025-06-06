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
    
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    // Check if it's a StoreTip first
    const storeTip = await prisma.storeTip.findUnique({
      where: { id },
      include: { images: true } // Include related images
    });
    
    if (storeTip) {
      // Extract the discount value safely
      let discountValue = 10; // Default value
      if (typeof storeTip.discountPercentage === 'number') {
        discountValue = storeTip.discountPercentage;
      }
      
      // Parse promotionEndDate from notes if needed
      let promotionEndDate = storeTip.promotionEndDate;
      let specialOffers = null;
      let openingDate = null;
      
      if (storeTip.notes) {
        try {
          const notesData = JSON.parse(storeTip.notes);
          if (!promotionEndDate && notesData.promotionEndDate) {
            promotionEndDate = new Date(notesData.promotionEndDate);
          }
          if (notesData.specialOffers) {
            specialOffers = notesData.specialOffers;
          }
          if (notesData.openingDate) {
            openingDate = new Date(notesData.openingDate);
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
      
      // Create new store from tip
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
          website: storeTip.website,
          closingDate: storeTip.storeType === 'closing' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
          openingDate: openingDate,
          promotionEndDate: promotionEndDate,
          discountPercentage: discountValue,
          specialOffers: specialOffers,
          inventoryDescription: 'Submitted via tip from shopper',
          ownerName: 'Unknown (Shopper Tip)',
          contactPreference: 'email',
          storeImageUrl: storeTip.storeImageUrl,
          latitude: storeTip.latitude,
          longitude: storeTip.longitude,
          isApproved: true,
          storeType: storeTip.storeType || 'closing',
          isOnlineStore: storeTip.isOnlineStore || false
        }
      });

      // Transfer images if they exist
      if (storeTip.images && storeTip.images.length > 0) {
        for (const image of storeTip.images) {
          await prisma.storeImage.create({
            data: {
              url: image.url,
              storeId: newStore.id
            }
          });
        }
      }
      
      // Delete the tip and its images (cascade should handle this automatically)
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