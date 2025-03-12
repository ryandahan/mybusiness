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
    discountPercentage: number;
    inventoryDescription: string;
    reasonForClosing?: string;
    ownerName: string;
    contactPreference: 'email' | 'phone';
    storeImageUrl?: string;
    latitude: number;
    longitude: number;
    isApproved: boolean;
    createdAt: string;
  }