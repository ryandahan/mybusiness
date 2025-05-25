"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Tag, Store, TrendingUp, Clock, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  storeType: string;
  discountPercentage: number | null;
  closingDate: string | null;
  openingDate: string | null;
  inventoryDescription: string | null;
  specialOffers: string | null;
  isFeatured: boolean;
  storeImageUrl: string | null;
  storeImages: string[];
  matchType: string;
}

const popularSearches = [
  'Electronics', 'Clothing', 'Furniture', 'Books', 'Jewelry', 'Shoes',
  'Home Goods', 'Sporting Goods', 'Toys', 'Beauty', 'Grocery', 'Restaurant'
];

const SearchComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500); // Increased from 300ms to 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults && event.key !== 'Enter') return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          router.push(`/stores/${searchResults[selectedIndex].id}`);
          setShowResults(false);
        } else if (searchQuery.trim()) {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setShowResults(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/map?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
    }
  };

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'business':
        return <Store size={16} className="text-blue-500" />;
      case 'category':
        return <Tag size={16} className="text-green-500" />;
      case 'item':
        return <Search size={16} className="text-purple-500" />;
      case 'location':
        return <MapPin size={16} className="text-red-500" />;
      default:
        return <Search size={16} className="text-gray-500" />;
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'business':
        return 'Store';
      case 'category':
        return 'Category';
      case 'item':
        return 'Item';
      case 'location':
        return 'Location';
      default:
        return 'Match';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          placeholder="Search for stores, categories, or items..."
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-orange-500 focus:ring-0 focus:outline-none bg-white shadow-lg transition-all duration-200"
        />
        
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearchSubmit}
        disabled={!searchQuery.trim()}
        className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
      >
        Search
      </button>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <>
              {searchResults.map((result, index) => (
                <Link
                  key={result.id}
                  href={`/stores/${result.id}`}
                  className={`block px-6 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    index === selectedIndex ? 'bg-orange-50 border-orange-200' : ''
                  }`}
                  onClick={() => setShowResults(false)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getMatchTypeIcon(result.matchType)}
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {getMatchTypeLabel(result.matchType)}
                        </span>
                        {result.isFeatured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            FEATURED
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-gray-900 truncate">
                        {result.businessName}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Tag size={12} className="mr-1" />
                          {result.category}
                        </span>
                        <span className="flex items-center">
                          <MapPin size={12} className="mr-1" />
                          {result.city}, {result.state}
                        </span>
                      </div>
                      
                      {result.inventoryDescription && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {result.inventoryDescription}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end ml-4">
                      {result.storeType === 'closing' && result.discountPercentage && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm mb-1">
                          {result.discountPercentage}% OFF
                        </div>
                      )}
                      
                      {result.storeType === 'opening' && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm mb-1">
                          NEW
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={10} className="mr-1" />
                        {result.storeType === 'closing' && result.closingDate
                          ? `Closes ${new Date(result.closingDate).toLocaleDateString()}`
                          : result.storeType === 'opening' && result.openingDate
                          ? `Opens ${new Date(result.openingDate).toLocaleDateString()}`
                          : 'Active'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleSearchSubmit}
                  className="flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  See all results for "{searchQuery}"
                  <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </>
          ) : searchQuery.length >= 2 && !isSearching ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <Search size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No results found for "{searchQuery}"</p>
              <p className="text-sm mt-1">Try searching for categories like "electronics" or "clothing"</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Popular Searches */}
      {!showResults && searchQuery.length < 2 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Popular searches:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handlePopularSearch(term)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all duration-200"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;