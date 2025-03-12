'use client'

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Phone, Mail, Calendar, Tag, MapPin } from 'lucide-react';
import DocumentViewer from '@/components/DocumentViewer';

interface StoreDetails {
  id: string;
  businessName: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string | null;
  closingDate: string;
  discountPercentage: number;
  inventoryDescription: string;
  reasonForClosing: string | null;
  ownerName: string;
  contactPreference: string;
  storeImageUrl: string | null;
  verificationDocUrl: string | null;
  documentKey?: string;
  latitude: number | null;
  longitude: number | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StoreDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const storeId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
    
    if (status === 'authenticated' && session?.user?.role === 'admin' && storeId) {
      fetchStoreDetails();
    }
  }, [status, session, router, storeId]);

  const fetchStoreDetails = async () => {
    if (!storeId) return;
    
    try {
      const response = await fetch(`/api/admin/stores/${storeId}`);
      if (response.ok) {
        const data = await response.json();
        setStore(data);
      } else {
        setError('Failed to load store details');
      }
    } catch (error) {
      setError('An error occurred');
      console.error('Error fetching store details:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveStore = async () => {
    if (!storeId) return;
    
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/approve`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        setStore(prev => prev ? { ...prev, isApproved: true } : null);
      }
    } catch (error) {
      console.error('Error approving store:', error);
    }
  };

  const rejectStore = async () => {
    if (!storeId) return;
    
    if (confirm('Are you sure you want to reject this store?')) {
      try {
        const response = await fetch(`/api/admin/stores/${storeId}/reject`, {
          method: 'PUT',
        });
        
        if (response.ok) {
          router.push('/admin/stores');
        }
      } catch (error) {
        console.error('Error rejecting store:', error);
      }
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || !store) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">{error || 'Store not found'}</p>
          <Link href="/admin/stores" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/stores" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft size={16} className="mr-1" />
          Back to Admin Dashboard
        </Link>
        
        <div className="flex space-x-2">
          {!store.isApproved && (
            <button
              onClick={approveStore}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <CheckCircle size={16} className="mr-1" />
              Approve
            </button>
          )}
          <button
            onClick={rejectStore}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <XCircle size={16} className="mr-1" />
            Reject
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{store.businessName}</h1>
          <p className="text-gray-500">{store.category}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Store Information</h2>
            <div className="space-y-3">
              <div className="flex">
                <MapPin size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p>{store.address}, {store.city}, {store.state} {store.zipCode}</p>
                </div>
              </div>
              
              <div className="flex">
                <Phone size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p>{store.phone}</p>
                </div>
              </div>
              
              <div className="flex">
                <Mail size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p>{store.email}</p>
                </div>
              </div>

              {store.website && (
                <div className="flex">
                  <div className="text-gray-500 mr-2 flex-shrink-0 mt-0.5">🌐</div>
                  <div>
                    <p className="font-medium">Website</p>
                    <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {store.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Closing Details</h2>
            <div className="space-y-3">
              <div className="flex">
                <Calendar size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Closing Date</p>
                  <p>{new Date(store.closingDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex">
                <Tag size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Discount</p>
                  <p className="text-red-600 font-bold">{store.discountPercentage}% OFF</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium">Inventory Description</p>
                <p className="mt-1 bg-gray-50 p-3 rounded-md">{store.inventoryDescription}</p>
              </div>

              {store.reasonForClosing && (
                <div>
                  <p className="font-medium">Reason for Closing</p>
                  <p className="mt-1 bg-gray-50 p-3 rounded-md">{store.reasonForClosing}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Owner Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Owner Name</p>
              <p>{store.ownerName}</p>
            </div>
            <div>
              <p className="font-medium">Preferred Contact Method</p>
              <p className="capitalize">{store.contactPreference}</p>
            </div>
          </div>
        </div>

        {(store.storeImageUrl || store.verificationDocUrl) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-3">Uploaded Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {store.storeImageUrl && (
                <div>
                  <p className="font-medium mb-2">Store Image</p>
                  <img 
                    src={store.storeImageUrl} 
                    alt={store.businessName} 
                    className="rounded-md shadow-sm max-w-full h-auto"
                  />
                </div>
              )}

              <div>
                <p className="font-medium mb-2">Verification Document</p>
                <DocumentViewer 
                  documentKey={store.documentKey} 
                  fallbackUrl={store.verificationDocUrl} 
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Submitted on {new Date(store.createdAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            Status: {store.isApproved ? 'Approved' : 'Pending Approval'}
          </p>
        </div>
      </div>
    </div>
  );
}