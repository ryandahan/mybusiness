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
    const storeType = formData.get('storeType') as 'opening' | 'closing' | 'online';
    const inventoryDescription = formData.get('inventoryDescription') as string;
    const reasonForClosing = formData.get('reasonForTransition') as string || null;
    const ownerName = formData.get('ownerName') as string;
    const contactPreference = formData.get('contactPreference') as string;
    
    // NEW: Handle online store flag
    const isOnlineStore = formData.get('isOnlineStore') === 'true' || storeType === 'online';
    
    console.log('[Stores API] Creating store:', { businessName, storeType, isOnlineStore });
    
    // Validation for online vs physical stores
    if (isOnlineStore) {
      // Online store validation
      if (!website) {
        return NextResponse.json({ 
          error: 'Website URL is required for online stores' 
        }, { status: 400 });
      }
      
      // Validate website URL format
      try {
        new URL(website);
      } catch {
        return NextResponse.json({ 
          error: 'Please provide a valid website URL (e.g., https://example.com)' 
        }, { status: 400 });
      }
    } else {
      // Physical store validation
      if (!address || !city || !state || !zipCode) {
        return NextResponse.json({ 
          error: 'Address, city, state, and zip code are required for physical stores' 
        }, { status: 400 });
      }
    }
    
    // Handle multiple file uploads
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
    
    // Handle geocoding - only for physical stores
    let latitude = null;
    let longitude = null;
    
    if (!isOnlineStore && address && city && state && zipCode) {
      try {
        const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
        const geocodeResult = await getGeocode(fullAddress);
        latitude = geocodeResult.latitude;
        longitude = geocodeResult.longitude;
        console.log('[Stores API] Geocoded address:', { fullAddress, latitude, longitude });
      } catch (error) {
        console.warn('[Stores API] Geocoding failed:', error);
        // Continue without coordinates - this is not a fatal error
      }
    }
    
    // Create the data object with required fields
    const storeData: any = {
      businessName,
      category,
      address: isOnlineStore ? null : address,
      city: isOnlineStore ? null : city,
      state: isOnlineStore ? null : state,
      zipCode: isOnlineStore ? null : zipCode,
      phone,
      email,
      website,
      storeType,
      isOnlineStore,
      inventoryDescription,
      reasonForClosing,
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
    
    console.log('[Stores API] Store data prepared:', { 
      businessName: storeData.businessName, 
      storeType: storeData.storeType, 
      isOnlineStore: storeData.isOnlineStore,
      hasLocation: !!storeData.latitude
    });
    
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
    
    console.log('[Stores API] Store created successfully:', store.id);
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
    
    // Handle search query
    const searchQuery = searchParams.get('q') || searchParams.get('search');
    
    // NEW: Handle online store filtering
    const isOnlineStore = searchParams.get('isOnlineStore');
    const hasPhysicalLocation = searchParams.get('hasPhysicalLocation');
    
    console.log('[Stores API] GET request with filters:', {
      storeType,
      category,
      searchQuery,
      isOnlineStore,
      hasPhysicalLocation
    });
    
    // Build where clause
    const whereClause: any = {
      isApproved: true,
    };
    
    // Add text search functionality
    if (searchQuery && searchQuery.trim()) {
      console.log('[Stores API] Searching for:', searchQuery);
      whereClause.OR = [
        { businessName: { contains: searchQuery, mode: 'insensitive' } },
        { category: { contains: searchQuery, mode: 'insensitive' } },
        { inventoryDescription: { contains: searchQuery, mode: 'insensitive' } },
        { address: { contains: searchQuery, mode: 'insensitive' } },
        { city: { contains: searchQuery, mode: 'insensitive' } },
        { state: { contains: searchQuery, mode: 'insensitive' } },
        { website: { contains: searchQuery, mode: 'insensitive' } } // Added website search
      ];
    }
    
    // Filter by store type
    if (storeType && storeType !== 'all') {
      if (storeType === 'online') {
        whereClause.isOnlineStore = true;
      } else {
        whereClause.storeType = storeType;
        // If searching for opening/closing, exclude online stores unless specifically requested
        if (isOnlineStore !== 'true') {
          whereClause.isOnlineStore = false;
        }
      }
    }
    
    // NEW: Filter by online store status
    if (isOnlineStore === 'true') {
      whereClause.isOnlineStore = true;
    } else if (isOnlineStore === 'false') {
      whereClause.isOnlineStore = false;
    }
    
    // NEW: Filter by physical location presence
    if (hasPhysicalLocation === 'true') {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
          { address: { not: null } },
          { city: { not: null } },
          { state: { not: null } }
        ]
      });
    } else if (hasPhysicalLocation === 'false') {
      whereClause.OR = whereClause.OR || [];
      whereClause.OR.push(
        { latitude: null },
        { longitude: null },
        { address: null },
        { city: null },
        { state: null }
      );
    }
    
    // Filter by category (only if not searching, to avoid conflicts)
    if (category && category !== 'All Categories' && !searchQuery) {
      whereClause.category = category;
    }
    
    // Filter by discount (only for closing stores)
    if (minDiscount) {
      if (storeType === 'closing') {
        whereClause.discountPercentage = { gte: minDiscount };
      } else if (storeType === 'all' || !storeType) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          OR: [
            { storeType: 'closing', discountPercentage: { gte: minDiscount } },
            { storeType: 'opening' },
            { storeType: 'online' }
          ]
        });
      }
    }
    
    // Filter by dates
    if (closingBefore) {
      if (storeType === 'closing' || storeType === 'all' || !storeType) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          OR: [
            { storeType: 'closing', closingDate: { lte: closingBefore } },
            { storeType: 'opening' },
            { storeType: 'online' }
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
            { storeType: 'closing' },
            { storeType: 'online' }
          ]
        });
      }
    }
    
    console.log('[Stores API] Where clause:', JSON.stringify(whereClause, null, 2));
    
    // Query for stores with filters - including related images
    const stores = await prisma.store.findMany({
      where: whereClause,
      orderBy: searchQuery ? [
        // When searching, prioritize exact business name matches, then online stores
        { businessName: 'asc' },
        { isOnlineStore: 'desc' }
      ] : [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        images: true // Include the related images
      }
    });
    
    console.log('[Stores API] Found stores:', {
      total: stores.length,
      online: stores.filter(s => s.isOnlineStore).length,
      physical: stores.filter(s => !s.isOnlineStore).length
    });
    
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}