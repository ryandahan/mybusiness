import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get status parameter from URL (pending or approved)
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    
    // Set isApproved filter based on status
    const isApproved = status === 'approved';
    
    // Fetch stores from database based on approval status
    const stores = await prisma.store.findMany({
      where: { isApproved },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        businessName: true,
        category: true,
        city: true,
        state: true,
        closingDate: true,
        discountPercentage: true,
        isApproved: true,
        createdAt: true
      }
    });
    
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores for admin:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}