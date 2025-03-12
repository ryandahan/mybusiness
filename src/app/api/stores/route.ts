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
    const closingDate = new Date(formData.get('closingDate') as string);
    const discountPercentage = parseInt(formData.get('discountPercentage') as string);
    const inventoryDescription = formData.get('inventoryDescription') as string;
    const reasonForClosing = formData.get('reasonForClosing') as string || null;
    const ownerName = formData.get('ownerName') as string;
    const contactPreference = formData.get('contactPreference') as string;
    
    // Handle file uploads
    const storeImage = formData.get('storeImage') as File;
    const verificationDoc = formData.get('verificationDocuments') as File;
    
    let storeImageUrl = null;
    let verificationDocUrl = null;
    
    if (storeImage) {
      storeImageUrl = await uploadFile(storeImage, 'store-images');
    }
    
    if (verificationDoc) {
      verificationDocUrl = await uploadFile(verificationDoc, 'verification-docs');
    }
    
    // Get coordinates from address
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    const { latitude, longitude } = await getGeocode(fullAddress);
    
    // Create store in database
    const store = await prisma.store.create({
      data: {
        businessName,
        category,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        website,
        closingDate,
        discountPercentage,
        inventoryDescription,
        reasonForClosing,
        ownerName,
        contactPreference,
        storeImageUrl,
        verificationDocUrl,
        latitude,
        longitude,
        userId: session.user.id,
      },
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
    const category = searchParams.get('category');
    const minDiscount = searchParams.get('minDiscount') ? parseInt(searchParams.get('minDiscount')!) : undefined;
    const closingBefore = searchParams.get('closingBefore') ? new Date(searchParams.get('closingBefore')!) : undefined;
    
    // Query for approved stores with filters
    const stores = await prisma.store.findMany({
      where: {
        isApproved: true,
        ...(category && category !== 'All Categories' && { category }),
        ...(minDiscount && { discountPercentage: { gte: minDiscount } }),
        ...(closingBefore && { closingDate: { lte: closingBefore } }),
      },
    });
    
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}