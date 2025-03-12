"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, X, Eye } from 'lucide-react';

interface Store {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  closingDate: string;
  discountPercentage: number;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminStoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not admin
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
    
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchPendingStores();
    }
  }, [status, session, router]);
  
  const fetchPendingStores = async () => {
    try {
      const response = await fetch('/api/admin/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const approveStore = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/stores/${id}/approve`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        // Update the local state
        setStores(stores.map(store => 
          store.id === id ? { ...store, isApproved: true } : store
        ));
      }
    } catch (error) {
      console.error('Error approving store:', error);
    }
  };
  
  const rejectStore = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/stores/${id}/reject`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        // Remove from list
        setStores(stores.filter(store => store.id !== id));
      }
    } catch (error) {
      console.error('Error rejecting store:', error);
    }
  };
  
  if (status === 'loading' || loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  if (status === 'unauthenticated' || (session?.user?.role !== 'admin')) {
    return <div className="p-8 text-center">Access denied</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Store Approval Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Closing Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stores.map((store) => (
              <tr key={store.id}>
                <td className="px-6 py-4 whitespace-nowrap">{store.businessName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{store.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">{store.city}, {store.state}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(store.closingDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-red-600 font-bold">{store.discountPercentage}%</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(store.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/stores/${store.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => approveStore(store.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => rejectStore(store.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {stores.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No pending stores to approve
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}