"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { MapPin, Calendar, Tag, Phone, Mail, Edit } from 'lucide-react';

interface Store {
  id: string;
  businessName: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string | null;
  storeType?: string;
  closingDate?: string;
  openingDate?: string;
  discountPercentage: number;
  inventoryDescription: string;
  reasonForClosing?: string;
  storeImageUrl?: string | null;
}

export function StoreDetailContent({ id }: { id: string }) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch(`/api/stores/${id}`);
        if (response.ok) {
          const data = await response.json();
          setStore(data);
        } else {
          setError('Store not found');
        }
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  if (loading) return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </main>
  );

  if (error || !store) return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error || 'Store not found'}</h1>
        <Link href="/map" className="bg-blue-600 text-white px-4 py-2 rounded">Browse Other Stores</Link>
      </div>
    </main>
  );

  const isOpeningStore = store.storeType === 'opening';
  const relevantDate = isOpeningStore
    ? (store.openingDate ? new Date(store.openingDate).toLocaleDateString() : 'Not specified')
    : (store.closingDate ? new Date(store.closingDate).toLocaleDateString() : 'Not specified');

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto p-6">
        <Link href="/map" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Back to All Stores
        </Link>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {store.storeImageUrl && (
            <div className="h-64 overflow-hidden">
              <img src={store.storeImageUrl} alt={store.businessName} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="p-6">
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{store.businessName}</h1>
                <p className="text-gray-600">{store.category}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isOpeningStore 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isOpeningStore ? 'Opening Soon' : 'Closing Soon'}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="text-gray-500 mr-2 mt-1 flex-shrink-0" size={18} />
                    <span>{store.address}, {store.city}, {store.state} {store.zipCode}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="text-gray-500 mr-2 flex-shrink-0" size={18} />
                    <span>{store.phone}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="text-gray-500 mr-2 flex-shrink-0" size={18} />
                    <span>{store.email}</span>
                  </div>

                  {store.website && (
                    <a href={store.website} target="_blank" rel="noopener noreferrer" 
                      className="block text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {isOpeningStore ? 'Opening Details' : 'Closing Details'}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="text-gray-500 mr-2 flex-shrink-0" size={18} />
                    <span>
                      {isOpeningStore ? 'Opening' : 'Closing'} Date: <strong>{relevantDate}</strong>
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Tag className="text-gray-500 mr-2 flex-shrink-0" size={18} />
                    <span>Discount: <strong className="text-red-600">{store.discountPercentage}% OFF</strong></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Inventory Description</h2>
              <p className="bg-gray-50 p-4 rounded-md">{store.inventoryDescription}</p>
            </div>

            {store.reasonForClosing && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">
                  {isOpeningStore ? 'Description' : 'Reason for Closing'}
                </h2>
                <p className="bg-gray-50 p-4 rounded-md">{store.reasonForClosing}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Link 
                href={`/stores/${id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                <Edit size={16} className="mr-2" />
                Edit Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}