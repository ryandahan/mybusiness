"use client"

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StoreData } from '@/types/store';

// Dynamically load the map component to prevent SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
});

interface StoreMapViewProps {
  filters: {
    category: string;
    minDiscount: number;
    maxDistance: number;
    closingBefore: string;
  };
}

export default function StoreMapView({ filters }: StoreMapViewProps) {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        
        // Build query string from filters
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'All Categories') {
          params.append('category', filters.category);
        }
        if (filters.minDiscount > 0) {
          params.append('minDiscount', filters.minDiscount.toString());
        }
        if (filters.closingBefore) {
          params.append('closingBefore', filters.closingBefore);
        }
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`/api/stores${queryString}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        
        const data = await response.json();
        setStores(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Unable to load stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [filters]);

  return (
    <div className="w-full h-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p>Loading stores...</p>
          </div>
        </div>
      ) : (
        <>
          <MapComponent 
            stores={stores} 
            onStoreSelect={(store) => setSelectedStore(store)} 
          />
          
          {selectedStore && (
            <div className="mt-4 p-4 border rounded-md bg-white">
              <h3 className="text-xl font-bold">{selectedStore.businessName}</h3>
              <div className="grid grid-cols-2 mt-2 gap-2">
                <div>
                  <p><strong>Category:</strong> {selectedStore.category}</p>
                  <p><strong>Address:</strong> {selectedStore.address}</p>
                  <p><strong>Location:</strong> {selectedStore.city}, {selectedStore.state} {selectedStore.zipCode}</p>
                </div>
                <div>
                  <p className="text-red-600 font-bold text-xl">{selectedStore.discountPercentage}% OFF</p>
                  <p><strong>Closing Date:</strong> {new Date(selectedStore.closingDate).toLocaleDateString()}</p>
                  <p><strong>Phone:</strong> {selectedStore.phone}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}