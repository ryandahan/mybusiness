"use client"

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { StoreData } from '@/types/store';

// Create a custom dot icon instead of the default marker
const dotIcon = L.divIcon({
  className: 'custom-dot-marker',
  html: '<div style="background-color: #ff4136; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -6]
});

// User location marker
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div style="background-color: #0000ff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MapComponentProps {
  stores: StoreData[];
  onStoreSelect?: (store: StoreData) => void;
  userLocation?: { lat: number; lng: number } | null;
  maxDistance?: number; // Added this prop
}

export default function MapComponent({ 
  stores = [], 
  onStoreSelect, 
  userLocation, 
  maxDistance = 0 // Default value
}: MapComponentProps) {
  const [mapInitialized, setMapInitialized] = useState(false);
  
  useEffect(() => {
    setMapInitialized(true);
  }, []);
  
  // Default center (US center) or user location if available
  const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [39.8283, -98.5795];
  
  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-md">
      {mapInitialized && (
        <MapContainer
          center={[defaultCenter[0], defaultCenter[1]]}
          zoom={userLocation ? 10 : 4}
          style={{ height: '100%', width: '100%' }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Terrain">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.Overlay checked name="Stores">
              <LayerGroup>
                {Array.isArray(stores) && stores.length > 0 ? (
                  stores.map((store) => (
                    <Marker
                      key={store.id}
                      position={[
                        store.latitude || defaultCenter[0], 
                        store.longitude || defaultCenter[1]
                      ]}
                      icon={dotIcon}
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
                ) : null}
              </LayerGroup>
            </LayersControl.Overlay>
            
            {userLocation && (
              <LayersControl.Overlay checked name="Your Location">
                <LayerGroup>
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={userIcon}
                  >
                    <Popup>Your Location</Popup>
                  </Marker>
                </LayerGroup>
              </LayersControl.Overlay>
            )}
          </LayersControl>
          
          {mapInitialized && stores.length === 0 && userLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-md shadow-md z-[1000]">
              <p>No stores available to display within {maxDistance} miles</p>
            </div>
          )}
        </MapContainer>
      )}
    </div>
  );
}