// src/types/store.ts

export interface StoreData {
  id: string;
  businessName: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  storeType?: 'opening' | 'closing';
  closingDate?: string;
  openingDate?: string;
  discountPercentage?: number | null;
  specialOffers?: string;
  inventoryDescription: string;
  reasonForTransition?: string;
  ownerName: string;
  contactPreference: 'email' | 'phone';
  storeImageUrl?: string;
  verificationDocUrl?: string;
  latitude: number | null;
  longitude: number | null;
  isDefaultLocation?: boolean; // Added property for geocoding status
  isApproved: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

// Simplified interface for admin dashboard and listing views
export interface Store {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  storeType?: 'opening' | 'closing';
  closingDate?: string;
  openingDate?: string;
  discountPercentage?: number | null;
  isApproved: boolean;
  isFeatured?: boolean;
  createdAt: string;
  source?: string;
  latitude?: number | null; // Added for map functionality
  longitude?: number | null; // Added for map functionality
  isDefaultLocation?: boolean; // Added for geocoding status
}

// Interface for shopper submissions
export interface StoreTip {
  id: string;
  storeName: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  submitterEmail: string;
  storeType?: 'opening' | 'closing';
  openingDate?: string;
  discountPercentage?: number | null;
  specialOffers?: string;
  storeImageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefaultLocation?: boolean; // Added for geocoding status
  status: string;
  createdAt: string;
}