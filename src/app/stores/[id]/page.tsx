import { notFound } from 'next/navigation';
import { StoreDetailContent } from './client-component';
import { StoreData } from '@/types/store';

async function getStore(id: string): Promise<StoreData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/stores/${id}`, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

export default async function StoreDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  return <StoreDetailContent id={resolvedParams.id} />;
}