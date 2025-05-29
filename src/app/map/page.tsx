"use client"

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Home, Store, PlusCircle, Search, X, Globe, ExternalLink } from 'lucide-react';
import FilterPanel from './FilterPanel';
import StoreMapView from './StoreMapView';

// Define the complete filter type
interface Filters {
  storeType: 'closing' | 'opening' | 'online' | 'all';
  category: string;
  minDiscount: number;
  maxDistance: number;
  closingBefore: string;
  searchQuery: string;
  isOnlineStore?: boolean;
  hasPhysicalLocation?: boolean;
}

// Component to display online stores
function OnlineStoresList({ filters }: { filters: Filters }) {
  const [onlineStores, setOnlineStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filters.searchQuery || filters.storeType === 'online') {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.searchQuery) queryParams.set('q', filters.searchQuery);
      queryParams.set('isOnlineStore', 'true');
      
      fetch(`/api/stores?${queryParams.toString()}`)
        .then(res => res.json())
        .then(data => {
          const online = Array.isArray(data) 
            ? data.filter((store: any) => store.isOnlineStore)
            : [];
          setOnlineStores(online);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setOnlineStores([]);
    }
  }, [filters.searchQuery, filters.storeType]);

  if (!filters.searchQuery && filters.storeType !== 'online') return null;
  if (onlineStores.length === 0 && !loading) return null;

  return (
    <div className="mb-6 bg-blue-50 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center">
        <Globe className="mr-2" size={20} />
        Online Stores ({onlineStores.length})
      </h2>
      {loading ? (
        <p className="text-gray-600">Loading online stores...</p>
      ) : onlineStores.length === 0 ? (
        <p className="text-gray-600">No online stores found</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {onlineStores.map((store: any) => (
            <Link
              key={store.id}
              href={`/stores/${store.id}`}
              className="bg-white rounded-md p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-md mb-1">{store.businessName}</h3>
              <p className="text-sm text-gray-600 mb-2">{store.category}</p>
              {store.discountPercentage && (
                <p className="text-sm text-red-600 font-medium mb-2">
                  🏷️ {store.discountPercentage}% OFF
                </p>
              )}
              {store.specialOffers && (
                <p className="text-sm text-green-600 font-medium mb-2">
                  🎁 {store.specialOffers}
                </p>
              )}
              {store.promotionEndDate && (
                <p className="text-xs text-gray-500 mb-2">
                  Ends: {new Date(store.promotionEndDate).toLocaleDateString()}
                </p>
              )}
              {store.website && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(store.website, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
                >
                  Visit Website <ExternalLink size={14} className="ml-1" />
                </button>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Component that uses useSearchParams - wrapped in Suspense
function MapContent() {
  const searchParams = useSearchParams();
  const initialStoreType = (searchParams?.get('type') || 'closing') as 'closing' | 'opening' | 'all' | 'online';
  const initialSearch = searchParams?.get('search') || '';
  
  const [filters, setFilters] = useState<Filters>({
    storeType: initialStoreType,
    category: '',
    minDiscount: 0,
    maxDistance: 50,
    closingBefore: '',
    searchQuery: initialSearch,
    isOnlineStore: undefined,
    hasPhysicalLocation: undefined
  });

  const storeTypeLabels = {
    closing: 'Closing',
    opening: 'Opening',
    all: 'All',
    online: 'Online'
  };

  const clearSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
    const url = new URL(window.location.href);
    url.searchParams.delete('search');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {filters.searchQuery 
              ? `Search Results for "${filters.searchQuery}"`
              : `Find ${filters.storeType === 'all' ? '' : `${storeTypeLabels[filters.storeType]} `}Stores Near You`
            }
          </h1>
          
          {filters.searchQuery && (
            <div className="mt-2">
              <div className="inline-flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                <Search size={14} className="mr-2" />
                Searching for: "{filters.searchQuery}"
                <button
                  onClick={clearSearch}
                  className="ml-2 hover:bg-orange-200 rounded-full p-1"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        <Link 
          href="/"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Home size={18} className="mr-2" />
          Back to Home
        </Link>
      </div>
      
      {/* Store Type Selector - only show if no search query */}
      {!filters.searchQuery && (
        <div className="mb-6">
          <div className="flex bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setFilters(prev => ({...prev, storeType: 'all'}))}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filters.storeType === 'all' 
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Stores
            </button>
            <button
              onClick={() => setFilters(prev => ({...prev, storeType: 'closing'}))}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                filters.storeType === 'closing' 
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Store size={16} className="mr-1" />
              Closing Stores
            </button>
            <button
              onClick={() => setFilters(prev => ({...prev, storeType: 'opening'}))}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                filters.storeType === 'opening' 
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PlusCircle size={16} className="mr-1" />
              Opening Stores
            </button>
            <button
              onClick={() => setFilters(prev => ({...prev, storeType: 'online'}))}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                filters.storeType === 'online' 
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Globe size={16} className="mr-1" />
              Online Stores
            </button>
          </div>
        </div>
      )}
      
      {/* Online Stores List */}
      <OnlineStoresList filters={filters} />
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/4">
          <FilterPanel 
            filters={{
              ...filters,
              isOnlineStore: filters.storeType === 'online' ? true : filters.isOnlineStore,
              hasPhysicalLocation: filters.storeType === 'online' ? false : filters.hasPhysicalLocation
            }} 
            setFilters={setFilters}
          />
        </div>
        
        <div className="w-full lg:w-3/4 h-[70vh]">
          <StoreMapView filters={{
            storeType: filters.storeType === 'online' ? 'all' : filters.storeType as 'closing' | 'opening' | 'all',
            category: filters.category,
            minDiscount: filters.minDiscount,
            maxDistance: filters.maxDistance,
            closingBefore: filters.closingBefore,
            searchQuery: filters.searchQuery
          }} />
        </div>
      </div>
    </>
  );
}

export default function MapPage() {
  const { data: session, status } = useSession();
  
  return (
    <main className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Suspense fallback={<div>Loading map...</div>}>
          <MapContent />
        </Suspense>
      </div>
    </main>
  );
}