"use client"
import React, { useState, useEffect, ChangeEvent, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, MapPin, Building, Tag, Image, Phone, Mail, Info, Check, User, Store, PlusCircle, ArrowLeft, X, Globe } from 'lucide-react';
// Remove the direct import: import heic2any from 'heic2any';
import { geocodeAddressComponents } from '@/lib/geocoding';

// Add heic2any as a dynamic import
let heic2any: any = null;
if (typeof window !== 'undefined') {
  import('heic2any').then((module) => {
    heic2any = module.default;
  });
}

interface FormData {
  businessName: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  storeType: 'opening' | 'closing' | 'online';  // Added 'online'
  isOnlineStore: boolean;  // Added for online store flag
  closingDate: string;
  openingDate: string;
  discountPercentage: string;
  specialOffers: string;
  inventoryDescription: string;
  reasonForTransition: string;
  ownerName: string;
  contactPreference: 'email' | 'phone';
  storeImage: File | null;
  storeImages: File[];
  verificationDocuments: File | null;
  agreedToTerms: boolean;
}

interface GuestTipData {
  storeName: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website: string;  // Added for online stores
  storeImage: File | null;
  storeImages: File[];
  submitterEmail: string;
  discountPercentage: string;
  storeType: 'opening' | 'closing' | 'online';  // Added 'online'
  isOnlineStore: boolean;  // Added for online store flag
  openingDate: string;
  specialOffers: string;
  promotionEndDate: string;
}

function SubmitPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStoreType = (searchParams?.get('type') as 'opening' | 'closing' | 'online') || 'closing';
  
  const [userType, setUserType] = useState<'undecided' | 'owner' | 'guest'>('undecided');
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    category: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    storeType: initialStoreType,
    isOnlineStore: initialStoreType === 'online',  // Auto-set for online stores
    closingDate: '',
    openingDate: '',
    discountPercentage: '',
    specialOffers: '',
    inventoryDescription: '',
    reasonForTransition: '',
    ownerName: '',
    contactPreference: 'email',
    storeImage: null,
    storeImages: [],
    verificationDocuments: null,
    agreedToTerms: false
  });
  
  const [guestTipData, setGuestTipData] = useState<GuestTipData>({
    storeName: '',
    category: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',  // Added for online stores
    storeImage: null,
    storeImages: [],
    submitterEmail: '',
    discountPercentage: '',
    storeType: initialStoreType,
    isOnlineStore: initialStoreType === 'online',  // Auto-set for online stores
    openingDate: '',
    specialOffers: '',
    promotionEndDate: ''
  });
  
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addressWarning, setAddressWarning] = useState<string | null>(null);
  
  const categories = [
    'Clothing & Apparel',
    'Electronics',
    'Home Goods',
    'Furniture',
    'Books & Media',
    'Sporting Goods',
    'Toys & Games',
    'Jewelry',
    'Health & Beauty',
    'Grocery',
    'Restaurant',
    'Other'
  ];

  useEffect(() => {
    if (status === 'authenticated') {
      const isAdmin = session?.user?.role === 'admin';
      
      if (isAdmin) {
        setUserType('undecided');
      } else {
        setUserType('owner');
      }
    }
  }, [status, session]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (['address', 'city', 'state', 'zipCode'].includes(name)) {
      setAddressWarning(null);
    }
  };

  const handleGuestTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGuestTipData({
      ...guestTipData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Convert HEIC to JPEG if needed
  const processImageFile = async (file: File): Promise<File> => {
    if (file && (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic')) {
      try {
        if (!heic2any) {
          // If heic2any isn't loaded yet, wait for it
          const module = await import('heic2any');
          heic2any = module.default;
        }
        
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        }) as Blob;
        
        return new File(
          [convertedBlob], 
          file.name.replace(/\.heic$/i, '.jpg'), 
          { type: 'image/jpeg' }
        );
      } catch (error) {
        console.error('Error converting HEIC file:', error);
        throw new Error('Failed to convert HEIC image. Please try a different format.');
      }
    }
    return file;
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) {
      if (name === 'storeImages') {
        setFormData({
          ...formData,
          storeImages: []
        });
      } else {
        setFormData({
          ...formData,
          [name]: null
        });
      }
      return;
    }
    
    try {
      if (name === 'storeImages') {
        const processedFiles: File[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const processedFile = await processImageFile(files[i]);
          processedFiles.push(processedFile);
        }
        
        setFormData({
          ...formData,
          storeImages: processedFiles
        });
      } else if (name === 'storeImage') {
        const file = await processImageFile(files[0]);
        setFormData({
          ...formData,
          [name]: file
        });
      } else {
        setFormData({
          ...formData,
          [name]: files[0]
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error processing file. Please try a different file format.');
    }
  };

  const handleGuestFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) {
      if (name === 'storeImages') {
        setGuestTipData({
          ...guestTipData,
          storeImages: []
        });
      } else {
        setGuestTipData({
          ...guestTipData,
          [name]: null
        });
      }
      return;
    }
    
    try {
      if (name === 'storeImages') {
        const processedFiles: File[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const processedFile = await processImageFile(files[i]);
          processedFiles.push(processedFile);
        }
        
        setGuestTipData({
          ...guestTipData,
          storeImages: processedFiles
        });
      } else if (name === 'storeImage') {
        const file = await processImageFile(files[0]);
        setGuestTipData({
          ...guestTipData,
          [name]: file
        });
      } else {
        setGuestTipData({
          ...guestTipData,
          [name]: files[0]
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error processing file. Please try a different file format.');
    }
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleStoreTypeChange = (type: 'opening' | 'closing' | 'online') => {
    setFormData({
      ...formData,
      storeType: type,
      isOnlineStore: type === 'online'
    });
  };

  const handleGuestStoreTypeChange = (type: 'opening' | 'closing' | 'online') => {
    setGuestTipData({
      ...guestTipData,
      storeType: type,
      isOnlineStore: type === 'online'
    });
  };
  
  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      storeImages: formData.storeImages.filter((_, i) => i !== index)
    });
  };
  
  const removeGuestImage = (index: number) => {
    setGuestTipData({
      ...guestTipData,
      storeImages: guestTipData.storeImages.filter((_, i) => i !== index)
    });
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setAddressWarning(null);
    
    try {
      const submitData = new FormData();
      
      submitData.append('businessName', formData.businessName);
      submitData.append('category', formData.category);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('storeType', formData.storeType);
      submitData.append('isOnlineStore', formData.isOnlineStore.toString());
      
      // Handle online vs physical store fields
      if (formData.isOnlineStore) {
        // For online stores, website is required
        if (!formData.website) {
          throw new Error('Website URL is required for online stores');
        }
        submitData.append('website', formData.website);
        // Set address fields to empty for online stores
        submitData.append('address', '');
        submitData.append('city', '');
        submitData.append('state', '');
        submitData.append('zipCode', '');
      } else {
        // For physical stores, address is required
        if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
          throw new Error('Address fields are required for physical stores');
        }
        submitData.append('address', formData.address);
        submitData.append('city', formData.city);
        submitData.append('state', formData.state);
        submitData.append('zipCode', formData.zipCode);
        if (formData.website) {
          submitData.append('website', formData.website);
        }
      }
      
      if (formData.storeType === 'closing') {
        submitData.append('closingDate', formData.closingDate);
        submitData.append('discountPercentage', formData.discountPercentage);
      } else if (formData.storeType === 'opening') {
        submitData.append('openingDate', formData.openingDate);
        submitData.append('specialOffers', formData.specialOffers);
      } else if (formData.storeType === 'online') {
        // Online stores might have special offers or discount
        if (formData.specialOffers) {
          submitData.append('specialOffers', formData.specialOffers);
        }
        if (formData.discountPercentage) {
          submitData.append('discountPercentage', formData.discountPercentage);
        }
      }
      
      submitData.append('inventoryDescription', formData.inventoryDescription);
      
      if (formData.reasonForTransition) {
        submitData.append('reasonForTransition', formData.reasonForTransition);
      }
      
      submitData.append('ownerName', formData.ownerName);
      submitData.append('contactPreference', formData.contactPreference);
      
      formData.storeImages.forEach((file, index) => {
        submitData.append('storeImages', file);
      });
      
      if (formData.storeImage) {
        submitData.append('storeImage', formData.storeImage);
      }
      
      if (formData.verificationDocuments) {
        submitData.append('verificationDocuments', formData.verificationDocuments);
      }
      
      // Only geocode if it's a physical store
      if (!formData.isOnlineStore) {
        try {
          const geocodeResult = await geocodeAddressComponents(
            formData.address,
            formData.city,
            formData.state,
            formData.zipCode
          );
          
          submitData.append('latitude', geocodeResult.latitude.toString());
          submitData.append('longitude', geocodeResult.longitude.toString());
          submitData.append('isDefaultLocation', geocodeResult.isDefaultLocation.toString());
          
          if (geocodeResult.isDefaultLocation) {
            setAddressWarning("We couldn't verify this address on the map. Your store will be listed but may not appear at the correct location.");
            console.warn("Using default location for store, address could not be geocoded");
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
          submitData.append('latitude', '40.7128');
          submitData.append('longitude', '-74.0060');
          submitData.append('isDefaultLocation', 'true');
          setAddressWarning("We couldn't verify this address on the map. Your store will be listed but may not appear at the correct location.");
        }
      }
      
      console.log('Submitting form data...');
      
      const response = await fetch('/api/stores', {
        method: 'POST',
        body: submitData
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Non-JSON response:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit store');
      }
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting store:', error);
      setIsSubmitting(false);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleGuestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setAddressWarning(null);
    
    try {
      const submitData = new FormData();
      
      submitData.append('storeName', guestTipData.storeName);
      submitData.append('category', guestTipData.category);
      submitData.append('submitterEmail', guestTipData.submitterEmail);
      submitData.append('storeType', guestTipData.storeType);
      submitData.append('isOnlineStore', guestTipData.isOnlineStore.toString());
      
      // Handle online vs physical store fields
      if (guestTipData.isOnlineStore) {
        if (guestTipData.website) {
          submitData.append('website', guestTipData.website);
        }
      } else {
        submitData.append('address', guestTipData.address);
        submitData.append('city', guestTipData.city);
        submitData.append('state', guestTipData.state);
        submitData.append('zipCode', guestTipData.zipCode);
      }
      
      if (guestTipData.storeType === 'closing') {
        submitData.append('discountPercentage', guestTipData.discountPercentage);
      } else {
        submitData.append('openingDate', guestTipData.openingDate);
        submitData.append('specialOffers', guestTipData.specialOffers);
        if (guestTipData.discountPercentage) {
          submitData.append('discountPercentage', guestTipData.discountPercentage);
        }
        if (guestTipData.promotionEndDate) {
          submitData.append('promotionEndDate', guestTipData.promotionEndDate);
        }
      }
      
      guestTipData.storeImages.forEach((file, index) => {
        submitData.append('storeImages', file);
      });
      
      if (guestTipData.storeImage) {
        submitData.append('storeImage', guestTipData.storeImage);
      }
      
      // Only geocode if it's a physical store
      if (!guestTipData.isOnlineStore) {
        try {
          const geocodeResult = await geocodeAddressComponents(
            guestTipData.address,
            guestTipData.city,
            guestTipData.state,
            guestTipData.zipCode
          );
          
          submitData.append('latitude', geocodeResult.latitude.toString());
          submitData.append('longitude', geocodeResult.longitude.toString());
          submitData.append('isDefaultLocation', geocodeResult.isDefaultLocation.toString());
          
          if (geocodeResult.isDefaultLocation) {
            setAddressWarning("We couldn't verify this address on the map. The store tip will be submitted but may not appear at the correct location.");
            console.warn("Using default location for store tip, address could not be geocoded");
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
          submitData.append('latitude', '40.7128');
          submitData.append('longitude', '-74.0060');
          submitData.append('isDefaultLocation', 'true');
          setAddressWarning("We couldn't verify this address on the map. The store tip will be submitted but may not appear at the correct location.");
        }
      }
      
      console.log('Submitting guest tip data...');
      
      const response = await fetch('/api/store-tips', {
        method: 'POST',
        body: submitData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit store tip');
      }
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting store tip:', error);
      setIsSubmitting(false);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };
  
  const nextStep = () => setFormStep(formStep + 1);
  const prevStep = () => setFormStep(formStep - 1);
  
  const BackToHomeButton = () => (
    <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
      <ArrowLeft size={16} className="mr-1" />
      <span>Back to Home</span>
    </Link>
  );
  
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <BackToHomeButton />
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-lg text-gray-600 mb-6">
            {userType === 'owner' 
              ? `Your ${formData.storeType} ${formData.isOnlineStore ? 'online ' : ''}store has been submitted successfully. Our team will review your information and contact you within 1-2 business days.`
              : `Your ${guestTipData.storeType} ${guestTipData.isOnlineStore ? 'online ' : ''}store tip has been submitted successfully. Our team will review the information.`}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormStep(1);
                if (userType === 'owner') {
                  setFormData({
                    businessName: '',
                    category: '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    phone: '',
                    email: '',
                    website: '',
                    storeType: initialStoreType,
                    isOnlineStore: initialStoreType === 'online',
                    closingDate: '',
                    openingDate: '',
                    discountPercentage: '',
                    specialOffers: '',
                    inventoryDescription: '',
                    reasonForTransition: '',
                    ownerName: '',
                    contactPreference: 'email',
                    storeImage: null,
                    storeImages: [],
                    verificationDocuments: null,
                    agreedToTerms: false
                  });
                } else {
                  setGuestTipData({
                    storeName: '',
                    category: '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    website: '',
                    storeImage: null,
                    storeImages: [],
                    submitterEmail: '',
                    discountPercentage: '',
                    storeType: initialStoreType,
                    isOnlineStore: initialStoreType === 'online',
                    openingDate: '',
                    specialOffers: '',
                    promotionEndDate: ''
                  });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {userType === 'owner' ? 'Submit Another Store' : 'Submit Another Tip'}
            </button>
            
            <Link 
              href="/" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'undecided') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <BackToHomeButton />
        <h1 className="text-2xl font-bold text-center mb-6">
          Submit Your Store
        </h1>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800">
            Please select how you would like to proceed:
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div 
            onClick={() => {
              if (status === 'unauthenticated') {
                router.push('/login?callbackUrl=/submit');
              } else {
                setUserType('owner');
              }
            }} 
            className="border rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <div className="flex justify-center mb-4">
              <Store size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">I'm a Store Owner</h3>
            <p className="text-gray-600 text-center">
              Submit your physical store or online business for approval and listing on our platform.
            </p>
            <p className="text-sm text-blue-600 font-medium text-center mt-4">
              {status === 'unauthenticated' ? '(Requires account login)' : ''}
            </p>
          </div>
          
          <div 
            onClick={() => setUserType('guest')} 
            className="border rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <div className="flex justify-center mb-4">
              <User size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">I'm a Shopper</h3>
            <p className="text-gray-600 text-center">
              Let us know about a store or online business you've found to help others discover deals.
            </p>
            <p className="text-sm text-blue-600 font-medium text-center mt-4">
              No account required
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'owner' && status === 'unauthenticated') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <BackToHomeButton />
        <h1 className="text-2xl font-bold text-center mb-6">
          Authentication Required
        </h1>
        
        <div className="p-8 bg-blue-50 border border-blue-200 rounded-lg text-center mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Please create an account or sign in
          </h2>
          <p className="text-gray-700 mb-6">
            You need to have an account and be logged in to submit your store for listing.
            This helps us verify store ownership and manage your listings.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create an Account
            </Link>
            <Link 
              href="/login?callbackUrl=/submit" 
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setUserType('undecided')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (userType === 'guest') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <BackToHomeButton />
        <h1 className="text-2xl font-bold text-center mb-6">
          Submit a Store Tip
        </h1>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        
        {addressWarning && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
            ⚠️ {addressWarning}
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-md font-medium text-gray-700 mb-3">What type of store are you reporting?</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleGuestStoreTypeChange('closing')}
              className={`py-3 px-4 rounded-md border-2 flex flex-col items-center justify-center gap-2 ${
                guestTipData.storeType === 'closing' 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Store size={20} />
              <span className="text-sm">Closing Store</span>
            </button>
            <button
              type="button"
              onClick={() => handleGuestStoreTypeChange('opening')}
              className={`py-3 px-4 rounded-md border-2 flex flex-col items-center justify-center gap-2 ${
                guestTipData.storeType === 'opening' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PlusCircle size={20} />
              <span className="text-sm">Opening Store</span>
            </button>
            <button
              type="button"
              onClick={() => handleGuestStoreTypeChange('online')}
              className={`py-3 px-4 rounded-md border-2 flex flex-col items-center justify-center gap-2 ${
                guestTipData.storeType === 'online' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Globe size={20} />
              <span className="text-sm">Online Store</span>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleGuestSubmit}>
          <div className="mb-4">
            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
              Store Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Building size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={guestTipData.storeName}
                onChange={handleGuestTextChange}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Fashion Outlet"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Tag size={18} className="text-gray-500" />
              </div>
              <select
                id="category"
                name="category"
                value={guestTipData.category}
                onChange={handleGuestTextChange}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Conditional fields based on store type */}
          {guestTipData.isOnlineStore ? (
            <div className="mb-4">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Globe size={18} className="text-gray-500" />
                </div>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={guestTipData.website}
                  onChange={handleGuestTextChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={guestTipData.address}
                    onChange={handleGuestTextChange}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main St"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={guestTipData.city}
                    onChange={handleGuestTextChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Anytown"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="mb-4">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={guestTipData.state}
                      onChange={handleGuestTextChange}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="CA"
                      maxLength={2}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={guestTipData.zipCode}
                      onChange={handleGuestTextChange}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="90210"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Type-specific fields */}
          {guestTipData.storeType === 'closing' ? (
            <div className="mb-4">
              <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Discount Percentage (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Tag size={18} className="text-gray-500" />
                </div>
                <input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  value={guestTipData.discountPercentage}
                  onChange={handleGuestTextChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 50"
                  min={1}
                  max={100}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">If you know the discount percentage, please enter it here.</p>
            </div>
          ) : guestTipData.storeType === 'opening' ? (
            <>
              <div className="mb-4">
                <label htmlFor="openingDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Opening Date (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar size={18} className="text-gray-500" />
                  </div>
                  <input
                    type="date"
                    id="openingDate"
                    name="openingDate"
                    value={guestTipData.openingDate}
                    onChange={handleGuestTextChange}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="specialOffers" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Offers (Optional)
                </label>
                <textarea
                  id="specialOffers"
                  name="specialOffers"
                  value={guestTipData.specialOffers}
                  onChange={handleGuestTextChange}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe any opening specials or promotions..."
                />
              </div>
            </>
          ) : (
            // Online store specific fields
            <div className="mb-4">
              <label htmlFor="specialOffers" className="block text-sm font-medium text-gray-700 mb-1">
                Current Promotions (Optional)
              </label>
              <textarea
                id="specialOffers"
                name="specialOffers"
                value={guestTipData.specialOffers}
                onChange={handleGuestTextChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe any current promotions or discounts..."
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="submitterEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input
                type="email"
                id="submitterEmail"
                name="submitterEmail"
                value={guestTipData.submitterEmail}
                onChange={handleGuestTextChange}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used only to contact you if we need more information.</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="storeImages" className="block text-sm font-medium text-gray-700 mb-1">
              Store Images
            </label>
            <input
              type="file"
              id="storeImages"
              name="storeImages"
              onChange={handleGuestFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp,.heic,.HEIC"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              multiple
            />
            <p className="text-xs text-gray-500 mt-1">You can select multiple images. Supported formats: JPEG, PNG, GIF, WEBP, HEIC (iPhone photos)</p>
            
            {guestTipData.storeImages.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Images:</p>
                <div className="flex flex-wrap gap-2">
                  {guestTipData.storeImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index + 1}`} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGuestImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setUserType('undecided')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Tip'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <BackToHomeButton />
      <h1 className="text-2xl font-bold text-center mb-6">
        Submit Your Store
      </h1>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      
      {addressWarning && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
          ⚠️ {addressWarning}
        </div>
      )}
      
      <div className="mb-6">
        <p className="text-md font-medium text-gray-700 mb-3">What type of store are you submitting?</p>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleStoreTypeChange('closing')}
            className={`py-3 px-4 rounded-md border-2 flex flex-col items-center justify-center gap-2 ${
              formData.storeType === 'closing' 
                ? 'border-red-500 bg-red-50 text-red-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Store size={20} />
            <span className="text-sm">Closing Store</span>
          </button>
          <button
            type="button"
            onClick={() => handleStoreTypeChange('opening')}
            className={`py-3 px-4 rounded-md border-2 flex flex-col items-center justify-center gap-2 ${
              formData.storeType === 'opening' 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <PlusCircle size={20} />
            <span className="text-sm">Opening Store</span>
          </button>
          <button
            type="button"
            onClick={() => handleStoreTypeChange('online')}
            className={`py-3 px-4 rounded-md border-2 flex flex-col items-center justify-center gap-2 ${
              formData.storeType === 'online' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Globe size={20} />
            <span className="text-sm">Online Store</span>
          </button>
        </div>
      </div>
      
      <div className="flex justify-between mb-8">
        <div 
          className={`flex-1 border-b-2 pb-2 ${formStep >= 1 ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-500'}`}
        >
          1. Store Details
        </div>
        <div 
          className={`flex-1 border-b-2 pb-2 ${formStep >= 2 ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-500'}`}
        >
          2. {formData.storeType === 'closing' ? 'Closing' : formData.storeType === 'opening' ? 'Opening' : 'Business'} Information
        </div>
        <div 
          className={`flex-1 border-b-2 pb-2 ${formStep >= 3 ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-500'}`}
        >
          3. Verification
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {formStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Store Details</h2>
            
            <div className="mb-4">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Building size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleTextChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Fashion Outlet"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Tag size={18} className="text-gray-500" />
                </div>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleTextChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Conditional location fields - only show for physical stores */}
            {!formData.isOnlineStore && (
              <>
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPin size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleTextChange}
                      className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main St"
                      required={!formData.isOnlineStore}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleTextChange}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Anytown"
                      required={!formData.isOnlineStore}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="mb-4">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleTextChange}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="CA"
                        maxLength={2}
                        required={!formData.isOnlineStore}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleTextChange}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="90210"
                        required={!formData.isOnlineStore}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone size={18} className="text-gray-500" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleTextChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleTextChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@yourbusiness.com"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website {formData.isOnlineStore && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Globe size={18} className="text-gray-500" />
                </div>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleTextChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.yourbusiness.com"
                  required={formData.isOnlineStore}
                />
              </div>
              {formData.isOnlineStore && (
                <p className="text-xs text-gray-500 mt-1">Website URL is required for online stores</p>
              )}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setUserType('undecided')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next Step
              </button>
            </div>
          </div>
        )}
        
        {formStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {formData.storeType === 'closing' ? 'Closing' : formData.storeType === 'opening' ? 'Opening' : 'Business'} Information
            </h2>
            
            {formData.storeType === 'closing' ? (
              <>
                <div className="mb-4">
                  <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="date"
                      id="closingDate"
                      name="closingDate"
                      value={formData.closingDate}
                      onChange={handleTextChange}
                      className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Tag size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="number"
                      id="discountPercentage"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleTextChange}
                      className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 50"
                      min={1}
                      max={100}
                      required
                    />
                  </div>
                </div>
              </>
            ) : formData.storeType === 'opening' ? (
              <>
                <div className="mb-4">
                  <label htmlFor="openingDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="date"
                      id="openingDate"
                      name="openingDate"
                      value={formData.openingDate}
                      onChange={handleTextChange}
                      className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="specialOffers" className="block text-sm font-medium text-gray-700 mb-1">
                    Special Opening Offers/Events
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <Info size={18} className="text-gray-500" />
                    </div>
                    <textarea
                      id="specialOffers"
                      name="specialOffers"
                      value={formData.specialOffers}
                      onChange={handleTextChange}
                      rows={3}
                      className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe any special offers, discounts, or events for your grand opening..."
                    />
                  </div>
                </div>
              </>
            ) : (
              // Online store specific fields
              <>
                <div className="mb-4">
                  <label htmlFor="specialOffers" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Promotions/Offers
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <Info size={18} className="text-gray-500" />
                    </div>
                    <textarea
                      id="specialOffers"
                      name="specialOffers"
                      value={formData.specialOffers}
                      onChange={handleTextChange}
                      rows={3}
                      className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe any current promotions, discounts, or special offers..."
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Discount Percentage (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Tag size={18} className="text-gray-500" />
                    </div>
                    <input
                      type="number"
                      id="discountPercentage"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleTextChange}
                      className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 20"
                      min={1}
                      max={100}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="mb-4">
              <label htmlFor="inventoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.storeType === 'closing' 
                  ? 'Inventory Description' 
                  : 'Business Description'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <Info size={18} className="text-gray-500" />
                </div>
                <textarea
                  id="inventoryDescription"
                  name="inventoryDescription"
                  value={formData.inventoryDescription}
                  onChange={handleTextChange}
                  rows={3}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.storeType === 'closing' 
                    ? "Describe the inventory items that will be available during the closing sale..."
                    : "Describe the products or services your business offers..."}
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="reasonForTransition" className="block text-sm font-medium text-gray-700 mb-1">
                {formData.storeType === 'closing' ? 'Reason for Closing' : formData.storeType === 'opening' ? 'Reason for Opening' : 'About Your Business'} (Optional)
              </label>
              <textarea
                id="reasonForTransition"
                name="reasonForTransition"
                value={formData.reasonForTransition}
                onChange={handleTextChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.storeType === 'closing' 
                  ? "Share why your store is closing if you'd like..."
                  : formData.storeType === 'opening'
                  ? "Share what inspired you to open this business..."
                  : "Tell us more about your business..."}
              />
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next Step
              </button>
            </div>
          </div>
        )}
        
        {formStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Verification</h2>
            
            <div className="mb-4">
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                Owner/Manager Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleTextChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your full name"
                required
              />
            </div>
            
            <div className="mb-4">
              <p className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Contact Method <span className="text-red-500">*</span>
              </p>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="contactPreference"
                    value="email"
                    checked={formData.contactPreference === 'email'}
                    onChange={handleRadioChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="contactPreference"
                    value="phone"
                    checked={formData.contactPreference === 'phone'}
                    onChange={handleRadioChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Phone</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="storeImages" className="block text-sm font-medium text-gray-700 mb-1">
                Store Images
              </label>
              <input
                type="file"
                id="storeImages"
                name="storeImages"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/webp,.heic,.HEIC"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                multiple
              />
              <p className="text-xs text-gray-500 mt-1">You can select multiple images. {formData.isOnlineStore ? 'Screenshots or product images' : 'Store front or interior photos'}. Supported formats: JPEG, PNG, GIF, WEBP, HEIC (iPhone photos)</p>
              
              {formData.storeImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.storeImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Preview ${index + 1}`} 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="verificationDocuments" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Documents <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="verificationDocuments"
                name="verificationDocuments"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Please upload business license, proof of ownership, or other documents to verify your business.
            </p>
            
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleCheckboxChange}
                  required
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I confirm that I am authorized to submit this {formData.isOnlineStore ? 'online business' : 'store'} and that all information provided is accurate. I understand that verification may be required before listing. <span className="text-red-500">*</span>
                </span>
              </label>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.agreedToTerms}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (isSubmitting || !formData.agreedToTerms) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Store'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
export default function SubmitPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <SubmitPageContent />
    </Suspense>
  );
}