"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { Store, Edit, MapPin, Tag, Home } from 'lucide-react';

interface Store {
  id: string;
  businessName: string;
  storeImageUrl?: string;
  discountPercentage?: number;
  category: string;
  city: string;
  state: string;
}

export default function MyStores() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserStores = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/user/stores');
        if (response.ok) {
          const data = await response.json();
          setStores(data);
        }
      } catch (error) {
        console.error('Error fetching user stores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStores();
  }, [status]);

  const handleEdit = async (storeId: string) => {
    router.push(`/stores/${storeId}/edit`);
  };

  const handleDelete = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return;

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStores(stores.filter(store => store.id !== storeId));
      }
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">My Store Listings</h1>
          <div className="flex gap-3 items-center">
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
            >
              <Home size={16} className="mr-2" />
              Back to Home
            </Link>
            <Link 
              href="/submit" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Store size={16} className="mr-2" />
              Add New Store
            </Link>
          </div>
        </div>
        
        {stores && stores.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {store.storeImageUrl ? (
                    <img 
                      src={store.storeImageUrl} 
                      alt={store.businessName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store size={48} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                    {store.discountPercentage || 0}%
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-1">{store.businessName}</h3>
                  
                  <div className="flex items-center text-gray-500 mb-2">
                    <Tag size={14} className="mr-1" />
                    <span>{store.category}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 mb-4">
                    <MapPin size={14} className="mr-1" />
                    <span>{store.city}, {store.state}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEdit(store.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <Link 
                      href={`/stores/${store.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">You haven't listed any stores yet.</p>
            <Link 
              href="/submit" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Store size={16} className="mr-2" />
              List a Store
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}