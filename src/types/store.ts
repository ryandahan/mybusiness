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
  closingDate: string;
  discountPercentage: number | null;  // Updated to allow null
  inventoryDescription: string;
  reasonForClosing?: string;
  ownerName: string;
  contactPreference: 'email' | 'phone';
  storeImageUrl?: string;
  latitude: number | null;  // Allow null for incomplete coordinates
  longitude: number | null;
  isApproved: boolean;
  createdAt: string;
  source?: string;  // Added source field to identify shopper vs. store owner submissions
}

// Simplified interface for admin dashboard and listing views
export interface Store {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  closingDate: string;
  discountPercentage: number | null;
  isApproved: boolean;
  createdAt: string;
  source?: string;
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
  discountPercentage?: number | null;
  storeImageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  createdAt: string;
}