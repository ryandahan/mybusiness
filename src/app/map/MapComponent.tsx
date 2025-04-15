"use client"

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { StoreData } from '@/types/store';

// Create a marker icon based on discount percentage
const createMarkerIcon = (discountPercentage: number) => {
  // Determine color based on discount
  let bgColor = '#1A82C5'; // Default blue
  
  if (discountPercentage >= 70) bgColor = '#CF0000'; // Deep red
  else if (discountPercentage >= 50) bgColor = '#FF4136'; // Red
  else if (discountPercentage >= 30) bgColor = '#FF851B'; // Orange
  else if (discountPercentage >= 10) bgColor = '#3D9970'; // Green
  
  return L.divIcon({
    className: 'custom-discount-marker',
    html: `
      <div style="
        background-color: ${bgColor}; 
        color: white;
        width: 30px; 
        height: 30px; 
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 10px;
        border-radius: 50%; 
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        ${discountPercentage}%
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Create icon for stores with default coordinates
const createDefaultLocationIcon = (discountPercentage: number) => {
  return L.divIcon({
    className: 'default-location-marker',
    html: `
      <div style="
        background-color: #888888; 
        color: white;
        width: 30px; 
        height: 30px; 
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 10px;
        border-radius: 50%; 
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: #FF4136;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid white;
        "></div>
        ${discountPercentage}%
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

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
  maxDistance?: number;
}

export default function MapComponent({ 
  stores = [], 
  onStoreSelect, 
  userLocation, 
  maxDistance = 0
}: MapComponentProps) {
  const [mapInitialized, setMapInitialized] = useState(false);
  const [defaultLocationStores, setDefaultLocationStores] = useState<StoreData[]>([]);
  const [geocodedStores, setGeocodedStores] = useState<StoreData[]>([]);
  
  // Sort stores into those with default coordinates and those with real ones
  useEffect(() => {
    if (!Array.isArray(stores)) return;
    
    const defaultStores: StoreData[] = [];
    const realStores: StoreData[] = [];
    
    stores.forEach(store => {
      // Check if store has isDefaultLocation flag
      if (store.isDefaultLocation) {
        defaultStores.push(store);
      } else {
        realStores.push(store);
      }
    });
    
    setDefaultLocationStores(defaultStores);
    setGeocodedStores(realStores);
  }, [stores]);
  
  useEffect(() => {
    setMapInitialized(true);
  }, []);
  
  // Default center (US center) or user location if available
  const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [39.8283, -98.5795];
  
  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-md relative">
      {/* Warning about stores with unverified locations */}
      {defaultLocationStores.length > 0 && (
        <div className="min-w-[200px] absolute top-0 left-0 right-0 z-[1000] bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-xs">
          ⚠️ This store's location couldn't be verified and may not be accurate.
        </div>
      )}
      
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
                {Array.isArray(geocodedStores) && geocodedStores.length > 0 && geocodedStores.map((store) => {
                  // Skip if latitude or longitude is null
                  if (store.latitude === null || store.longitude === null) {
                    return null;
                  }
                  
                  return (
                    <Marker
                      key={store.id}
                      position={[store.latitude, store.longitude]}
                      icon={createMarkerIcon(store.discountPercentage || 0)}
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
                          {store.closingDate && (
                            <p className="text-sm text-gray-600">
                              Closing on: {new Date(store.closingDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                
                {/* Stores with default/unverified locations */}
                {Array.isArray(defaultLocationStores) && defaultLocationStores.length > 0 && defaultLocationStores.map((store) => {
                  // Skip if latitude or longitude is null
                  if (store.latitude === null || store.longitude === null) {
                    return null;
                  }
                  
                  return (
                    <Marker
                      key={store.id}
                      position={[store.latitude, store.longitude]}
                      icon={createDefaultLocationIcon(store.discountPercentage || 0)}
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
                          <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-xs">
                            ⚠️ This store's location couldn't be verified and may not be accurate.
                          </div>
                          <h3 className="font-bold text-lg">{store.businessName}</h3>
                          <p className="text-sm text-gray-600">{store.category}</p>
                          <p className="mt-1">
                            {store.address}, {store.city}, {store.state} {store.zipCode}
                          </p>
                          <p className="mt-2 text-red-600 font-bold">
                            {store.discountPercentage}% OFF
                          </p>
                          {store.closingDate && (
                            <p className="text-sm text-gray-600">
                              Closing on: {new Date(store.closingDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
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