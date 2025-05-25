"use client"

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tag, Calendar, MapPin, Phone, ExternalLink, Clock, Store, PlusCircle } from 'lucide-react';
import { StoreData } from '@/types/store';

// Dynamically import Leaflet components with no SSR
const LeafletComponents = dynamic(
  () => import('./LeafletComponents'),
  { ssr: false } // This is key - prevents server-side rendering
);

interface StoreMarkerProps {
  store: StoreData;
}

// Calculate days remaining until closing/opening
const getDaysRemaining = (date: string | null): number | null => {
  if (!date) return null;
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const StoreMarker: React.FC<StoreMarkerProps> = ({ store }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Don't render marker for online stores
  if (store.isOnlineStore || store.storeType === 'online') {
    return null;
  }
  
  const isOpeningStore = store.storeType === 'opening';
  const closingDays = getDaysRemaining(store.closingDate || null);
  const openingDays = getDaysRemaining(store.openingDate || null);
  
  // Format the relevant date
  const relevantDate = isOpeningStore ? store.openingDate : store.closingDate;
  const formattedDate = relevantDate ? new Date(relevantDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : '';
  
  // Get time status
  const getTimeStatus = () => {
    if (isOpeningStore && openingDays !== null) {
      return {
        text: openingDays > 0 
          ? `Opens in ${openingDays} days` 
          : openingDays === 0
            ? 'Opening today!'
            : 'Now open!',
        color: 'text-green-600',
        icon: <Clock size={16} className="text-green-500" />
      };
    }
    
    if (!isOpeningStore && closingDays !== null) {
      return {
        text: closingDays > 0 
          ? `${closingDays} days left` 
          : 'Closing today!',
        color: 'text-amber-600',
        icon: <Clock size={16} className="text-amber-500" />
      };
    }
    
    return null;
  };
  
  const timeStatus = getTimeStatus();
  
  return (
    <LeafletComponents 
      store={store}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      formattedDate={formattedDate}
    />
  );
};

export default StoreMarker;