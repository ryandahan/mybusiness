"use client"

import React from 'react';
import { useSession } from 'next-auth/react';
import FilterPanel from './FilterPanel';
import StoreMapView from './StoreMapView';

export default function MapPage() {
  const { data: session, status } = useSession();
  
  const [filters, setFilters] = React.useState({
    category: '',
    minDiscount: 0,
    maxDistance: 50,
    closingBefore: ''
  });

  return (
    <main className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Find Closing Stores Near You</h1>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/4">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>
          
          <div className="w-full lg:w-3/4 h-[70vh]">
            <StoreMapView filters={filters} />
          </div>
        </div>
      </div>
    </main>
  );
}