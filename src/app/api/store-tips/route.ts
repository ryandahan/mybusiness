import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getGeocode } from '@/lib/geocoding';
import { uploadFile } from '@/lib/storage';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const storeName = formData.get('storeName') as string;
    const category = formData.get('category') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zipCode = formData.get('zipCode') as string;
    const submitterEmail = formData.get('submitterEmail') as string;
    const storeType = formData.get('storeType') as string || 'closing'; // Add this line
    
    const discountPercentageValue = formData.get('discountPercentage');
    
    const storeImage = formData.get('storeImage') as File;
    let storeImageUrl = null;
    
    if (storeImage) {
      storeImageUrl = await uploadFile(storeImage, 'store-tip-images');
    }
    
    // Get coordinates with geocoding
    let coordinates = { latitude: 40.7128, longitude: -74.0060 }; // Default coordinates
    try {
      const fullAddress = `${address}, ${city}, ${state} ${zipCode}`.trim();
      const geocodeResult = await getGeocode(fullAddress);
      coordinates = {
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude
      };
      
      // Check if default coordinates were used (if the property exists)
      if ('isDefault' in geocodeResult && geocodeResult.isDefault) {
        console.log(`Using default coordinates for address: ${fullAddress}`);
      }
    } catch (geoError) {
      console.error('Failed to geocode address, using default coordinates:', geoError);
    }
    
    // Create data object first
    const tipData: any = {
      storeName,
      category,
      address,
      city,
      state,
      zipCode,
      submitterEmail,
      storeImageUrl,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      status: 'pending',
      storeType, // Add this line
    };
    
    // Only add discountPercentage if it exists and is not empty
    if (discountPercentageValue && discountPercentageValue.toString().trim() !== '') {
      tipData.discountPercentage = parseInt(discountPercentageValue.toString(), 10);
    }
    
    const storeTip = await prisma.storeTip.create({
      data: tipData
    });
    
    return NextResponse.json(storeTip, { status: 201 });
  } catch (error) {
    console.error('Error creating store tip:', error);
    return NextResponse.json({ error: 'Failed to submit store tip' }, { status: 500 });
  }
}