"use client"

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Home, Store, PlusCircle } from 'lucide-react';
import FilterPanel from './FilterPanel';
import StoreMapView from './StoreMapView';

// Component that uses useSearchParams - wrapped in Suspense
function MapContent() {
  const searchParams = useSearchParams();
  const initialStoreType = searchParams?.get('type') || 'closing';
  
  const [filters, setFilters] = useState({
    storeType: initialStoreType as 'closing' | 'opening' | 'all',
    category: '',
    minDiscount: 0,
    maxDistance: 50,
    closingBefore: ''
  });

  const storeTypeLabels = {
    closing: 'Closing',
    opening: 'Opening',
    all: 'All'
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Find {filters.storeType === 'all' ? '' : `${storeTypeLabels[filters.storeType]} `}Stores Near You</h1>
        <Link 
          href="/"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Home size={18} className="mr-2" />
          Back to Home
        </Link>
      </div>
      
      {/* Store Type Selector */}
      <div className="mb-6">
        <div className="flex bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setFilters({...filters, storeType: 'all'})}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filters.storeType === 'all' 
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Stores
          </button>
          <button
            onClick={() => setFilters({...filters, storeType: 'closing'})}
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
            onClick={() => setFilters({...filters, storeType: 'opening'})}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
              filters.storeType === 'opening' 
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PlusCircle size={16} className="mr-1" />
            Opening Stores
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/4">
          <FilterPanel filters={filters} setFilters={setFilters} />
        </div>
        
        <div className="w-full lg:w-3/4 h-[70vh]">
          <StoreMapView filters={filters} />
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