import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get status parameter from URL (pending or approved)
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    
    // Set isApproved filter based on status
    const isApproved = status === 'approved';
    
    // Get current date for filtering expired stores
    const currentDate = new Date();
    
    // Build where clause for stores
    const storeWhereClause: any = {
      isApproved
    };
    
    // Only filter expired stores for approved stores view
    if (isApproved) {
      storeWhereClause.OR = [
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
      ];
    }
    
    // Fetch stores from database based on approval status
    const stores = await prisma.store.findMany({
      where: storeWhereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        businessName: true,
        category: true,
        city: true,
        state: true,
        storeType: true,
        closingDate: true,
        openingDate: true,
        promotionEndDate: true,
        isOnlineStore: true,
        website: true,
        discountPercentage: true,
        isApproved: true,
        isFeatured: true,
        createdAt: true
      }
    });
    
    // Add source to stores and ensure storeType is 'online' for online stores
    const storesWithSource = stores.map(store => ({
      ...store,
      // Normalize storeType for online stores
      storeType: store.isOnlineStore ? 'online' : (store.storeType || 'closing'),
      source: 'owner'
    }));
    
    // Also fetch pending store tips
    const storeTips = status === 'pending' ? await prisma.storeTip.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        storeName: true,
        category: true,
        city: true,
        state: true,
        submitterEmail: true,
        storeType: true,
        discountPercentage: true,
        promotionEndDate: true,
        isOnlineStore: true,
        website: true,
        createdAt: true,
        notes: true  // Include notes to parse promotionEndDate
      }
    }) : [];
    
    // Format store tips to match store format for frontend
    const formattedTips = storeTips.map(tip => {
      // Parse promotionEndDate from notes if it exists
      let promotionEndDate = tip.promotionEndDate;
      if (!promotionEndDate && tip.notes) {
        try {
          const notesData = JSON.parse(tip.notes);
          if (notesData.promotionEndDate) {
            promotionEndDate = new Date(notesData.promotionEndDate);
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
      
      return {
        id: tip.id,
        businessName: tip.storeName,
        category: tip.category,
        city: tip.city,
        state: tip.state,
        // Normalize storeType for online stores
        storeType: tip.isOnlineStore ? 'online' : (tip.storeType || 'closing'),
        openingDate: null,
        closingDate: null,
        promotionEndDate: promotionEndDate,
        isOnlineStore: tip.isOnlineStore,
        website: tip.website,
        discountPercentage: tip.discountPercentage,
        isApproved: false,
        isFeatured: false,
        createdAt: tip.createdAt,
        source: 'shopper'
      };
    });
    
    // Combine both data sets
    const combinedResults = [...storesWithSource, ...formattedTips];
    
    return NextResponse.json(combinedResults);
  } catch (error) {
    console.error('Error fetching stores for admin:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}