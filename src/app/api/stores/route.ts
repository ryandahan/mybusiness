import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGeocode } from '@/lib/geocoding';
import { uploadFile } from '@/lib/storage';

// Use PrismaClient as a singleton to prevent too many connections
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse form data
    const formData = await req.formData();
    const businessName = formData.get('businessName') as string;
    const category = formData.get('category') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zipCode = formData.get('zipCode') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const website = formData.get('website') as string || null;
    const storeType = formData.get('storeType') as 'opening' | 'closing';
    const inventoryDescription = formData.get('inventoryDescription') as string;
    const reasonForClosing = formData.get('reasonForTransition') as string || null; // Changed field name here
    const ownerName = formData.get('ownerName') as string;
    const contactPreference = formData.get('contactPreference') as string;
    
    // Handle multiple file uploads
    // Get all files with the 'storeImages' name
    const storeImages: File[] = [];
    formData.getAll('storeImages').forEach(item => {
      if (item instanceof File) {
        storeImages.push(item);
      }
    });
    
    // Keep the single file upload for backward compatibility
    const singleStoreImage = formData.get('storeImage');
    if (singleStoreImage instanceof File) {
      storeImages.push(singleStoreImage);
    }
    
    const verificationDoc = formData.get('verificationDocuments') as File;
    
    let storeImageUrl = null;
    let verificationDocUrl = null;
    const uploadedImageUrls: string[] = [];
    
    // Upload all store images
    for (const image of storeImages) {
      const imageUrl = await uploadFile(image, 'store-images');
      uploadedImageUrls.push(imageUrl);
    }
    
    // For backward compatibility, set the main storeImageUrl to the first image if available
    if (uploadedImageUrls.length > 0) {
      storeImageUrl = uploadedImageUrls[0];
    }
    
    if (verificationDoc) {
      verificationDocUrl = await uploadFile(verificationDoc, 'verification-docs');
    }
    
    // Get coordinates from address
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    const { latitude, longitude } = await getGeocode(fullAddress);
    
    // Create the data object with required fields
    const storeData: any = {
      businessName,
      category,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      website,
      storeType,
      inventoryDescription,
      reasonForClosing, // Changed from reasonForTransition
      ownerName,
      contactPreference,
      storeImageUrl,
      verificationDocUrl,
      latitude,
      longitude,
      userId: session.user.id,
    };
    
    // Add type-specific fields
    if (storeType === 'closing') {
      const closingDateStr = formData.get('closingDate') as string;
      const discountStr = formData.get('discountPercentage') as string;
      
      if (closingDateStr) {
        storeData.closingDate = new Date(closingDateStr);
      }
      
      if (discountStr) {
        storeData.discountPercentage = parseInt(discountStr);
      }
    } else if (storeType === 'opening') {
      const openingDateStr = formData.get('openingDate') as string;
      const specialOffers = formData.get('specialOffers') as string;
      
      if (openingDateStr) {
        storeData.openingDate = new Date(openingDateStr);
      }
      
      if (specialOffers) {
        storeData.specialOffers = specialOffers;
      }
    }
    
    // Create store in database with related images
    const store = await prisma.store.create({
      data: {
        ...storeData,
        images: {
          create: uploadedImageUrls.map(url => ({
            url: url
          }))
        }
      },
      include: {
        images: true // Include images in the response
      }
    });
    
    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Handle filtering params
    const storeType = searchParams.get('storeType');
    const category = searchParams.get('category');
    const minDiscount = searchParams.get('minDiscount') ? parseInt(searchParams.get('minDiscount')!) : undefined;
    const closingBefore = searchParams.get('closingBefore') ? new Date(searchParams.get('closingBefore')!) : undefined;
    const openingBefore = searchParams.get('openingBefore') ? new Date(searchParams.get('openingBefore')!) : undefined;
    
    // Build where clause
    const whereClause: any = {
      isApproved: true,
    };
    
    // Filter by store type
    if (storeType && storeType !== 'all') {
      whereClause.storeType = storeType;
    }
    
    // Filter by category
    if (category && category !== 'All Categories') {
      whereClause.category = category;
    }
    
    // Filter by discount (only for closing stores)
    if (minDiscount) {
      if (storeType === 'closing') {
        whereClause.discountPercentage = { gte: minDiscount };
      } else if (storeType === 'all' || !storeType) {
        whereClause.AND = [
          {
            OR: [
              { storeType: 'closing', discountPercentage: { gte: minDiscount } },
              { storeType: 'opening' }
            ]
          }
        ];
      }
    }
    
    // Filter by dates
    if (closingBefore) {
      if (storeType === 'closing' || storeType === 'all' || !storeType) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          OR: [
            { storeType: 'closing', closingDate: { lte: closingBefore } },
            { storeType: 'opening' }
          ]
        });
      }
    }
    
    if (openingBefore) {
      if (storeType === 'opening' || storeType === 'all' || !storeType) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          OR: [
            { storeType: 'opening', openingDate: { lte: openingBefore } },
            { storeType: 'closing' }
          ]
        });
      }
    }
    
    // Query for stores with filters - including related images
    const stores = await prisma.store.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        images: true // Include the related images
      }
    });
    
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}