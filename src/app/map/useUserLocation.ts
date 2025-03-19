"use client"

import { useState, useEffect } from 'react';

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [manualAddress, setManualAddress] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please enter your address manually.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLoading(false);
      },
      (error) => {
        setLocationError('Unable to get your location. Please enter your address manually for distance filtering.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.lat && data.lng) {
        setUserLocation({
          lat: data.lat,
          lng: data.lng
        });
        setLocationError(null);
      } else {
        throw new Error('Invalid geocoding response');
      }
    } catch (error) {
      setLocationError('Error finding that address. Please try a different one.');
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    userLocation, 
    setUserLocation,
    locationError, 
    isLoading,
    manualAddress,
    setManualAddress,
    geocodeAddress
  };
}