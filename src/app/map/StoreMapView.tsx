"use client"

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StoreData } from '@/types/store';
import { useUserLocation } from './useUserLocation';

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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function StoreMapView({ filters }: StoreMapViewProps) {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  
  const { 
    userLocation, 
    locationError, 
    isLoading, 
    manualAddress, 
    setManualAddress, 
    geocodeAddress 
  } = useUserLocation();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        
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

  useEffect(() => {
    if (!userLocation || !stores.length) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter(store => {
      if (!store.latitude || !store.longitude) return false; // Changed to false
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        store.latitude,
        store.longitude
      );
      
      return distance <= filters.maxDistance;
    });
    
    setFilteredStores(filtered);
  }, [userLocation, stores, filters.maxDistance]);

  const handleGeocodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    geocodeAddress(manualAddress);
  };

  return (
    <div className="w-full h-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <form onSubmit={handleGeocodeSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter your address, city, or zip code"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>
        </form>
        {locationError && (
          <p className="mt-2 text-yellow-700 text-sm">{locationError}</p>
        )}
        {userLocation && !locationError && (
          <p className="mt-2 text-sm">
            {filteredStores.length > 0 
              ? <span className="text-green-700">Location found! Filtering stores within {filters.maxDistance} miles.</span>
              : <span className="text-yellow-700">Your location was found, but no stores are within {filters.maxDistance} miles.</span>}
          </p>
        )}
      </div>
      
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
            stores={filteredStores} 
            onStoreSelect={(store) => setSelectedStore(store)}
            userLocation={userLocation}
            maxDistance={filters.maxDistance}
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