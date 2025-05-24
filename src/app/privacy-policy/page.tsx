"use client"

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Shield, Lock, Eye, FileText, Bell, UserCheck, RefreshCw } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <Lock className="text-blue-600 mr-2" size={28} />
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: April 9, 2025</p>
        </div>
      </section>
      
      {/* Content */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="mb-4">
              At DiscountsMaps, we respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our 
              website and services.
            </p>
            <p className="mb-4">
              By using our platform, you consent to the collection and use of information in accordance with this policy.
              We may change this policy from time to time, so please check this page periodically for updates.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <div className="flex items-center mb-4">
              <FileText className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold">Information We Collect</h2>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
            <p className="mb-4">
              We may collect personal information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-2">
              <li>Contact information (name, email address, phone number)</li>
              <li>Account information (username, password)</li>
              <li>Business information (business name, address, closing dates, discount information)</li>
              <li>Profile information (preferences, saved stores)</li>
              <li>Payment information (for store owners listing their businesses)</li>
              <li>Communications you send to us</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Automatically Collected Information</h3>
            <p className="mb-4">
              When you access or use our services, we automatically collect:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-2">
              <li>Usage data (pages visited, time spent, actions taken)</li>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Location information (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <div className="flex items-center mb-4">
              <Eye className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold">How We Use Your Information</h2>
            </div>
            
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-8 mb-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Connect shoppers with closing stores</li>
              <li>Send notifications about store closings and discount updates</li>
              <li>Respond to comments, questions, and requests</li>
              <li>Send technical notices, updates, security alerts, and support messages</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address fraud and other illegal activities</li>
              <li>Personalize and improve your experience</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <div className="flex items-center mb-4">
              <UserCheck className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold">Sharing Your Information</h2>
            </div>
            
            <p className="mb-4">
              We may share your personal information with:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-2">
              <li>Store owners when you express interest in their closing sales</li>
              <li>Service providers who perform services on our behalf</li>
              <li>Professional advisors (lawyers, accountants, insurers)</li>
              <li>In response to a legal request if required by law</li>
              <li>In connection with a business transfer (merger, acquisition, sale of assets)</li>
            </ul>
            
            <p className="mb-4">
              We do not sell your personal information to third parties for marketing purposes.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <div className="flex items-center mb-4">
              <Shield className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold">Data Security</h2>
            </div>
            
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information from unauthorized 
              access, alteration, disclosure, or destruction. These measures include internal reviews of our data 
              collection, storage, and processing practices and security measures, as well as physical security 
              measures to guard against unauthorized access to systems.
            </p>
            
            <p className="mb-4">
              While we strive to use commercially acceptable means to protect your personal information, 
              we cannot guarantee its absolute security. Any transmission of personal information is at your own risk.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <div className="flex items-center mb-4">
              <Bell className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold">Your Choices</h2>
            </div>
            
            <p className="mb-4">
              You have several choices regarding the information we collect and how it's used:
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Account Information</h3>
            <p className="mb-4">
              You can review and update your account information by logging into your account. You can also 
              delete your account at any time.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Cookies</h3>
            <p className="mb-4">
              Most web browsers are set to accept cookies by default. You can usually set your browser to remove 
              or reject cookies. Note that removing or rejecting cookies could affect the availability and functionality 
              of our services.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Promotional Communications</h3>
            <p className="mb-4">
              You can opt out of receiving promotional emails from us by following the instructions in those emails. 
              If you opt out, we may still send you non-promotional emails, such as those about your account or ongoing 
              business relations.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Location Information</h3>
            <p className="mb-4">
              You can prevent us from collecting location information by disabling location services on your device, 
              but doing so may limit your ability to use certain features of our services.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <div className="flex items-center mb-4">
              <RefreshCw className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold">Changes to This Privacy Policy</h2>
            </div>
            
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting 
              the new privacy policy on this page and updating the "Last updated" date at the top of this policy.
            </p>
            
            <p className="mb-4">
              You are advised to review this privacy policy periodically for any changes. Changes to this 
              privacy policy are effective when they are posted on this page.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy or our practices, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2"><strong>Email:</strong> privacy@storetransitions.com</p>
              <p className="mb-2"><strong>Address:</strong> 123 Retail Avenue, Suite 456, San Francisco, CA 94105</p>
              <p><strong>Phone:</strong> (555) 123-4567</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500">
            <p>© {new Date().getFullYear()} DiscountsMaps. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}