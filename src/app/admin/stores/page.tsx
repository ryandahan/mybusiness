"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, X, Eye, Star, Edit, Globe } from 'lucide-react';
import { Store } from '@/types/store';

interface AdminStore extends Store {
  isFeatured?: boolean;
  isOnlineStore?: boolean;
  promotionEndDate?: string; // Added promotion end date field
}

export default function AdminStoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('pending'); // 'pending' or 'approved'
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Separate authentication check from data fetching
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Handle data fetching in a separate effect with proper dependencies
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStores();
    }
  }, [status, session, viewMode]);
  
  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/stores?status=${viewMode}`, {
        // Add cache control to prevent caching issues
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stores: ${response.status}`);
      }
      
      const data = await response.json();
      setStores(data);
    } catch (error) {
      console.error(`Error fetching ${viewMode} stores:`, error);
      setError(`Unable to load stores. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const approveStore = async (id: string) => {
    try {
      setActionInProgress(id);
      const response = await fetch(`/api/admin/stores/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve store: ${response.status}`);
      }
      
      // Update local state immediately for better UI responsiveness
      setStores(prevStores => prevStores.filter(store => store.id !== id));
      
      // Refresh the data to ensure consistency
      fetchStores();
    } catch (error) {
      console.error('Error approving store:', error);
      setError('Failed to approve store. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };
  
  const rejectStore = async (id: string) => {
    try {
      setActionInProgress(id);
      const response = await fetch(`/api/admin/stores/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reject store: ${response.status}`);
      }
      
      // Update local state immediately
      setStores(prevStores => prevStores.filter(store => store.id !== id));
    } catch (error) {
      console.error('Error rejecting store:', error);
      setError('Failed to reject store. Please try again.');
      // Refresh the data in case of error to ensure consistency
      fetchStores();
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      setActionInProgress(id);
      const response = await fetch(`/api/admin/stores/${id}/feature`, {
        method: 'PUT',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to toggle featured status: ${response.status}`);
      }
      
      const updatedStore = await response.json();
      
      // Update local state optimistically
      setStores(prevStores => prevStores.map(store => 
        store.id === id ? { ...store, isFeatured: updatedStore.isFeatured } : store
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setError('Failed to update featured status. Please try again.');
      // Refresh to ensure consistency
      fetchStores();
    } finally {
      setActionInProgress(null);
    }
  };

  // Navigate to the existing store edit page
  const editStore = (id: string) => {
    router.push(`/stores/${id}/edit`);
  };

  // Determine store status (opening, closing, or online)
  const getStoreStatus = (store: AdminStore): 'opening' | 'closing' | 'online' => {
    // Check if it's an online store
    if (store.storeType === 'online' || store.isOnlineStore) {
      return 'online';
    }
    
    // Check storeType property
    if (store.storeType === 'opening') {
      return 'opening';
    }
    
    // Alternative detection based on dates
    if (store.openingDate && !store.closingDate) {
      return 'opening';
    }
    
    // Default to closing
    return 'closing';
  };

  // Get date label based on store type
  const getDateLabel = (store: AdminStore): string => {
    const status = getStoreStatus(store);
    if (status === 'online') return 'Promotion Ends';
    if (status === 'opening') return 'Opens';
    return 'Closes';
  };

  // Get relevant date for store
  const getRelevantDate = (store: AdminStore): string => {
    const status = getStoreStatus(store);
    
    if (status === 'opening') {
      return store.openingDate ? new Date(store.openingDate).toLocaleDateString() : 'Not specified';
    } else if (status === 'online') {
      // For online stores, use promotionEndDate
      return store.promotionEndDate ? new Date(store.promotionEndDate).toLocaleDateString() : 'Not specified';
    } else {
      // For closing stores, use closingDate
      return store.closingDate ? new Date(store.closingDate).toLocaleDateString() : 'Not specified';
    }
  };
  
  // Handle different loading states
  if (status === 'loading') {
    return <div className="p-4 text-center">Checking authentication...</div>;
  }
  
  if (status === 'unauthenticated' || (session?.user?.role !== 'admin')) {
    return <div className="p-4 text-center">Access denied</div>;
  }
  
  return (
    <div className="w-full px-2 sm:px-4 md:px-6 max-w-full">
      <h1 className="text-xl sm:text-2xl font-bold my-4">Store Approval Dashboard</h1>
      
      {error && (
        <div className="mb-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded-md text-sm sm:text-base">
          {error}
          <button 
            className="ml-2 text-red-800 font-bold"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          className="px-2 py-1 sm:px-4 sm:py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => router.push('/')}
          disabled={loading}
        >
          Back to Main Page
        </button>
        <button 
          className={`px-2 py-1 sm:px-4 sm:py-2 text-sm rounded ${viewMode === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('approved')}
          disabled={loading || viewMode === 'approved'}
        >
          Approved Stores
        </button>
        <button 
          className={`px-2 py-1 sm:px-4 sm:py-2 text-sm rounded ${viewMode === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('pending')}
          disabled={loading || viewMode === 'pending'}
        >
          Pending Stores
        </button>
        
        {loading && (
          <div className="flex items-center ml-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <span className="ml-2 text-xs sm:text-sm text-gray-600">Loading...</span>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stores.map((store) => {
                const storeStatus = getStoreStatus(store);
                const isOnline = storeStatus === 'online';
                  
                return (
                  <tr key={store.id} className={actionInProgress === store.id ? 'opacity-50' : ''}>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{store.businessName}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{store.category}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      {isOnline ? (
                        <span className="flex items-center text-blue-600">
                          <Globe size={14} className="mr-1" />
                          Online
                        </span>
                      ) : (
                        `${store.city}, ${store.state}`
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                        storeStatus === 'opening' 
                          ? 'bg-green-100 text-green-800' 
                          : storeStatus === 'online'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {storeStatus === 'opening' ? 'Opening' : storeStatus === 'online' ? 'Online' : 'Closing'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">{getDateLabel(store)}:</span>
                        <br />
                        {getRelevantDate(store)}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      {store.discountPercentage || store.discountPercentage === 0 ? (
                        <span className="text-red-600 font-bold">{store.discountPercentage}%</span>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      {new Date(store.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      {viewMode === 'approved' && (
                        <button
                          onClick={() => toggleFeatured(store.id)}
                          disabled={actionInProgress !== null}
                          className={`p-1 sm:p-2 rounded-full ${
                            store.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
                          } ${actionInProgress !== null ? 'cursor-not-allowed opacity-50' : 'hover:bg-yellow-200'}`}
                          title={store.isFeatured ? "Remove from Featured" : "Add to Featured"}
                        >
                          <Star size={16} fill={store.isFeatured ? "currentColor" : "none"} />
                        </button>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={() => router.push(`/admin/stores/${store.id}`)}
                          disabled={actionInProgress !== null}
                          className={`text-blue-600 hover:text-blue-800 ${
                            actionInProgress !== null ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {viewMode === 'pending' ? (
                          <>
                            <button
                              onClick={() => approveStore(store.id)}
                              disabled={actionInProgress !== null}
                              className={`text-green-600 hover:text-green-800 ${
                                actionInProgress !== null ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => rejectStore(store.id)}
                              disabled={actionInProgress !== null}
                              className={`text-red-600 hover:text-red-800 ${
                                actionInProgress !== null ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => editStore(store.id)}
                            disabled={actionInProgress !== null}
                            className={`text-indigo-600 hover:text-indigo-800 ${
                              actionInProgress !== null ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            title="Edit Store"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {stores.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="px-2 sm:px-4 py-4 text-center text-gray-500 text-xs sm:text-sm">
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
    </div>
  );
}