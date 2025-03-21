import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Explicitly filter for stores where isFeatured is true (not null or undefined)
    const stores = await prisma.store.findMany({
      where: { 
        isApproved: true,
        isFeatured: {
          equals: true
        }
      },
      orderBy: { 
        discountPercentage: 'desc'
      }
    });
    
    // Return empty array if no featured stores found
    if (stores.length === 0) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching featured stores:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}