import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Try to get stores marked as featured first
    let stores = await prisma.store.findMany({
      where: { 
        isApproved: true,
        // @ts-ignore - Ignore TypeScript errors about isFeatured
        isFeatured: true
      },
      take: 3,
      orderBy: { 
        discountPercentage: 'desc'
      }
    });
    
    // If no featured stores found, fall back to showing highest discount stores
    if (stores.length === 0) {
      stores = await prisma.store.findMany({
        where: { 
          isApproved: true
        },
        take: 3,
        orderBy: { 
          discountPercentage: 'desc'
        }
      });
    }
    
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching featured stores:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}