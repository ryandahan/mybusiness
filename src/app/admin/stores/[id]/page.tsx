'use client'

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Phone, Mail, Calendar, Tag, MapPin, Image as ImageIcon, Globe } from 'lucide-react';
import DocumentViewer from '@/components/DocumentViewer';

interface StoreDetails {
  id: string;
  businessName: string;
  storeName?: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string | null;
  storeType: string;
  closingDate?: string;
  openingDate?: string;
  discountPercentage?: number;
  specialOffers?: string;
  inventoryDescription?: string;
  reasonForClosing?: string | null;
  reasonForTransition?: string | null;
  ownerName?: string;
  contactPreference?: string;
  storeImageUrl?: string | null;
  storeImages?: string[];
  verificationDocUrl?: string | null;
  documentKey?: string;
  latitude?: number | null;
  longitude?: number | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  isStoreTip?: boolean;
  submitterEmail?: string;
  notes?: string;
  promotionEndDate?: string;
  isOnlineStore?: boolean;
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
      setLoading(true);
      const response = await fetch(`/api/admin/stores/${storeId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load store details: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process notes field to extract additional data
      if (data.notes && typeof data.notes === 'string') {
        try {
          const parsedNotes = JSON.parse(data.notes);
          // Add parsed data to the store object
          if (parsedNotes.openingDate) {
            data.openingDate = parsedNotes.openingDate;
          }
          if (parsedNotes.specialOffers) {
            data.specialOffers = parsedNotes.specialOffers;
          }
          if (parsedNotes.discountPercentage) {
            data.discountPercentage = parsedNotes.discountPercentage;
          }
          if (parsedNotes.promotionEndDate) {
            data.promotionEndDate = parsedNotes.promotionEndDate;
          }
        } catch (error) {
          console.error('Error parsing notes:', error);
        }
      }
      
      setStore(data);
    } catch (error) {
      console.error('Error fetching store details:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
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
      } else {
        throw new Error(`Failed to approve store: ${response.status}`);
      }
    } catch (error) {
      console.error('Error approving store:', error);
      alert('Failed to approve store. Please try again.');
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
        } else {
          throw new Error(`Failed to reject store: ${response.status}`);
        }
      } catch (error) {
        console.error('Error rejecting store:', error);
        alert('Failed to reject store. Please try again.');
      }
    }
  };

  // Function to create a Google Maps URL from an address
  const getGoogleMapsUrl = (address: string, city: string, state: string, zipCode: string): string => {
    const formattedAddress = encodeURIComponent(`${address}, ${city}, ${state} ${zipCode}`);
    return `https://www.google.com/maps/search/?api=1&query=${formattedAddress}`;
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

  const isOpeningStore = store.storeType === 'opening';
  const isOnlineStore = store.storeType === 'online' || store.isOnlineStore;
  const isShopperSubmission = store.isStoreTip === true;
  const businessName = store.businessName || store.storeName || '';

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
          <h1 className="text-2xl font-bold">{businessName}</h1>
          <p className="text-gray-500">{store.category}</p>
          <div className="flex gap-2 mt-2">
            {isShopperSubmission && (
              <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded inline-block">
                Submitted by Shopper
              </div>
            )}
            {isOnlineStore && (
              <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded inline-block">
                Online Store
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Store Information</h2>
            <div className="space-y-3">
              {/* Show website for online stores, address for physical stores */}
              {isOnlineStore && store.website ? (
                <div className="flex">
                  <Globe size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href={store.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      {store.website}
                    </a>
                  </div>
                </div>
              ) : !isOnlineStore && store.address && (
                <div className="flex">
                  <MapPin size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <a 
                      href={getGoogleMapsUrl(store.address, store.city, store.state, store.zipCode)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      {store.address}, {store.city}, {store.state} {store.zipCode}
                    </a>
                  </div>
                </div>
              )}
              
              {!isShopperSubmission && store.phone ? (
                <>
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

                  {/* Show website for physical stores if available */}
                  {!isOnlineStore && store.website && (
                    <div className="flex">
                      <Globe size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {store.website}
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {store.submitterEmail && (
                    <div className="flex">
                      <Mail size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Submitter Email</p>
                        <p>{store.submitterEmail}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">
              {isOpeningStore ? "Opening Details" : isOnlineStore ? "Promotion Details" : "Closing Details"}
            </h2>
            <div className="space-y-3">
              {isOpeningStore ? (
                // Opening store details
                <>
                  {store.openingDate && (
                    <div className="flex">
                      <Calendar size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Opening Date</p>
                        <p>{new Date(store.openingDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {store.discountPercentage && (
                    <div className="flex">
                      <Tag size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Opening Discount</p>
                        <p className="text-green-600 font-bold">{store.discountPercentage}% OFF</p>
                      </div>
                    </div>
                  )}
                  
                  {store.promotionEndDate && (
                    <div className="flex">
                      <Calendar size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Promotion Ends</p>
                        <p className="text-orange-600 font-medium">{new Date(store.promotionEndDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {store.specialOffers && (
                    <div>
                      <p className="font-medium">Special Offers</p>
                      <p className="mt-1 bg-gray-50 p-3 rounded-md">{store.specialOffers}</p>
                    </div>
                  )}
                </>
              ) : isOnlineStore ? (
                // Online store details
                <>
                  {store.discountPercentage && (
                    <div className="flex">
                      <Tag size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Discount</p>
                        <p className="text-green-600 font-bold">{store.discountPercentage}% OFF</p>
                      </div>
                    </div>
                  )}
                  
                  {(store.promotionEndDate || store.closingDate) && (
                    <div className="flex">
                      <Calendar size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Promotion Ends</p>
                        <p className="text-orange-600 font-medium">
                          {new Date(store.promotionEndDate || store.closingDate || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {store.specialOffers && (
                    <div>
                      <p className="font-medium">Special Offers</p>
                      <p className="mt-1 bg-gray-50 p-3 rounded-md">{store.specialOffers}</p>
                    </div>
                  )}
                </>
              ) : (
                // Closing store details
                <>
                  {store.closingDate && (
                    <div className="flex">
                      <Calendar size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Closing Date</p>
                        <p>{new Date(store.closingDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {store.discountPercentage && (
                    <div className="flex">
                      <Tag size={18} className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Discount</p>
                        <p className="text-red-600 font-bold">{store.discountPercentage}% OFF</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {store.inventoryDescription && (
                <div>
                  <p className="font-medium">
                    {isOpeningStore ? "Business Description" : isOnlineStore ? "Promotion Description" : "Inventory Description"}
                  </p>
                  <p className="mt-1 bg-gray-50 p-3 rounded-md">{store.inventoryDescription}</p>
                </div>
              )}

              {(isOpeningStore && store.reasonForTransition) || (!isOpeningStore && !isOnlineStore && store.reasonForClosing) ? (
                <div>
                  <p className="font-medium">
                    Reason for {isOpeningStore ? "Opening" : "Closing"}
                  </p>
                  <p className="mt-1 bg-gray-50 p-3 rounded-md">
                    {isOpeningStore ? store.reasonForTransition : store.reasonForClosing}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {!isShopperSubmission && store.ownerName && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-3">Owner Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Owner Name</p>
                <p>{store.ownerName}</p>
              </div>
              {store.contactPreference && (
                <div>
                  <p className="font-medium">Preferred Contact Method</p>
                  <p className="capitalize">{store.contactPreference}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Display Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Uploaded Files</h2>
          
          {/* Handle images from storeImages array */}
          {store.storeImages && store.storeImages.length > 0 ? (
            <div>
              <p className="font-medium mb-2">Store Images</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {store.storeImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={imageUrl}
                      alt={`${businessName} - Image ${index + 1}`}
                      className="rounded-md shadow-sm w-full h-auto object-cover"
                      onError={(e) => {
                        console.error(`Image failed to load: ${imageUrl}`);
                        e.currentTarget.src = '/placeholder-store.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : store.storeImageUrl ? (
            <div>
              <p className="font-medium mb-2">Store Image</p>
              <div className="relative">
                <img 
                  src={store.storeImageUrl}
                  alt={businessName}
                  className="rounded-md shadow-sm max-w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    console.error(`Image failed to load: ${store.storeImageUrl}`);
                    e.currentTarget.src = '/placeholder-store.jpg';
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md">
              <div className="text-center text-gray-500">
                <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                <p>No store images available</p>
              </div>
            </div>
          )}

          {/* Verification Document Display */}
          {store.verificationDocUrl && !isShopperSubmission && (
            <div className="mt-6">
              <p className="font-medium mb-2">Verification Document</p>
              <DocumentViewer 
                documentKey={store.documentKey || store.verificationDocUrl} 
                fallbackUrl={store.verificationDocUrl} 
              />
            </div>
          )}
        </div>

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