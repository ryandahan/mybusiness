import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, Shield, Search, File, ExternalLink } from 'lucide-react';

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-md">
        <nav className="flex justify-between h-16">
          <div className="flex flex-shrink-0 flex-1 justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 ml-4">
                <ArrowLeft size={20} className="mr-2" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800 px-4">Store Transitions</Link>
            </div>
            <div className="w-32"></div> {/* Empty space for balance */}
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Store Verification Process
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Our Verification Process</h2>
          
          <p className="text-gray-600 mb-6">
            To ensure the accuracy of our listings and protect both shoppers and businesses, 
            all store closings go through our verification process before being displayed publicly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-start mb-3">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <h3 className="font-medium text-lg">Why We Verify</h3>
              </div>
              <ul className="text-gray-600 space-y-2 ml-10">
                <li>Protect consumers from false sales</li>
                <li>Ensure accuracy of closing information</li>
                <li>Prevent fraudulent listings</li>
                <li>Maintain platform integrity</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-start mb-3">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <h3 className="font-medium text-lg">What We Accept</h3>
              </div>
              <ul className="text-gray-600 space-y-2 ml-10">
                <li>Business licenses</li>
                <li>Public closure notices</li>
                <li>Property lease termination documents</li>
                <li>Officially announced closing sales</li>
              </ul>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">Verification Steps</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="h-full w-0.5 bg-blue-200 mx-auto mt-2"></div>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">Submission</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Business owner submits store closing information and documentation.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="h-full w-0.5 bg-blue-200 mx-auto mt-2"></div>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">Initial Review</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Our team reviews the submission for completeness and basic authenticity.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="h-full w-0.5 bg-blue-200 mx-auto mt-2"></div>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">Document Verification</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Verification team checks provided documents against public records and business databases.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  4
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">Approval & Publication</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Once verified, the store listing is published and becomes visible to shoppers.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle size={20} className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-yellow-700 text-sm">
                  Verification typically takes 1-2 business days. Incomplete or suspicious submissions may take longer.
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-3">Need Help?</h3>
          <p className="text-gray-600">
            If you have questions about the verification process or need assistance with your submission, 
            please contact our support team at <a href="mailto:verification@storetransitions.com" className="text-blue-600 hover:underline">verification@storetransitions.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}