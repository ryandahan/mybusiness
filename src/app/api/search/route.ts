import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = query.trim().toLowerCase();
    const currentDate = new Date();

    // Search through approved stores
    const stores = await prisma.store.findMany({
      where: {
        isApproved: true,
        // Filter out expired stores
        AND: [
          {
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
          }
        ],
        OR: [
          // Search by business name
          {
            businessName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // Search by category
          {
            category: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // Search by inventory description (items)
          {
            inventoryDescription: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // Search by special offers
          {
            specialOffers: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // Search by city
          {
            city: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          // Search by state
          {
            state: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        images: true
      },
      take: limit,
      orderBy: [
        // Prioritize featured stores
        { isFeatured: 'desc' },
        // Then by discount percentage for closing stores
        { discountPercentage: 'desc' },
        // Then by creation date
        { createdAt: 'desc' }
      ]
    });

    // Format the results for the frontend
    const searchResults = stores.map(store => ({
      id: store.id,
      businessName: store.businessName,
      category: store.category,
      city: store.city,
      state: store.state,
      storeType: store.storeType,
      discountPercentage: store.discountPercentage,
      closingDate: store.closingDate,
      openingDate: store.openingDate,
      inventoryDescription: store.inventoryDescription,
      specialOffers: store.specialOffers,
      isFeatured: store.isFeatured,
      storeImageUrl: store.storeImageUrl,
      storeImages: store.images.map(img => img.url),
      // Add a relevance score based on what matched
      matchType: getMatchType(store, searchTerm)
    }));

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// Helper function to determine what type of match occurred
function getMatchType(store: any, searchTerm: string): string {
  const term = searchTerm.toLowerCase();
  
  if (store.businessName.toLowerCase().includes(term)) {
    return 'business';
  } else if (store.category.toLowerCase().includes(term)) {
    return 'category';
  } else if (store.inventoryDescription?.toLowerCase().includes(term)) {
    return 'item';
  } else if (store.specialOffers?.toLowerCase().includes(term)) {
    return 'offer';
  } else if (store.city.toLowerCase().includes(term) || store.state.toLowerCase().includes(term)) {
    return 'location';
  }
  
  return 'other';
}