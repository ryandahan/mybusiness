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
    storeType: 'closing' | 'opening' | 'all';
    category: string;
    minDiscount: number;
    maxDistance: number;
    closingBefore: string;
    searchQuery: string;
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
    geocodeAddress,
    addressSuggestions,
    showSuggestions,
    setShowSuggestions,
    isFetchingSuggestions,
    selectSuggestion
  } = useUserLocation();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        
        // Use the stores API for both regular and search queries
        const params = new URLSearchParams();
        
        // Add search query if exists
        if (filters.searchQuery && filters.searchQuery.trim()) {
          params.append('q', filters.searchQuery);
        }
        
        if (filters.storeType && filters.storeType !== 'all') {
          params.append('storeType', filters.storeType);
        }
        
        if (filters.category && filters.category !== 'All Categories') {
          params.append('category', filters.category);
        }
        
        if (filters.minDiscount > 0 && (filters.storeType === 'closing' || filters.storeType === 'all')) {
          params.append('minDiscount', filters.minDiscount.toString());
        }
        
        if (filters.closingBefore) {
          const dateParamName = filters.storeType === 'opening' ? 'openingBefore' : 'closingBefore';
          params.append(dateParamName, filters.closingBefore);
        }
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        console.log('[StoreMapView] Fetching with URL:', `/api/stores${queryString}`);
        
        const response = await fetch(`/api/stores${queryString}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        
        const data = await response.json();
        console.log('[StoreMapView] Received stores:', data.length);
        
        // Convert the store data to include storeImages array for compatibility
        const storesWithImages = data.map((store: any) => ({
          ...store,
          storeImages: store.images ? store.images.map((img: any) => img.url) : []
        }));
        
        setStores(storesWithImages);
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
    // Always filter out stores without valid coordinates first
    const storesWithValidCoords = stores.filter(store => {
      return store.latitude && 
             store.longitude && 
             !isNaN(store.latitude) && 
             !isNaN(store.longitude) &&
             store.latitude !== 0 &&
             store.longitude !== 0;
    });

    console.log(`[StoreMapView] Total stores: ${stores.length}, Valid coordinates: ${storesWithValidCoords.length}`);

    if (!userLocation || !storesWithValidCoords.length) {
      setFilteredStores(storesWithValidCoords);
      return;
    }

    // Then apply distance filtering if user location is available
    const filtered = storesWithValidCoords.filter(store => {
      // Safe to use type assertion since we already filtered for valid coordinates
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        store.latitude as number,
        store.longitude as number
      );
      
      return distance <= filters.maxDistance;
    });
    
    console.log(`[StoreMapView] After distance filter: ${filtered.length} stores within ${filters.maxDistance} miles`);
    setFilteredStores(filtered);
  }, [userLocation, stores, filters.maxDistance]);

  const handleGeocodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    geocodeAddress(manualAddress);
  };

  const isOpeningStore = (store: StoreData): boolean => {
    return store.storeType === 'opening';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.address-input-container') && showSuggestions) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions, setShowSuggestions]);

  return (
    <div className="w-full h-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Search results summary */}
      {filters.searchQuery && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">
                {loading ? 'Searching...' : `Found ${filteredStores.length} result${filteredStores.length !== 1 ? 's' : ''}`}
              </p>
              {!loading && filteredStores.length > 0 && (
                <p className="text-sm text-blue-700">
                  Showing stores matching "{filters.searchQuery}"
                  {stores.length !== filteredStores.length && ` (${stores.length - filteredStores.length} stores hidden due to missing location data)`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <form onSubmit={handleGeocodeSubmit} className="flex gap-2">
          <div className="flex-1 relative address-input-container">
            <input
              type="text"
              placeholder="Enter your address, city, or zip code"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              onFocus={() => {
                if (addressSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion.display_name}
                  </div>
                ))}
              </div>
            )}
            
            {isFetchingSuggestions && (
              <div className="absolute right-3 top-2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
          
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
            <p>{filters.searchQuery ? 'Searching stores...' : 'Loading stores...'}</p>
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
                  {isOpeningStore(selectedStore) ? (
                    <>
                      <p className="text-green-600 font-bold text-xl">OPENING SOON</p>
                      {selectedStore.openingDate && (
                        <p><strong>Opening Date:</strong> {new Date(selectedStore.openingDate).toLocaleDateString()}</p>
                      )}
                      {selectedStore.specialOffers && (
                        <p><strong>Special Offers:</strong> {selectedStore.specialOffers}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-red-600 font-bold text-xl">{selectedStore.discountPercentage}% OFF</p>
                      {selectedStore.closingDate && (
                        <p><strong>Closing Date:</strong> {new Date(selectedStore.closingDate).toLocaleDateString()}</p>
                      )}
                    </>
                  )}
                  <p><strong>Phone:</strong> {selectedStore.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* No results message for search */}
          {filters.searchQuery && filteredStores.length === 0 && !loading && (
            <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 text-lg">No stores found for "{filters.searchQuery}"</p>
              <p className="text-gray-500 text-sm mt-2">
                Try searching for different terms like "electronics", "clothing", or specific store names.
              </p>
              {stores.length > 0 && (
                <p className="text-gray-500 text-xs mt-1">
                  Note: {stores.length} store{stores.length !== 1 ? 's were' : ' was'} found but {stores.length !== 1 ? 'they don\'t' : 'it doesn\'t'} have valid location data for mapping.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}