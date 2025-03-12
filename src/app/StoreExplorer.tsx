import React, { useState, ReactElement } from 'react';
import { MapPin, Clock, Tag, List, Map } from 'lucide-react';
import Link from 'next/link';

// Define interfaces for TypeScript
interface StoreData {
  id: string;
  name: string;
  category: string;
  discountPercentage: number;
  closingDate: string;
  address: string;
  coordinates: { lat: number; lng: number };
  image: string;
}

// Mock data for demonstration
const mockStores: StoreData[] = [
  {
    id: '1',
    name: 'Fashion Outlet',
    category: 'Clothing',
    discountPercentage: 50,
    closingDate: '2025-04-15',
    address: '123 Main St, Anytown, USA',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    image: '/api/placeholder/300/200'
  },
  {
    id: '2',
    name: 'Electronics World',
    category: 'Electronics',
    discountPercentage: 40,
    closingDate: '2025-03-30',
    address: '456 Tech Ave, Digitown, USA',
    coordinates: { lat: 40.7148, lng: -74.0040 },
    image: '/api/placeholder/300/200'
  },
  {
    id: '3',
    name: 'Home Essentials',
    category: 'Home Goods',
    discountPercentage: 60,
    closingDate: '2025-05-01',
    address: '789 Decor Blvd, Homesville, USA',
    coordinates: { lat: 40.7168, lng: -74.0080 },
    image: '/api/placeholder/300/200'
  },
  {
    id: '4',
    name: 'Bookworm Paradise',
    category: 'Books',
    discountPercentage: 70,
    closingDate: '2025-03-20',
    address: '321 Reading Rd, Literaryville, USA',
    coordinates: { lat: 40.7188, lng: -74.0100 },
    image: '/api/placeholder/300/200'
  },
  {
    id: '5',
    name: 'Sports Central',
    category: 'Sporting Goods',
    discountPercentage: 45,
    closingDate: '2025-04-10',
    address: '555 Athletic Dr, Sportstown, USA',
    coordinates: { lat: 40.7208, lng: -74.0120 },
    image: '/api/placeholder/300/200'
  }
];

// Calculate days remaining until closing
const getDaysRemaining = (closingDate: string): number => {
  const now = new Date();
  const closing = new Date(closingDate);
  const diffTime = closing.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Store Card Component
const StoreCard = ({ store }: { store: StoreData }): ReactElement => {
  const daysRemaining = getDaysRemaining(store.closingDate);
  
  return (
    <Link href={`/store/${store.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img 
            src={store.image} 
            alt={store.name} 
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 font-bold rounded-bl-lg">
            {store.discountPercentage}% OFF
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg">{store.name}</h3>
          <p className="text-gray-600 text-sm">{store.category}</p>
          
          <div className="flex items-center mt-2">
            <MapPin size={16} className="text-gray-500 mr-1" />
            <p className="text-gray-700 text-sm truncate">{store.address}</p>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <Clock size={16} className="text-amber-500 mr-1" />
              <p className="text-sm font-medium">
                {daysRemaining > 0 
                  ? `${daysRemaining} days left` 
                  : 'Closing today!'}
              </p>
            </div>
            <div className="flex items-center">
              <Tag size={16} className="text-green-600 mr-1" />
              <p className="text-sm font-medium">Everything must go</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Simple Map Component
const SimpleMap = ({ stores }: { stores: StoreData[] }): ReactElement => {
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-blue-50 p-4 h-full min-h-96">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MapPin size={48} className="mx-auto text-blue-500 mb-4" />
          <p className="text-gray-700">Map view would show {stores.length} stores</p>
          <p className="text-sm text-gray-500 mt-2">
            Integration with a mapping library like Google Maps or Mapbox would go here
          </p>
        </div>
      </div>
    </div>
  );
};

// Filter bar component
const FilterBar = ({ onCategoryChange }: { onCategoryChange: (category: string) => void }): ReactElement => {
  const categories = ['All', 'Clothing', 'Electronics', 'Home Goods', 'Books', 'Sporting Goods'];
  
  return (
    <div className="overflow-x-auto pb-2 mb-4">
      <div className="flex space-x-2">
        {categories.map((category) => (
          <button 
            key={category}
            onClick={() => onCategoryChange(category)}
            className="px-4 py-2 bg-white rounded-full shadow-sm text-sm whitespace-nowrap hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Store Explorer Component
const StoreExplorer = (): ReactElement => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const filteredStores = selectedCategory === 'All' 
    ? mockStores 
    : mockStores.filter(store => store.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Closing Stores</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
          >
            <List size={20} />
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
          >
            <Map size={20} />
          </button>
        </div>
      </div>

      <FilterBar onCategoryChange={setSelectedCategory} />
      
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <SimpleMap stores={filteredStores} />
      )}
    </div>
  );
};

export default StoreExplorer;