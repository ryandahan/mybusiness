"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Building, Tag, Phone, Mail, ArrowLeft } from 'lucide-react';
import heic2any from 'heic2any';

interface StoreData {
  id: string;
  businessName: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  storeType: 'opening' | 'closing';
  closingDate: string;
  openingDate: string;
  discountPercentage: string;
  inventoryDescription: string;
  reasonForTransition: string;
  ownerName: string;
  contactPreference: 'email' | 'phone';
  storeImageUrl: string | null;
  isFeatured: boolean;
}

export default function EditStoreClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [storeImage, setStoreImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch store data
  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/stores/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch store data');
        }
        
        const data = await res.json();
        
        // Ensure all string fields have default values
        const formattedData = {
          ...data,
          businessName: data.businessName || '',
          category: data.category || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          storeType: data.storeType || 'closing',
          closingDate: data.closingDate || '',
          openingDate: data.openingDate || '',
          discountPercentage: data.discountPercentage?.toString() || '',
          inventoryDescription: data.inventoryDescription || '',
          reasonForTransition: data.reasonForTransition || '',
          ownerName: data.ownerName || '',
          contactPreference: data.contactPreference || 'email',
          isFeatured: !!data.isFeatured
        };
        
        setStoreData(formattedData);
        
        if (data.storeImageUrl) {
          setImagePreview(data.storeImageUrl);
        }
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('Could not load store data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!storeData) return;
    
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setStoreData({
        ...storeData,
        [name]: checked
      });
    } else {
      setStoreData({
        ...storeData,
        [name]: value
      });
    }
  };

  // Process HEIC images
  const processImageFile = async (file: File): Promise<File> => {
    if (file && (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic')) {
      try {
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setStoreImage(null);
      setImagePreview(storeData?.storeImageUrl || null);
      return;
    }
    
    try {
      const file = e.target.files[0];
      const processedFile = await processImageFile(file);
      setStoreImage(processedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Error processing image. Please try a different file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      
      // Append all store data
      Object.entries(storeData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Append the new image if provided
      if (storeImage) {
        formData.append('storeImage', storeImage);
      }
      
      const response = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update store');
      }
      
      setSuccess('Store updated successfully!');
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/my-stores');
      }, 1500);
    } catch (error) {
      console.error('Error updating store:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading store data...</div>;
  }

  if (!storeData) {
    return <div className="p-4 text-center">Store not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link href="/my-stores" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft size={16} className="mr-1" />
        <span>Back to store details</span>
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">Edit Store: {storeData.businessName}</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
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
              value={storeData.businessName}
              onChange={handleChange}
              required
              className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={storeData.category}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Category</option>
            <option value="Clothing & Apparel">Clothing & Apparel</option>
            <option value="Electronics">Electronics</option>
            <option value="Home Goods">Home Goods</option>
            <option value="Furniture">Furniture</option>
            <option value="Books & Media">Books & Media</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MapPin size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              id="address"
              name="address"
              value={storeData.address}
              onChange={handleChange}
              required
              className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={storeData.city}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={storeData.state}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={storeData.zipCode}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Phone size={18} className="text-gray-500" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={storeData.phone}
                onChange={handleChange}
                required
                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
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
                value={storeData.email}
                onChange={handleChange}
                required
                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={storeData.website || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">
            Store Status
          </p>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="storeType"
                value="closing"
                checked={storeData.storeType === 'closing'}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Closing Store</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="storeType"
                value="opening"
                checked={storeData.storeType === 'opening'}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Opening Store</span>
            </label>
          </div>
        </div>
        
        {storeData.storeType === 'closing' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700 mb-1">
                Closing Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={18} className="text-gray-500" />
                </div>
                <input
                  type="date"
                  id="closingDate"
                  name="closingDate"
                  value={storeData.closingDate || ''}
                  onChange={handleChange}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Tag size={18} className="text-gray-500" />
                </div>
                <input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  value={storeData.discountPercentage || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="openingDate" className="block text-sm font-medium text-gray-700 mb-1">
              Opening Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar size={18} className="text-gray-500" />
              </div>
              <input
                type="date"
                id="openingDate"
                name="openingDate"
                value={storeData.openingDate || ''}
                onChange={handleChange}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="inventoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Inventory Description
          </label>
          <textarea
            id="inventoryDescription"
            name="inventoryDescription"
            value={storeData.inventoryDescription || ''}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="reasonForTransition" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for {storeData.storeType === 'closing' ? 'Closing' : 'Opening'}
          </label>
          <textarea
            id="reasonForTransition"
            name="reasonForTransition"
            value={storeData.reasonForTransition || ''}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
            Owner Name
          </label>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={storeData.ownerName || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="contactPreference" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Preference
          </label>
          <select
            id="contactPreference"
            name="contactPreference"
            value={storeData.contactPreference || 'email'}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Image
          </label>
          
          {imagePreview && (
            <div className="mb-2">
              <img 
                src={imagePreview} 
                alt="Store preview" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
          
          <input
            type="file"
            id="storeImage"
            name="storeImage"
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/gif,image/webp,.heic,.HEIC"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPEG, PNG, GIF, WEBP, HEIC (iPhone photos)
          </p>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={storeData.isFeatured || false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
            Feature this store (highlight on homepage)
          </label>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}