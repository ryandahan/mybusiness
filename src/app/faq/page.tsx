import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <h3 className="text-lg font-medium">How does DiscountsMaps work?</h3>
                <ChevronDown className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                <p>DiscountsMaps connects shoppers with businesses that are closing. Store owners list their closing stores with details like location, closing dates, and discount information. Shoppers can search and filter stores based on their preferences.</p>
              </div>
            </details>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <h3 className="text-lg font-medium">Is it free to list my store?</h3>
                <ChevronDown className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                <p>Yes, basic store listings are completely free. We also offer premium features for store owners who want enhanced visibility and marketing support during their closing process.</p>
              </div>
            </details>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <h3 className="text-lg font-medium">How quickly will my store be listed?</h3>
                <ChevronDown className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                <p>Once submitted, our team reviews each listing for accuracy and completeness. Most stores are approved and listed within 24-48 hours after submission.</p>
              </div>
            </details>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <h3 className="text-lg font-medium">Can I update my store information after listing?</h3>
                <ChevronDown className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                <p>Absolutely! You can log in to your account at any time to update discount percentages, closing dates, inventory details, or any other information about your store.</p>
              </div>
            </details>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <h3 className="text-lg font-medium">How does distance filtering work?</h3>
                <ChevronDown className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                <p>Our distance filtering uses your current location (with your permission) to show stores within your specified radius. If location access is unavailable, you can enter a location manually to filter stores by distance.</p>
              </div>
            </details>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <Link href="/contact" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}