"use client"

import { useState, useEffect } from 'react';

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [manualAddress, setManualAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

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

  // Fetch address suggestions as the user types
  useEffect(() => {
    const fetchAddressSuggestions = async () => {
      if (!manualAddress || manualAddress.length < 3) {
        setAddressSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setIsFetchingSuggestions(true);
        const response = await fetch(`/api/address-suggestions?q=${encodeURIComponent(manualAddress)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch address suggestions');
        }
        
        const data = await response.json();
        setAddressSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setAddressSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    };

    // Debounce the suggestions to avoid too many API calls
    const timeoutId = setTimeout(fetchAddressSuggestions, 300);
    
    return () => clearTimeout(timeoutId);
  }, [manualAddress]);

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
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: { display_name: string; lat: string; lon: string }) => {
    setManualAddress(suggestion.display_name);
    setUserLocation({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    setShowSuggestions(false);
    setLocationError(null);
  };

  return { 
    userLocation, 
    setUserLocation,
    locationError, 
    isLoading,
    manualAddress,
    setManualAddress,
    geocodeAddress,
    addressSuggestions,
    showSuggestions,
    setShowSuggestions,
    isFetchingSuggestions,
    selectSuggestion
  };
}