"use client"

import { Store } from '@/types/store';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, X, Eye } from 'lucide-react';

export default function AdminStoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('pending');
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
    
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      if (viewMode === 'pending') {
        fetchPendingStores();
      } else {
        fetchApprovedStores();
      }
    }
  }, [status, session, router, viewMode]);
  
  const fetchPendingStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stores?status=pending');
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error('Error fetching pending stores:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchApprovedStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stores?status=approved');
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error('Error fetching approved stores:', error);
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
        setStores(stores.map(store => 
          store.id === id ? { ...store, isApproved: true } : store
        ));
        fetchPendingStores();
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
      
      <div className="flex mb-4">
        <button 
          className="px-4 py-2 mr-2 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => router.push('/')}
        >
          Back to Main Page
        </button>
        <button 
          className={`px-4 py-2 rounded ${viewMode === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('approved')}
        >
          Approved Stores
        </button>
        <button 
          className={`px-4 py-2 ml-2 rounded ${viewMode === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('pending')}
        >
          Pending Stores
        </button>
      </div>
      
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
                  {store.discountPercentage || store.discountPercentage === 0 ? (
                    <span className="text-red-600 font-bold">{store.discountPercentage}%</span>
                  ) : (
                    <span className="text-gray-500">Unspecified</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(store.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/stores/${store.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    
                    {viewMode === 'pending' && (
                      <>
                        <button
                          onClick={() => approveStore(store.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => rejectStore(store.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {stores.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  {viewMode === 'pending' 
                    ? 'No pending stores to approve' 
                    : 'No approved stores found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}