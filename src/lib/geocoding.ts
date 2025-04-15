import axios from 'axios';

type GeocodeResult = {
  latitude: number;
  longitude: number;
  isDefaultLocation: boolean;
  formattedAddress?: string;
  error?: string;
};

/**
 * Clean and format address for more accurate geocoding
 */
function cleanAddress(address: string): string {
  return address
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s,.-]/g, ''); // Remove special characters except comma, period, hyphen
}

/**
 * Geocode an address to coordinates
 */
export async function getGeocode(address: string): Promise<GeocodeResult> {
  try {
    // Validate input to prevent empty queries
    if (!address || address.trim() === '') {
      console.warn('Empty address provided, using default coordinates');
      return {
        latitude: 40.7128, // Default to NYC
        longitude: -74.0060,
        isDefaultLocation: true,
        error: 'Empty address provided'
      };
    }

    const cleanedAddress = cleanAddress(address);
    console.log(`Attempting to geocode: "${cleanedAddress}"`);

    // Using OpenStreetMap's Nominatim service
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cleanedAddress,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'Store Transitions App' // Required by Nominatim's terms
      }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      console.log(`Geocoding successful for "${cleanedAddress}"`);
      console.log(`Found: ${result.display_name}`);
      console.log(`Coordinates: ${result.lat}, ${result.lon}`);
      
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        isDefaultLocation: false,
        formattedAddress: result.display_name
      };
    }
    
    console.warn(`Address not found: "${cleanedAddress}", using default coordinates`);
    return {
      latitude: 40.7128, // Default to NYC
      longitude: -74.0060,
      isDefaultLocation: true,
      error: 'Address not found in geocoding service'
    };
  } catch (error) {
    console.error('Geocoding error:', error instanceof Error ? error.message : error);
    return {
      latitude: 40.7128, // Default to NYC
      longitude: -74.0060,
      isDefaultLocation: true,
      error: error instanceof Error ? error.message : 'Unknown geocoding error'
    };
  }
}

/**
 * Geocode an address string with components
 */
export async function geocodeAddressComponents(
  street: string,
  city: string,
  state: string,
  zip: string
): Promise<GeocodeResult> {
  // Combine components into a well-formatted address
  const formattedAddress = `${street}, ${city}, ${state} ${zip}`;
  return getGeocode(formattedAddress);
}

/**
 * Validate an address before submission
 */
export function validateAddress(
  street: string,
  city: string,
  state: string,
  zip: string
): { valid: boolean; message?: string } {
  if (!street || street.trim() === '') {
    return { valid: false, message: 'Street address is required' };
  }
  
  if (!city || city.trim() === '') {
    return { valid: false, message: 'City is required' };
  }
  
  if (!state || state.trim() === '') {
    return { valid: false, message: 'State is required' };
  }
  
  // Basic US zip code validation
  if (!zip || !/^\d{5}(-\d{4})?$/.test(zip.trim())) {
    return { valid: false, message: 'Please enter a valid 5-digit ZIP code' };
  }
  
  return { valid: true };
}