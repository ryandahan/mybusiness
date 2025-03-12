"use client"

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tag, Calendar, MapPin, Phone, ExternalLink } from 'lucide-react';
import { StoreData as Store } from '@/types/store';
// Dynamically import Leaflet components with no SSR
const LeafletComponents = dynamic(
  () => import('./LeafletComponents'),
  { ssr: false } // This is key - prevents server-side rendering
);

interface StoreMarkerProps {
  store: Store;
}

const StoreMarker: React.FC<StoreMarkerProps> = ({ store }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const formattedDate = new Date(store.closingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
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