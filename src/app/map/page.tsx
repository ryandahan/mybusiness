"use client"

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Home } from 'lucide-react';
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Find Closing Stores Near You</h1>
          <Link 
            href="/"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </Link>
        </div>
        
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