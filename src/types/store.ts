// src/types/store.ts

export interface StoreData {
  id: string;
  businessName: string;
  category: string;
  address?: string;           // Optional for online stores
  city?: string;              // Optional for online stores
  state?: string;             // Optional for online stores
  zipCode?: string;           // Optional for online stores
  phone: string;
  email: string;
  website?: string;
  storeType?: 'opening' | 'closing' | 'online';  // Added 'online' type
  closingDate?: string;
  openingDate?: string;
  promotionEndDate?: string;
  discountPercentage?: number | null;
  specialOffers?: string;
  inventoryDescription: string;
  reasonForTransition?: string;
  reasonForClosing?: string;  // Added for compatibility
  ownerName: string;
  contactPreference: 'email' | 'phone';
  storeImageUrl?: string;
  verificationDocUrl?: string;
  latitude: number | null;
  longitude: number | null;
  isDefaultLocation?: boolean;
  isApproved: boolean;
  isFeatured?: boolean;
  isOnlineStore?: boolean;    // New field to identify online stores
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  storeImages?: string[];     // For compatibility with map components
  images?: Array<{ id: string; url: string; storeId: string; }>;  // Added for DB relation
  isStoreTip?: boolean;       // Added for admin interface
  submitterEmail?: string;    // Added for admin interface
  notes?: string;            // Added for admin interface
}

// Simplified interface for admin dashboard and listing views
export interface Store {
  id: string;
  businessName: string;
  category: string;
  city?: string;              // Optional for online stores
  state?: string;             // Optional for online stores
  storeType?: 'opening' | 'closing' | 'online';  // Added 'online' type
  closingDate?: string;
  openingDate?: string;
  promotionEndDate?: string;
  discountPercentage?: number | null;
  isApproved: boolean;
  isFeatured?: boolean;
  isOnlineStore?: boolean;    // New field to identify online stores
  createdAt: string;
  source?: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefaultLocation?: boolean;
  website?: string;           // Added for online stores
  address?: string;           // Added for consistency
  phone?: string;             // Added for consistency
  email?: string;             // Added for consistency
  specialOffers?: string;     // Added for consistency
  inventoryDescription?: string;  // Added for consistency
  reasonForClosing?: string;  // Added for consistency
  reasonForTransition?: string;  // Added for consistency
  ownerName?: string;         // Added for consistency
  contactPreference?: string; // Added for consistency
  storeImageUrl?: string | null;  // Added for consistency
  storeImages?: string[];     // Added for consistency
  verificationDocUrl?: string | null;  // Added for consistency
  updatedAt?: string;         // Added for consistency
  userId?: string;            // Added for consistency
  images?: Array<{ id: string; url: string; storeId: string; }>;  // Added for DB relation
  isStoreTip?: boolean;       // Added for admin interface
  submitterEmail?: string;    // Added for admin interface
  notes?: string;            // Added for admin interface
}

// Interface for shopper submissions
export interface StoreTip {
  id: string;
  storeName: string;
  category: string;
  address?: string;           // Optional for online stores
  city?: string;              // Optional for online stores
  state?: string;             // Optional for online stores
  zipCode?: string;           // Optional for online stores
  submitterEmail: string;
  storeType?: 'opening' | 'closing' | 'online';  // Added 'online' type
  openingDate?: string;
  promotionEndDate?: string;
  discountPercentage?: number | null;
  specialOffers?: string;
  storeImageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefaultLocation?: boolean;
  isOnlineStore?: boolean;    // New field to identify online stores
  status: string;
  createdAt: string;
  website?: string;           // Added for online stores
}

// Helper type for form validation and submission
export interface StoreFormData {
  businessName: string;
  category: string;
  storeType: 'opening' | 'closing' | 'online';
  isOnlineStore: boolean;
  
  // Physical store fields (required only if not online)
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Online store fields (required only if online)
  website?: string;
  
  // Common fields
  phone: string;
  email: string;
  inventoryDescription: string;
  ownerName: string;
  contactPreference: 'email' | 'phone';
  
  // Type-specific fields
  closingDate?: string;
  openingDate?: string;
  promotionEndDate?: string;
  discountPercentage?: number;
  specialOffers?: string;
  reasonForTransition?: string;
  
  // File uploads
  storeImages?: File[];
  verificationDocuments?: File;
}

// Type for API responses when fetching stores
export interface StoreResponse {
  stores: StoreData[];
  totalCount: number;
  hasMore: boolean;
}

// Type for search/filter parameters
export interface StoreFilters {
  storeType?: 'opening' | 'closing' | 'online' | 'all';
  category?: string;
  minDiscount?: number;
  maxDistance?: number;
  closingBefore?: string;
  openingBefore?: string;
  searchQuery?: string;
  isOnlineStore?: boolean;
  hasPhysicalLocation?: boolean;
}

// Type for store validation errors
export interface StoreValidationErrors {
  businessName?: string;
  category?: string;
  storeType?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  phone?: string;
  email?: string;
  inventoryDescription?: string;
  ownerName?: string;
  contactPreference?: string;
  closingDate?: string;
  openingDate?: string;
  promotionEndDate?: string;
  discountPercentage?: string;
  general?: string;
}

// Utility type to check if store has physical location
export type PhysicalStore = StoreData & {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  isOnlineStore: false;
};

// Utility type for online stores
export type OnlineStore = StoreData & {
  website: string;
  isOnlineStore: true;
  address?: never;
  city?: never;
  state?: never;
  zipCode?: never;
  latitude: null;
  longitude: null;
};