import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    // Get current date for filtering expired stores
    const currentDate = new Date();
    
    const featuredStores = await prisma.store.findMany({
      where: {
        isFeatured: true,
        isApproved: true,
        // Filter out expired stores
        OR: [
          // For closing stores, only show if closingDate is in the future or null
          {
            storeType: 'closing',
            OR: [
              { closingDate: null },
              { closingDate: { gte: currentDate } }
            ]
          },
          // For online stores, only show if promotionEndDate is in the future or null
          {
            isOnlineStore: true,
            OR: [
              { promotionEndDate: null },
              { promotionEndDate: { gte: currentDate } }
            ]
          },
          // For opening stores, check promotionEndDate if it exists
          {
            storeType: 'opening',
            OR: [
              { promotionEndDate: null },
              { promotionEndDate: { gte: currentDate } }
            ]
          }
        ]
      },
      include: {
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map the response to include the images array
    const mappedStores = featuredStores.map(store => ({
      ...store,
      storeImages: store.images.map(img => img.url)
    }));

    return NextResponse.json(mappedStores);
  } catch (error) {
    console.error('Error fetching featured stores:', error);
    return NextResponse.json({ error: 'Failed to fetch featured stores' }, { status: 500 });
  }
}