import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGeocode } from '@/lib/geocoding';
import { uploadFile } from '@/lib/storage'; // Changed from 'upload' to 'uploadFile'

// Use PrismaClient as a singleton
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
    const reasonForTransition = formData.get('reasonForTransition') as string || null;
    const ownerName = formData.get('ownerName') as string;
    const contactPreference = formData.get('contactPreference') as string;
    
    // Handle file uploads
    const storeImage = formData.get('storeImage') as File;
    const verificationDoc = formData.get('verificationDoc') as File;
    
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
      reasonForTransition,
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
    
    // Create store in database
    const store = await prisma.store.create({
      data: storeData
    });
    
    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Error submitting store:', error);
    return NextResponse.json({ error: 'Failed to submit store' }, { status: 500 });
  }
}