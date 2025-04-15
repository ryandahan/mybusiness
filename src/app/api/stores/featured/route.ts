import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch featured stores of both types without using select
    const stores = await prisma.store.findMany({
      where: { 
        isApproved: true,
        isFeatured: {
          equals: true
        }
      },
      // Remove the select clause to avoid type errors
      // Prisma will return all fields by default
      orderBy: {
        createdAt: 'desc'
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