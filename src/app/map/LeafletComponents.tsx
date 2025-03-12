"use client"

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Tag, Calendar, MapPin, Phone, ExternalLink } from 'lucide-react';
import { Store } from '../../data/mockStores';

interface LeafletComponentsProps {
  store: Store;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  formattedDate: string;
}

const LeafletComponents: React.FC<LeafletComponentsProps> = ({ 
  store, 
  isOpen, 
  setIsOpen, 
  formattedDate 
}) => {
  return (
    <Marker 
      position={[store.coordinates.lat, store.coordinates.lng]}
      eventHandlers={{
        click: () => setIsOpen(true),
      }}
    >
      <Popup
        eventHandlers={{
          popupclose: () => setIsOpen(false)
        }}
      >
        <div className="p-1 max-w-xs">
          <h3 className="font-bold text-lg mb-1">{store.name}</h3>
          
          <div className="mb-2 flex items-center text-sm">
            <Tag size={14} className="mr-1 text-blue-500" />
            <span className="text-gray-600">{store.category}</span>
            <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
              {store.currentDiscount}% OFF
            </span>
          </div>
          
          <div className="mb-2 flex items-center text-sm">
            <MapPin size={14} className="mr-1 text-gray-500 flex-shrink-0" />
            <span className="text-gray-600 truncate">
              {store.address.street}, {store.address.city}, {store.address.state}
            </span>
          </div>
          
          <div className="mb-3 flex items-center text-sm">
            <Calendar size={14} className="mr-1 text-gray-500" />
            <span className="text-gray-600">Closing: {formattedDate}</span>
          </div>
          
          <div className="border-t pt-2 flex justify-between">
            <a 
              href={`tel:${store.contact.phone}`}
              className="text-blue-500 flex items-center text-sm"
            >
              <Phone size={14} className="mr-1" />
              Call
            </a>
            
            <a 
              href={`/store/${store.id}`}
              className="text-blue-500 flex items-center text-sm"
            >
              Details
              <ExternalLink size={14} className="ml-1" />
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default LeafletComponents;