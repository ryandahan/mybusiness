import axios from 'axios';

type GeocodeResult = {
  latitude: number;
  longitude: number;
};

export async function getGeocode(address: string): Promise<GeocodeResult> {
  try {
    // Using OpenStreetMap's Nominatim service (free, but has usage limits)
    // For production, consider a paid service like Google Maps or Mapbox
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'Store Transitions App' // Required by Nominatim's terms
      }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    }
    
    throw new Error('Address not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    // Return default coordinates if geocoding fails
    return {
      latitude: 40.7128, // Default to NYC
      longitude: -74.0060,
    };
  }
}