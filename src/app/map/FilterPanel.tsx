"use client"

import React from 'react';
import { Filter, Tag, Calendar, MapPin, Search } from 'lucide-react';

// Define the props type with searchQuery added
interface FilterPanelProps {
  filters: {
    storeType: 'closing' | 'opening' | 'all';
    category: string;
    minDiscount: number;
    maxDistance: number;
    closingBefore: string;
    searchQuery: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    storeType: 'closing' | 'opening' | 'all';
    category: string;
    minDiscount: number;
    maxDistance: number;
    closingBefore: string;
    searchQuery: string;
  }>>;
}

// Store categories for filtering
const storeCategories = [
  "All Categories",
  "Clothing & Apparel",
  "Electronics",
  "Home Goods",
  "Furniture",
  "Sporting Goods",
  "Toys & Games",
  "Books & Media",
  "Jewelry",
  "Grocery",
  "Department Store",
  "Hardware",
  "Pet Supplies", 
  "Office Supplies",
  "Beauty & Cosmetics",
  "Restaurant",
  "Other"
];

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Filter size={20} className="mr-2 text-blue-500" />
        <h2 className="text-xl font-semibold">Filters</h2>
      </div>
      
      <div className="space-y-4">
        {/* Search within results */}
        {!filters.searchQuery && (
          <div>
            <label className="flex items-center mb-2 text-sm font-medium">
              <Search size={16} className="mr-2 text-gray-500" />
              Search in Map
            </label>
            <input
              type="text"
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleChange}
              placeholder="Search stores, categories, items..."
              className="w-full p-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Category filter */}
        <div>
          <label className="flex items-center mb-2 text-sm font-medium">
            <Tag size={16} className="mr-2 text-gray-500" />
            Store Category
          </label>
          <select 
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">All Categories</option>
            {storeCategories.map(category => (
              <option key={category} value={category === "All Categories" ? "" : category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {/* Discount filter - only show for closing stores or all stores */}
        {(filters.storeType === 'closing' || filters.storeType === 'all') && (
          <div>
            <label className="flex items-center mb-2 text-sm font-medium">
              <Tag size={16} className="mr-2 text-gray-500" />
              Minimum Discount
            </label>
            <div className="flex items-center">
              <input
                type="range"
                name="minDiscount"
                min="0"
                max="90"
                step="10"
                value={filters.minDiscount}
                onChange={handleChange}
                className="w-full"
              />
              <span className="ml-2 text-blue-600 font-medium">{filters.minDiscount}%</span>
            </div>
          </div>
        )}
        
        {/* Distance filter */}
        <div>
          <label className="flex items-center mb-2 text-sm font-medium">
            <MapPin size={16} className="mr-2 text-gray-500" />
            Maximum Distance
          </label>
          <div className="flex items-center">
            <input
              type="range"
              name="maxDistance"
              min="10"
              max="500"
              step="10"
              value={filters.maxDistance}
              onChange={handleChange}
              className="w-full"
            />
            <span className="ml-2 text-blue-600 font-medium">{filters.maxDistance} mi</span>
          </div>
        </div>
        
        {/* Date filter - dynamically change label based on store type */}
        <div>
          <label className="flex items-center mb-2 text-sm font-medium">
            <Calendar size={16} className="mr-2 text-gray-500" />
            {filters.storeType === 'opening' 
              ? 'Opening Before' 
              : filters.storeType === 'closing'
                ? 'Closing Before'
                : 'Date Before'}
          </label>
          <input
            type="date"
            name="closingBefore"
            value={filters.closingBefore}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Search results info */}
        {filters.searchQuery && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center text-sm text-orange-800">
              <Search size={14} className="mr-2" />
              <span>Showing results for: <strong>"{filters.searchQuery}"</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;