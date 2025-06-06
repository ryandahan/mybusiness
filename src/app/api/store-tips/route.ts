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
    const address = formData.get('address') as string || '';
    const city = formData.get('city') as string || '';
    const state = formData.get('state') as string || '';
    const zipCode = formData.get('zipCode') as string || '';
    const submitterEmail = formData.get('submitterEmail') as string;
    const storeType = formData.get('storeType') as string || 'closing';
    const isOnlineStore = formData.get('isOnlineStore') === 'true';
    const website = formData.get('website') as string || null;
    
    const discountPercentageValue = formData.get('discountPercentage');
    const openingDate = formData.get('openingDate') as string;
    const specialOffers = formData.get('specialOffers') as string;
    const promotionEndDate = formData.get('promotionEndDate') as string;
    
    // Legacy single image handling
    const storeImage = formData.get('storeImage') as File;
    let storeImageUrl = null;
    
    if (storeImage && storeImage.size > 0) {
      storeImageUrl = await uploadFile(storeImage, 'store-tip-images');
    }
    
    // Get coordinates with geocoding (only for physical stores)
    let coordinates = { latitude: null as number | null, longitude: null as number | null };
    
    if (!isOnlineStore && address && city && state && zipCode) {
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
        console.error('Failed to geocode address, using null coordinates:', geoError);
      }
    }
    
    // Additional data to store in notes field
    const additionalData: { [key: string]: any } = {};
    
    if (openingDate) {
      additionalData['openingDate'] = openingDate;
    }
    
    if (specialOffers) {
      additionalData['specialOffers'] = specialOffers;
    }
    
    if (promotionEndDate) {
      additionalData['promotionEndDate'] = promotionEndDate;
    }
    
    // Create data object
    const tipData: any = {
      storeName,
      category,
      address: address || null,
      city: city || null,
      state: state || null,
      zipCode: zipCode || null,
      submitterEmail,
      storeImageUrl,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      status: 'pending',
      storeType,
      isOnlineStore,
      website,  // Now properly included
      notes: Object.keys(additionalData).length > 0 ? JSON.stringify(additionalData) : null
    };
    
    // Only add discountPercentage if it exists and is not empty
    if (discountPercentageValue && discountPercentageValue.toString().trim() !== '') {
      tipData.discountPercentage = parseInt(discountPercentageValue.toString(), 10);
    }
    
    // Create the storeTip record
    const storeTip = await prisma.storeTip.create({
      data: tipData
    });
    
    // Process multiple images
    const storeImagesEntries = formData.getAll('storeImages');
    
    if (storeImagesEntries && storeImagesEntries.length > 0) {
      const imagePromises = storeImagesEntries.map(async (fileEntry) => {
        if (fileEntry instanceof File && fileEntry.size > 0) {
          try {
            const imageUrl = await uploadFile(fileEntry, 'store-tip-images');
            
            // Create an entry in the StoreTipImage table
            return prisma.storeTipImage.create({
              data: {
                url: imageUrl,
                storeTipId: storeTip.id
              }
            });
          } catch (uploadError) {
            console.error('Error uploading multiple image:', uploadError);
            return null;
          }
        }
        return null;
      });
      
      // Wait for all image uploads and DB entries to complete
      await Promise.all(imagePromises.filter(Boolean));
    }
    
    return NextResponse.json(storeTip, { status: 201 });
  } catch (error) {
    console.error('Error creating store tip:', error);
    return NextResponse.json({ error: 'Failed to submit store tip' }, { status: 500 });
  }
}