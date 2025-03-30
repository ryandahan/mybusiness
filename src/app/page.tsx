"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, MapPin, Tag, Store, DollarSign, AlertCircle, User, Info, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface FeaturedStore {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  discountPercentage: number | null;
  storeImageUrl?: string | null;
  closingDate: string;
}

export default function Home() {
  const [featuredStores, setFeaturedStores] = useState<FeaturedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchFeaturedStores = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stores/featured');
        if (response.ok) {
          const data = await response.json();
          setFeaturedStores(data);
        }
      } catch (error) {
        console.error('Error fetching featured stores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStores();
  }, []);

  // Check scroll capability
  useEffect(() => {
    const checkScroll = () => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
    }

    return () => {
      if (slider) {
        slider.removeEventListener('scroll', checkScroll);
      }
    };
  }, [featuredStores]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Store Transitions</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connect with closing stores for great deals while helping businesses 
            transition smoothly
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
            <Link href="/map" className="bg-white text-blue-600 px-8 py-3 rounded-full font-medium flex items-center justify-center hover:bg-gray-100 transition">
              <Search className="mr-2" size={20} />
              Find Closing Stores
            </Link>
            <Link href="/submit" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-medium flex items-center justify-center hover:bg-white/10 transition">
              <Store className="mr-2" size={20} />
              List Your Closing Store
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Shoppers */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <DollarSign className="mr-2 text-green-500" size={28} />
                For Shoppers
              </h3>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  <p>Discover stores that are closing in your area</p>
                </li>
                <li className="flex">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  <p>Find deep discounts as businesses liquidate inventory</p>
                </li>
                <li className="flex">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  <p>Get notified when discounts increase as closing dates approach</p>
                </li>
              </ul>
              <Link href="/map" className="mt-6 inline-block bg-green-500 text-white px-6 py-2 rounded font-medium hover:bg-green-600 transition">
                Find Deals Now
              </Link>
            </div>
            
            {/* For Store Owners */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <Store className="mr-2 text-blue-500" size={28} />
                For Store Owners
              </h3>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  <p>List your closing store to reach motivated buyers</p>
                </li>
                <li className="flex">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  <p>Set discount schedules to help liquidate inventory faster</p>
                </li>
                <li className="flex">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  <p>Manage your closing process more efficiently</p>
                </li>
              </ul>
              <Link href="/submit" className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded font-medium hover:bg-blue-600 transition">
                List Your Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stores */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">Featured Closing Stores</h2>
          <p className="text-center text-gray-600 mb-10">Don't miss these limited-time opportunities</p>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredStores && featuredStores.length > 0 ? (
            <div className="relative">
              {canScrollLeft && (
                <button 
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              
              <div 
                ref={sliderRef}
                className="flex overflow-x-auto pb-6 scrollbar-hide gap-6 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featuredStores.map((store) => (
                  <div key={store.id} className="flex-shrink-0 w-80">
                    <Link href={`/stores/${store.id}`} className="block group">
                      <div className="bg-white rounded-lg overflow-hidden shadow-md transition hover:shadow-lg h-full">
                        <div className="relative h-48 bg-gray-200">
                          {store.storeImageUrl ? (
                            <img 
                              src={store.storeImageUrl} 
                              alt={store.businessName || 'Store image'} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Store size={48} className="text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                            {store.discountPercentage ?? 'Varies'}%
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-xl mb-1 group-hover:text-blue-600 transition">
                            {store.businessName}
                          </h3>
                          <div className="flex items-center text-gray-500 mb-2">
                            <Tag size={14} className="mr-1" />
                            <span>{store.category}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <MapPin size={14} className="mr-1" />
                            <span>{store.city}, {store.state}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              
              {canScrollRight && (
                <button 
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No featured stores available at this time.</p>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link href="/map" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700 transition inline-flex items-center">
              View All Closing Stores
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle size={28} className="text-yellow-400 mr-2" />
            <h2 className="text-3xl font-bold">Don't Miss Out on Closing Sales</h2>
          </div>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Stores are constantly closing and offering increasing discounts. 
            Start exploring today to find the best deals.
          </p>
          <Link href="/map" className="bg-yellow-500 text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-yellow-400 transition">
            Start Exploring
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Store Transitions</h3>
              <p className="text-gray-600 mb-4">
                Connecting shoppers with closing stores for great deals.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/map" className="text-gray-600 hover:text-blue-600">Find Stores</Link></li>
                <li><Link href="/submit" className="text-gray-600 hover:text-blue-600">List Your Store</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
              <li><Link href="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Support</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Subscribe</h3>
              <p className="text-gray-600 mb-4">
                Stay updated with the latest closing sales and exclusive deals.
              </p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500">
            <p>© {new Date().getFullYear()} Store Transitions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}