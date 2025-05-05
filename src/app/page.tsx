"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, MapPin, Tag, Store, DollarSign, AlertCircle, PlusCircle, User, Info, Mail, ChevronLeft, ChevronRight, ShoppingCart, TrendingUp, Percent, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface FeaturedStore {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  discountPercentage: number | null;
  specialOffers: string | null;
  storeImageUrl?: string | null;
  storeImages?: string[]; // Added support for multiple images
  storeType: string;
  openingDate?: string | null;
  closingDate?: string | null;
}

// Stats counters
const stats = [
  { value: 237, label: "Active Stores", icon: <Store size={24} className="text-blue-500" /> },
  { value: 15400, label: "Happy Shoppers", icon: <ShoppingCart size={24} className="text-green-500" /> },
  { value: 75, label: "Average Discount", suffix: "%", icon: <Percent size={24} className="text-red-500" /> },
  { value: 28, label: "Cities Covered", icon: <MapPin size={24} className="text-purple-500" /> },
];

export default function Home() {
  const [featuredStores, setFeaturedStores] = useState<FeaturedStore[]>([]);
  const [activeTab, setActiveTab] = useState<'closing' | 'opening'>('closing');
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [countersVisible, setCountersVisible] = useState(false);
  const [counters, setCounters] = useState(stats.map(stat => 0));
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Fix for hydration mismatch - only show particles on client side
  const [showParticles, setShowParticles] = useState(false);
  const [particles, setParticles] = useState<Array<{
    top: string;
    left: string;
    width: string;
    height: string;
    animationDuration: string;
    animationDelay: string;
    animationType: number;
  }>>([]);

  // Generate particles only on client side
  useEffect(() => {
    const generatedParticles = Array.from({ length: 20 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 100 + 10}px`,
      height: `${Math.random() * 100 + 10}px`,
      animationDuration: `${Math.random() * 20 + 10}s`,
      animationDelay: `${Math.random() * 5}s`,
      animationType: Math.floor(Math.random() * 3)
    }));
    
    setParticles(generatedParticles);
    setShowParticles(true);
  }, []);

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

  // Animate counters when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCountersVisible(true);
          startCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsRef]);

  const startCounters = () => {
    const duration = 2000; // 2 seconds animation
    const steps = 50;
    const stepTime = duration / steps;

    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      
      if (currentStep <= steps) {
        const progress = currentStep / steps;
        setCounters(stats.map(stat => Math.floor(stat.value * progress)));
      } else {
        setCounters(stats.map(stat => stat.value));
        clearInterval(interval);
      }
    }, stepTime);
  };

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

  const filteredStores = featuredStores.filter(store => 
    store.storeType === activeTab
  );

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Dynamic Hero Section with Particle Background */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 overflow-hidden">
        {/* Animated Particles Background - Client-side only */}
        {showParticles && (
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-white opacity-10"
                style={{
                  top: particle.top,
                  left: particle.left,
                  width: particle.width,
                  height: particle.height,
                  animationDuration: particle.animationDuration,
                  animationDelay: particle.animationDelay,
                  animation: `float-${particle.animationType} ${particle.animationDuration} infinite linear`
                }}
              />
            ))}
          </div>
        )}

        <style jsx>{`
          @keyframes float-0 {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(100px, 100px) scale(1.2); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes float-1 {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-100px, 50px) scale(0.8); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes float-2 {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(50px, -80px) scale(1.1); }
            66% { transform: translate(-30px, 50px) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
        `}</style>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Connect. Transition. <span className="text-yellow-300">Save.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 animate-slide-up opacity-90">
              Discover amazing deals at closing stores and be the first to explore exciting new businesses in your area.
            </p>
            
            {/* Use Next.js Link component properly */}
            <div className="relative z-50 flex justify-center mt-10 gap-4">
              <Link href="/map" passHref>
                <span className="bg-white text-blue-600 px-4 py-2 rounded-full cursor-pointer block">
                  🔍 Find Stores
                </span>
              </Link>
              <Link href="/submit" passHref>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full border border-white/30 cursor-pointer block">
                  🏪 List Your Store
                </span>
              </Link>
            </div>
          </div>
          
          {/* Animated wave divider */}
          <div className="absolute left-0 right-0 bottom-0 h-16 overflow-hidden">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
              <path fill="#f9fafb" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
              <path fill="#f9fafb" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
              <path fill="#f9fafb" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <div ref={statsRef} className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center justify-center bg-white p-4 rounded-full shadow-md mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-800">
                  {countersVisible ? counters[index] : 0}{stat.suffix || ''}
                </div>
                <div className="text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works - with animation on hover */}
      <section className="py-20 relative">
        {/* Diagonal background */}
        <div className="absolute inset-0 bg-gray-50 transform -skew-y-3 z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Shoppers */}
            <div className="group bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="h-3 bg-green-500"></div>
              <div className="p-8">
                <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="text-green-500" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">For Shoppers</h3>
                <ul className="space-y-4">
                  <li className="flex">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">1</span>
                    <p>Discover stores that are opening or closing in your area</p>
                  </li>
                  <li className="flex">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">2</span>
                    <p>Find discounts at closing stores or special offers at new stores</p>
                  </li>
                  <li className="flex">
                    <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">3</span>
                    <p>Get notified about new opportunities in your area</p>
                  </li>
                </ul>
                <div className="mt-8 text-center">
                  <Link href="/map" className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition shadow-md group-hover:shadow-lg">
                    Find Stores Now
                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* For Closing Store Owners */}
            <div className="group bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="h-3 bg-blue-500"></div>
              <div className="p-8">
                <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Store className="text-blue-500" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">For Closing Stores</h3>
                <ul className="space-y-4">
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">1</span>
                    <p>List your closing store to reach motivated buyers</p>
                  </li>
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">2</span>
                    <p>Set discount schedules to help liquidate inventory faster</p>
                  </li>
                  <li className="flex">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">3</span>
                    <p>Manage your closing process more efficiently</p>
                  </li>
                </ul>
                <div className="mt-8 text-center">
                  <Link href="/submit?type=closing" className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition shadow-md group-hover:shadow-lg">
                    List Closing Store
                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* For Opening Store Owners */}
            <div className="group bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="h-3 bg-purple-500"></div>
              <div className="p-8">
                <div className="rounded-full bg-purple-100 w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <PlusCircle className="text-purple-500" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">For Opening Stores</h3>
                <ul className="space-y-4">
                  <li className="flex">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">1</span>
                    <p>Announce your new store to the community</p>
                  </li>
                  <li className="flex">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">2</span>
                    <p>Promote your opening offers and special events</p>
                  </li>
                  <li className="flex">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">3</span>
                    <p>Connect with customers who are eager to discover new businesses</p>
                  </li>
                </ul>
                <div className="mt-8 text-center">
                  <Link href="/submit?type=opening" className="inline-flex items-center px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition shadow-md group-hover:shadow-lg">
                    List Opening Store
                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stores with improved UI */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Featured Stores</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover businesses in transition near you and find amazing opportunities
            </p>
          </div>
          
          {/* Store Type Tabs */}
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 p-1 rounded-full inline-flex">
              <button 
                onClick={() => setActiveTab('closing')}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'closing' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Closing Stores
              </button>
              <button 
                onClick={() => setActiveTab('opening')}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'opening' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Opening Stores
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStores && filteredStores.length > 0 ? (
            <div className="relative">
              {canScrollLeft && (
                <button 
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-110"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              
              <div 
                ref={sliderRef}
                className="flex overflow-x-auto pb-8 scrollbar-hide gap-6 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredStores.map((store) => (
                  <div key={store.id} className="flex-shrink-0 w-80">
                    <Link href={`/stores/${store.id}`} className="block group">
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl transform group-hover:-translate-y-2 h-full border border-gray-100">
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          {/* UPDATED: Check storeImages first, then fallback to storeImageUrl */}
                          {(store.storeImages && store.storeImages.length > 0) ? (
                            <img 
                              src={store.storeImages[0]} 
                              alt={store.businessName || 'Store image'} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                          ) : store.storeImageUrl ? (
                            <img 
                              src={store.storeImageUrl} 
                              alt={store.businessName || 'Store image'} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Store size={48} className="text-gray-400" />
                            </div>
                          )}
                          <div className={`absolute top-3 right-3 ${activeTab === 'closing' ? 'bg-red-500' : 'bg-purple-500'} text-white px-4 py-2 rounded-full font-bold shadow-md`}>
                            {activeTab === 'closing' 
                              ? `${store.discountPercentage ?? 'Varies'}%` 
                              : 'New Store'}
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors">
                            {store.businessName}
                          </h3>
                          <div className="flex items-center text-gray-500 mb-2">
                            <Tag size={14} className="mr-1 text-blue-500" />
                            <span>{store.category}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <MapPin size={14} className="mr-1 text-blue-500" />
                            <span>{store.city}, {store.state}</span>
                          </div>
                          <div className="mt-4 text-sm">
                            {activeTab === 'closing' ? (
                              <p className="text-red-600 font-medium">Closing: {new Date(store.closingDate as string).toLocaleDateString()}</p>
                            ) : (
                              <p className="text-purple-600 font-medium">Opening: {new Date(store.openingDate as string).toLocaleDateString()}</p>
                            )}
                          </div>
                          
                          <div className="mt-5 flex justify-end">
                            <span className="inline-flex items-center text-blue-600 font-medium group-hover:underline">
                              View Details
                              <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
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
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-110"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No featured {activeTab} stores available at this time.</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/map" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:bg-indigo-700 transition inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105">
              View All Stores
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Map preview section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 40 10 M 10 0 L 10 40" stroke="white" strokeWidth="0.5" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h2 className="text-4xl font-bold mb-6">Discover Stores Near You</h2>
              <p className="text-gray-300 text-lg mb-8">
                Our interactive map makes it easy to find transitioning stores in your area. 
                Filter by store type, category, or discount percentage to find exactly what you're looking for.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-500 rounded-full p-2 mr-4 flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Location-Based Search</h3>
                    <p className="text-gray-300">Find stores near you or in any location you're interested in.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-500 rounded-full p-2 mr-4 flex-shrink-0">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Advanced Filtering</h3>
                    <p className="text-gray-300">Filter by category, discount percentage, or store type.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-500 rounded-full p-2 mr-4 flex-shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Real-Time Updates</h3>
                    <p className="text-gray-300">New stores are added daily. Never miss an opportunity.</p>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <Link href="/map" className="bg-white text-indigo-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition inline-flex items-center shadow-lg transform hover:scale-105">
                  Explore the Map
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-gray-800 relative transform hover:scale-105 transition-transform duration-300">
                <img 
                  src="/map-preview.jpeg" 
                  alt="Store Map Preview" 
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback for missing image
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x500?text=Interactive+Map";
                  }}
                />
                {/* Map markers */}
                <div className="absolute left-1/4 top-1/3 animate-ping-slow">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="absolute left-2/3 top-1/2 animate-ping-slow" style={{ animationDelay: '1s' }}>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="absolute left-1/2 top-2/3 animate-ping-slow" style={{ animationDelay: '2s' }}>
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating info card */}
              <div className="absolute -right-5 -bottom-5 bg-white text-gray-800 rounded-lg shadow-xl p-4 max-w-xs transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-md p-2 mr-3">
                    <Store size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">Tech Haven</h4>
                    <p className="text-sm text-gray-500">Electronics • 75% OFF</p>
                    <p className="text-xs text-red-600 mt-1">Closing: May 28</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute left-0 top-0 w-96 h-96 bg-white opacity-10 rounded-full transform -translate-x-1/3 -translate-y-1/3"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-yellow-400 p-3 rounded-full">
                <AlertCircle size={32} className="text-indigo-900" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Discover Amazing Opportunities?</h2>
            <p className="text-xl mb-10 text-blue-100">
              Join thousands of shoppers and store owners on Store Transitions today. 
              Whether you're looking for deals or need to manage a store transition, we've got you covered.
            </p>
            <div className="flex flex-col md:flex-row gap-5 justify-center">
              <Link href="/map?type=closing" 
                className="group bg-red-500 text-white px-8 py-4 rounded-full font-medium hover:bg-red-600 transition shadow-lg transform hover:scale-105">
                <span className="flex items-center">
                  Find Closing Sales
                  <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
                </span>
              </Link>
              <Link href="/map?type=opening" 
                className="group bg-purple-500 text-white px-8 py-4 rounded-full font-medium hover:bg-purple-600 transition shadow-lg transform hover:scale-105">
                <span className="flex items-center">
                  Discover New Stores
                  <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
                </span>
              </Link>
            </div>
            
            <div className="mt-12 pt-12 border-t border-blue-400 border-opacity-30">
              <p className="text-blue-200 mb-4">Create an account to save your favorite stores and get notified of new opportunities</p>
              <Link href="/register" className="inline-flex items-center px-6 py-3 bg-white text-indigo-700 rounded-full font-medium hover:bg-gray-100 transition shadow-lg">
                <User size={18} className="mr-2" />
                Sign Up Now - It's Free
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-6">Store Transitions</h3>
              <p className="text-gray-400 mb-6">
                Connecting shoppers with businesses in transition for great opportunities.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
                <a href="#" className="bg-gray-800 hover:bg-blue-400 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="bg-gray-800 hover:bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="/map" className="text-gray-400 hover:text-white transition">Find Stores</Link></li>
                <li><Link href="/submit" className="text-gray-400 hover:text-white transition">List Your Store</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Support</a></li>
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-6">Get in Touch</h3>
              <form className="space-y-4">
                <div>
                  <input 
                    type="email" 
                    placeholder="Your email"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-300"
                  />
                </div>
                <div>
                  <textarea 
                    placeholder="Your message"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-300"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-500">
            <p>© {new Date().getFullYear()} Store Transitions. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <Link href="/terms" className="hover:text-white transition mr-6">Terms of Service</Link>
              <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}