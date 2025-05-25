"use client"

import React, { useState, useEffect, ReactElement } from 'react';
import { MapPin, Clock, Tag, List, Map, Globe, Store, PlusCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { StoreData } from '@/types/store';

// Calculate days remaining until closing/opening
const getDaysRemaining = (date: string | null): number | null => {
  if (!date) return null;
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get appropriate store type icon
const getStoreTypeIcon = (storeType: string | undefined, isOnlineStore: boolean) => {
  if (isOnlineStore) return <Globe size={16} className="text-blue-500 mr-1" />;
  if (storeType === 'opening') return <PlusCircle size={16} className="text-green-500 mr-1" />;
  return <Store size={16} className="text-red-500 mr-1" />;
};

// Store Card Component
const StoreCard = ({ store }: { store: StoreData }): ReactElement => {
  const isOnlineStore = store.isOnlineStore || store.storeType === 'online';
  const isOpeningStore = store.storeType === 'opening';
  const closingDays = getDaysRemaining(store.closingDate || null);
  const openingDays = getDaysRemaining(store.openingDate || null);
  
  const getTimeInfo = () => {
    if (isOnlineStore) {
      return (
        <div className="flex items-center">
          <Globe size={16} className="text-blue-500 mr-1" />
          <p className="text-sm font-medium text-blue-600">Online Store</p>
        </div>
      );
    }
    
    if (isOpeningStore && openingDays !== null) {
      return (
        <div className="flex items-center">
          <Clock size={16} className="text-green-500 mr-1" />
          <p className="text-sm font-medium">
            {openingDays > 0 
              ? `Opens in ${openingDays} days` 
              : openingDays === 0
                ? 'Opening today!'
                : 'Now open!'}
          </p>
        </div>
      );
    }
    
    if (closingDays !== null) {
      return (
        <div className="flex items-center">
          <Clock size={16} className="text-amber-500 mr-1" />
          <p className="text-sm font-medium">
            {closingDays > 0 
              ? `${closingDays} days left` 
              : 'Closing today!'}
          </p>
        </div>
      );
    }
    
    return null;
  };

  const getDiscountBadge = () => {
    if (!store.discountPercentage) return null;
    
    const badgeColor = isOnlineStore 
      ? 'bg-blue-600' 
      : isOpeningStore 
        ? 'bg-green-600' 
        : 'bg-red-600';
    
    return (
      <div className={`absolute top-0 right-0 ${badgeColor} text-white px-3 py-1 font-bold rounded-bl-lg`}>
        {store.discountPercentage}% OFF
      </div>
    );
  };

  const getLocationInfo = () => {
    if (isOnlineStore) {
      return store.website ? (
        <div className="flex items-center">
          <ExternalLink size={16} className="text-gray-500 mr-1" />
          <a 
            href={store.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm truncate hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {store.website.replace(/^https?:\/\//, '')}
          </a>
        </div>
      ) : (
        <div className="flex items-center">
          <Globe size={16} className="text-gray-500 mr-1" />
          <p className="text-gray-700 text-sm">Online Business</p>
        </div>
      );
    }
    
    const address = store.address && store.city && store.state 
      ? `${store.address}, ${store.city}, ${store.state}`
      : 'Address not available';
      
    return (
      <div className="flex items-center">
        <MapPin size={16} className="text-gray-500 mr-1" />
        <p className="text-gray-700 text-sm truncate">{address}</p>
      </div>
    );
  };
  
  return (
    <Link href={`/stores/${store.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          {store.storeImageUrl ? (
            <img 
              src={store.storeImageUrl} 
              alt={store.businessName} 
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {getStoreTypeIcon(store.storeType, isOnlineStore)}
              <span className="text-gray-500 ml-2">{isOnlineStore ? 'Online Store' : 'Store Image'}</span>
            </div>
          )}
          {getDiscountBadge()}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg truncate">{store.businessName}</h3>
              <p className="text-gray-600 text-sm">{store.category}</p>
            </div>
            {getStoreTypeIcon(store.storeType, isOnlineStore)}
          </div>
          
          {getLocationInfo()}
          
          <div className="flex justify-between items-center mt-4">
            {getTimeInfo()}
            <div className="flex items-center">
              <Tag size={16} className="text-green-600 mr-1" />
              <p className="text-sm font-medium">
                {isOnlineStore 
                  ? 'Online deals' 
                  : isOpeningStore 
                    ? 'Grand opening' 
                    : 'Everything must go'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Simple Map Component
const SimpleMap = ({ stores }: { stores: StoreData[] }): ReactElement => {
  const physicalStores = stores.filter(store => !store.isOnlineStore && store.latitude && store.longitude);
  const onlineStores = stores.filter(store => store.isOnlineStore);
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-blue-50 p-4 h-full min-h-96">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MapPin size={48} className="mx-auto text-blue-500 mb-4" />
          <p className="text-gray-700">
            Map view: {physicalStores.length} physical stores
          </p>
          {onlineStores.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              + {onlineStores.length} online stores (not shown on map)
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Integration with mapping library would show physical store locations
          </p>
        </div>
      </div>
    </div>
  );
};

// Filter bar component
const FilterBar = ({ 
  onCategoryChange, 
  onStoreTypeChange,
  selectedCategory,
  selectedStoreType 
}: { 
  onCategoryChange: (category: string) => void;
  onStoreTypeChange: (storeType: string) => void;
  selectedCategory: string;
  selectedStoreType: string;
}): ReactElement => {
  
  const categories = ['All', 'Clothing & Apparel', 'Electronics', 'Home Goods', 'Books & Media', 'Sporting Goods', 'Jewelry', 'Restaurant'];
  const storeTypes = [
    { value: 'all', label: 'All Stores', icon: List },
    { value: 'closing', label: 'Closing', icon: Store },
    { value: 'opening', label: 'Opening', icon: PlusCircle },
    { value: 'online', label: 'Online', icon: Globe }
  ];
  
  return (
    <div className="space-y-4 mb-6">
      {/* Store Type Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Store Type</h3>
        <div className="flex flex-wrap gap-2">
          {storeTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button 
                key={type.value}
                onClick={() => onStoreTypeChange(type.value)}
                className={`flex items-center px-4 py-2 rounded-full shadow-sm text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  selectedStoreType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IconComponent size={16} className="mr-2" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button 
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-full shadow-sm text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Store Explorer Component
const StoreExplorer = (): ReactElement => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStoreType, setSelectedStoreType] = useState<string>('all');
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stores from API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (selectedStoreType !== 'all') {
          if (selectedStoreType === 'online') {
            params.append('isOnlineStore', 'true');
          } else {
            params.append('storeType', selectedStoreType);
            params.append('isOnlineStore', 'false');
          }
        }
        
        if (selectedCategory !== 'All') {
          params.append('category', selectedCategory);
        }
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`/api/stores${queryString}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        
        const data = await response.json();
        setStores(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [selectedCategory, selectedStoreType]);

  const getPageTitle = () => {
    if (selectedStoreType === 'online') return 'Online Stores';
    if (selectedStoreType === 'opening') return 'Opening Stores';
    if (selectedStoreType === 'closing') return 'Closing Stores';
    return 'All Stores';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{getPageTitle()}</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <List size={20} />
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Map size={20} />
          </button>
        </div>
      </div>

      <FilterBar 
        onCategoryChange={setSelectedCategory}
        onStoreTypeChange={setSelectedStoreType}
        selectedCategory={selectedCategory}
        selectedStoreType={selectedStoreType}
      />
      
      {stores.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {selectedStoreType === 'online' ? <Globe size={48} className="mx-auto" /> : <Store size={48} className="mx-auto" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or check back later for new listings.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <SimpleMap stores={stores} />
      )}
      
      {stores.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          Showing {stores.length} store{stores.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default StoreExplorer;