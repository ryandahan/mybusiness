// src/app/api/stores/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const storeId = resolvedParams.id;
    
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        images: true  // Include related images
      }
    });
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    console.log('Found store:', store.businessName, 'Approved:', store.isApproved);
    
    return NextResponse.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use formData instead of json parsing
    const formData = await request.formData();
    const resolvedParams = await params;
    const storeId = resolvedParams.id;
    
    // Get the store image file from the form data
    const storeImage = formData.get('storeImage');
    let storeImageUrl = undefined;
    
    // Check if main image should be deleted explicitly
    const deleteMainImage = formData.get('deleteMainImage') === 'true';
    
    // Process the image if it exists
    if (storeImage instanceof File && storeImage.size > 0) {
      try {
        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });
        
        // Create a unique filename
        const uniqueFilename = `${Date.now()}-${storeImage.name.replace(/\s+/g, '-')}`;
        const filePath = path.join(uploadDir, uniqueFilename);
        
        // Convert file to buffer and write to disk
        const bytes = await storeImage.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);
        
        // Set the URL to be used in the database
        storeImageUrl = `/uploads/${uniqueFilename}`;
        console.log(`Image saved to: ${filePath}`);
      } catch (error) {
        console.error('Error saving image:', error);
        return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
      }
    }
    
    // Process additional images
    const additionalImages = formData.getAll('additionalImages');
    const additionalImageUrls: string[] = [];
    
    if (additionalImages && additionalImages.length > 0) {
      try {
        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });
        
        for (let i = 0; i < additionalImages.length; i++) {
          const image = additionalImages[i];
          
          if (image instanceof File && image.size > 0) {
            // Create a unique filename
            const uniqueFilename = `${Date.now()}-${i}-${image.name.replace(/\s+/g, '-')}`;
            const filePath = path.join(uploadDir, uniqueFilename);
            
            // Convert file to buffer and write to disk
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filePath, buffer);
            
            // Add URL to array
            additionalImageUrls.push(`/uploads/${uniqueFilename}`);
            console.log(`Additional image saved to: ${filePath}`);
          }
        }
      } catch (error) {
        console.error('Error saving additional images:', error);
        return NextResponse.json({ error: 'Failed to save additional images' }, { status: 500 });
      }
    }
    
    // Get images to delete
    const imagesToDeleteStr = formData.get('imagesToDelete') as string;
    const imagesToDelete: string[] = imagesToDeleteStr ? JSON.parse(imagesToDeleteStr) : [];
    
    // Extract data from form
    const updateData: any = {
      businessName: formData.get('businessName') as string,
      category: formData.get('category') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string || undefined,
      storeType: formData.get('storeType') as string,
      reasonForClosing: formData.get('reasonForTransition') as string || undefined,
      ownerName: formData.get('ownerName') as string || undefined,
      contactPreference: formData.get('contactPreference') as string,
      updatedAt: new Date(),
    };
    
    // Handle dates
    const closingDate = formData.get('closingDate') as string;
    if (closingDate && closingDate.trim() !== '') {
      updateData.closingDate = new Date(closingDate);
    }
    
    const openingDate = formData.get('openingDate') as string;
    if (openingDate && openingDate.trim() !== '') {
      updateData.openingDate = new Date(openingDate);
    }
    
    // Handle discount percentage
    const discountPercentage = formData.get('discountPercentage') as string;
    if (discountPercentage && discountPercentage.trim() !== '') {
      updateData.discountPercentage = parseInt(discountPercentage, 10);
    }
    
    // Add image URL if we have one
    if (storeImageUrl) {
      updateData.storeImageUrl = storeImageUrl;
    } else if (deleteMainImage) {
      // Explicitly set to null if user wants to delete main image
      updateData.storeImageUrl = null;
    }
    
    // Handle boolean fields
    updateData.isFeatured = formData.get('isFeatured') === 'true';
    
    // Use a transaction to ensure all operations succeed together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the store
      const updatedStore = await tx.store.update({
        where: { id: storeId },
        data: updateData,
      });
      
      // 2. Delete selected images
      if (imagesToDelete.length > 0) {
        await tx.storeImage.deleteMany({
          where: {
            id: { in: imagesToDelete },
            storeId: storeId
          }
        });
      }
      
      // 3. Add new additional images
      if (additionalImageUrls.length > 0) {
        const imageCreatePromises = additionalImageUrls.map(url => 
          tx.storeImage.create({
            data: {
              url: url,
              storeId: storeId
            }
          })
        );
        
        await Promise.all(imageCreatePromises);
      }
      
      // Return the updated store with images
      return tx.store.findUnique({
        where: { id: storeId },
        include: { images: true }
      });
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating store:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const storeId = resolvedParams.id;
    
    // Delete the store
    await prisma.store.delete({
      where: { id: storeId }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Store deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting store:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to delete store' }, { status: 500 });
  }
}