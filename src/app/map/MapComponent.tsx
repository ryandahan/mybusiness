"use client"

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { StoreData } from '@/types/store';

// Fix Leaflet marker icon issues in Next.js
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapComponentProps {
  stores: StoreData[];
  onStoreSelect?: (store: StoreData) => void;
}

export default function MapComponent({ stores = [], onStoreSelect }: MapComponentProps) {
  const [mapInitialized, setMapInitialized] = useState(false);
  
  useEffect(() => {
    // Handle dynamic import of Leaflet in client-side only
    setMapInitialized(true);
    
    // Fix icons for Leaflet in Next.js
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/marker-icon-2x.png',
      iconUrl: '/marker-icon.png',
      shadowUrl: '/marker-shadow.png',
    });
  }, []);
  
  // Default center (US center)
  const defaultCenter = [39.8283, -98.5795];
  
  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-md">
      {mapInitialized && (
        <MapContainer
          center={[defaultCenter[0], defaultCenter[1]]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => console.log('Map ready')}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {Array.isArray(stores) && stores.length > 0 ? (
            stores.map((store) => (
              <Marker
                key={store.id}
                position={[
                  store.latitude || defaultCenter[0], 
                  store.longitude || defaultCenter[1]
                ]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    if (onStoreSelect) {
                      onStoreSelect(store);
                    }
                  }
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-lg">{store.businessName}</h3>
                    <p className="text-sm text-gray-600">{store.category}</p>
                    <p className="mt-1">
                      {store.address}, {store.city}, {store.state} {store.zipCode}
                    </p>
                    <p className="mt-2 text-red-600 font-bold">
                      {store.discountPercentage}% OFF
                    </p>
                    <p className="text-sm text-gray-600">
                      Closing on: {new Date(store.closingDate).toLocaleDateString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))
          ) : (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-md shadow-md z-[1000]">
              <p>No stores available to display</p>
            </div>
          )}
        </MapContainer>
      )}
    </div>
  );
}