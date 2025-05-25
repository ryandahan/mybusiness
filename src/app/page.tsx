"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, MapPin, Tag, Store, DollarSign, AlertCircle, PlusCircle, User, Info, Mail, ChevronLeft, ChevronRight, ShoppingCart, TrendingUp, Percent, ArrowRight, Clock, Star, Shield, Zap, Gift } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SearchComponent from '@/components/SearchComponent';

interface FeaturedStore {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  discountPercentage: number | null;
  specialOffers: string | null;
  storeImageUrl?: string | null;
  storeImages?: string[];
  storeType: string;
  openingDate?: string | null;
  closingDate?: string | null;
}

// Updated realistic stats that create urgency and social proof
const stats = [
  { value: 89, label: "Active Deals", icon: <Store size={24} className="text-orange-500" />, suffix: "" },
  { value: 2847, label: "Savings Found", icon: <ShoppingCart size={24} className="text-green-500" />, suffix: "" },
  { value: 68, label: "Average Discount", suffix: "%", icon: <Percent size={24} className="text-red-500" /> },
  { value: 12, label: "Cities Covered", icon: <MapPin size={24} className="text-blue-500" />, suffix: "" },
];

// Testimonials for social proof
const testimonials = [
  {
    name: "Sarah M.",
    location: "New York, NY",
    text: "Found 70% off designer clothes! Saved over $400 on my shopping trip.",
    rating: 5
  },
  {
    name: "Mike R.",
    location: "Los Angeles, CA", 
    text: "This app helped me discover a furniture store closing sale. Got my whole living room for half price!",
    rating: 5
  },
  {
    name: "Jessica L.",
    location: "Chicago, IL",
    text: "Love getting alerts about new store openings and their grand opening deals.",
    rating: 5
  }
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Fix for hydration mismatch
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
    const generatedParticles = Array.from({ length: 15 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 80 + 20}px`,
      height: `${Math.random() * 80 + 20}px`,
      animationDuration: `${Math.random() * 25 + 15}s`,
      animationDelay: `${Math.random() * 5}s`,
      animationType: Math.floor(Math.random() * 3)
    }));
    
    setParticles(generatedParticles);
    setShowParticles(true);
  }, []);

  // Testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
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
    const duration = 2000;
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
      
      {/* Hero Section with Psychological Color Psychology */}
      <section className="relative bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white py-20 overflow-hidden">
        {/* Animated Background */}
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
          <div className="max-w-5xl mx-auto">
            {/* Urgency Badge */}
            <div className="inline-flex items-center bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm mb-6 animate-pulse">
              <Zap size={16} className="mr-2" />
              LIMITED TIME: Stores closing daily - Don't miss out!
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 animate-fade-in">
              Save Up To <span className="text-yellow-300 animate-pulse">90%</span><br />
              <span className="text-3xl md:text-5xl">Before It's Gone Forever!</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 animate-slide-up opacity-90 max-w-3xl mx-auto">
              Discover massive discounts at closing stores and exclusive grand opening deals. 
              <span className="font-bold text-yellow-300"> Act fast - these deals won't last!</span>
            </p>
            
            {/* Search Component */}
            <div className="mb-8 px-4">
              <SearchComponent />
            </div>
            
            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-6 mb-8 text-sm">
              <div className="flex items-center">
                <Shield size={16} className="mr-1 text-green-300" />
                <span>Verified Stores</span>
              </div>
              <div className="flex items-center">
                <Star size={16} className="mr-1 text-yellow-300" />
                <span>5-Star Rated</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1 text-blue-300" />
                <span>Real-Time Updates</span>
              </div>
            </div>
            
            {/* Primary CTA Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
              <Link href="/map?type=closing" passHref>
                <span className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-full font-black text-lg cursor-pointer block shadow-2xl transform hover:scale-105 transition-all duration-200">
                  🔥 Find Closing Sales NOW
                </span>
              </Link>
              <Link href="/map?type=opening" passHref>
                <span className="bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-full font-bold text-lg cursor-pointer block shadow-xl transform hover:scale-105 transition-all duration-200">
                  🎉 Discover New Openings
                </span>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="text-sm opacity-90">
              <span className="font-semibold">2,847 shoppers</span> found deals this week!
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Urgency Stats - CHANGED TO WHITE BACKGROUND */}
      <div ref={statsRef} className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Join Thousands of Smart Shoppers</h2>
            <p className="text-gray-600">Real results from real people</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-110 transition-transform duration-300 bg-white rounded-lg p-6 shadow-lg border">
                <div className="inline-flex items-center justify-center bg-gray-100 p-4 rounded-full shadow-lg mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-black text-orange-500">
                  {countersVisible ? counters[index] : 0}{stat.suffix || ''}
                </div>
                <div className="text-gray-700 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Shoppers Say</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 relative">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={24} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-xl italic mb-6 text-gray-700">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="font-bold text-lg text-gray-900">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-gray-600">
                  {testimonials[currentTestimonial].location}
                </div>
              </div>
              
              {/* Dots indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition with Scarcity */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Smart Shoppers Choose DiscountsMap</h2>
            <p className="text-xl text-gray-600">Don't let savings slip away - here's why we're different</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Shoppers */}
            <div className="group bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl border-t-4 border-orange-500">
              <div className="p-8">
                <div className="rounded-full bg-orange-100 w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="text-orange-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Massive Savings</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">✓</span>
                    <p>Find up to <span className="font-bold text-orange-600">90% off</span> at verified closing stores</p>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">✓</span>
                    <p>Exclusive grand opening deals before anyone else</p>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">✓</span>
                    <p>Real-time alerts so you never miss a deal</p>
                  </li>
                </ul>
                <div className="mt-8 text-center">
                  <Link href="/map" className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition shadow-lg group-hover:shadow-xl">
                    Start Saving Now
                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* For Closing Store Owners */}
            <div className="group bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl border-t-4 border-blue-500">
              <div className="p-8">
                <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Store className="text-blue-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Clear Inventory Fast</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">✓</span>
                    <p>Reach thousands of eager bargain hunters instantly</p>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">✓</span>
                    <p>Schedule automatic discount increases to move inventory</p>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">✓</span>
                    <p>Professional verification builds customer trust</p>
                  </li>
                </ul>
                <div className="mt-8 text-center">
                  <Link href="/submit?type=closing" className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition shadow-lg group-hover:shadow-xl">
                    List Your Store
                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* For Opening Store Owners */}
            <div className="group bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl border-t-4 border-green-500">
              <div className="p-8">
                <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Gift className="text-green-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Launch with Impact</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">✓</span>
                    <p>Get discovered by deal-seeking customers from day one</p>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">✓</span>
                    <p>Promote grand opening events and special offers</p>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">✓</span>
                    <p>Build buzz and excitement before you open</p>
                  </li>
                </ul>
                <div className="mt-8 text-center">
                  <Link href="/submit?type=opening" className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition shadow-lg group-hover:shadow-xl">
                    Get Featured
                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stores with Urgency */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full font-bold text-sm mb-4">
              <Clock size={16} className="mr-2" />
              These deals are ending soon!
            </div>
            <h2 className="text-4xl font-bold mb-4">🔥 Hot Deals Right Now</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't wait - these stores are closing or promotions are ending
            </p>
          </div>
          
          {/* Store Type Tabs */}
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 p-1 rounded-full inline-flex">
              <button 
                onClick={() => setActiveTab('closing')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'closing' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                🏪 Closing Sales
              </button>
              <button 
                onClick={() => setActiveTab('opening')}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === 'opening' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                🎉 Grand Openings
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredStores && filteredStores.length > 0 ? (
            <div className="relative">
              {canScrollLeft && (
                <button 
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-xl hover:bg-gray-100 transition transform hover:scale-110"
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
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl transform group-hover:-translate-y-2 h-full border border-gray-100 relative">
                        {/* Urgency Badge */}
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs z-10 animate-pulse">
                          ENDING SOON
                        </div>
                        
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
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
                          
                          <div className={`absolute top-3 right-3 ${activeTab === 'closing' ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded-full font-black shadow-lg`}>
                            {activeTab === 'closing' 
                              ? `${store.discountPercentage ?? 'UP TO 90'}% OFF` 
                              : 'GRAND OPENING'}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="font-bold text-xl mb-2 group-hover:text-orange-600 transition-colors">
                            {store.businessName}
                          </h3>
                          <div className="flex items-center text-gray-500 mb-2">
                            <Tag size={14} className="mr-1 text-orange-500" />
                            <span>{store.category}</span>
                          </div>
                          <div className="flex items-center text-gray-500 mb-4">
                            <MapPin size={14} className="mr-1 text-orange-500" />
                            <span>{store.city}, {store.state}</span>
                          </div>
                          
                          <div className="mb-4">
                            {activeTab === 'closing' ? (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 font-bold text-sm">⏰ CLOSING: {new Date(store.closingDate as string).toLocaleDateString()}</p>
                              </div>
                            ) : (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-green-600 font-bold text-sm">🎉 OPENING: {new Date(store.openingDate as string).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="inline-flex items-center text-orange-600 font-bold group-hover:underline">
                              View Deal
                              <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                            <div className="text-xs text-gray-500">
                              👥 12 people viewing
                            </div>
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
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-xl hover:bg-gray-100 transition transform hover:scale-110"
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
            <Link href="/map" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-black text-lg hover:from-orange-600 hover:to-red-600 transition inline-flex items-center shadow-xl hover:shadow-2xl transform hover:scale-105">
              🚀 See All Deals Now
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final Urgent CTA */}
      <section className="py-20 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white rounded-full transform translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute left-0 top-0 w-96 h-96 bg-white rounded-full transform -translate-x-1/3 -translate-y-1/3"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-yellow-400 text-black px-6 py-2 rounded-full font-black text-sm mb-6 animate-bounce">
              <AlertCircle size={20} className="mr-2" />
              ⚠️ These deals won't last long!
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Don't Let Savings<br />
              <span className="text-yellow-300">Slip Away!</span>
            </h2>
            
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of smart shoppers who save hundreds every month. 
              <span className="font-bold"> Start finding deals in your area right now!</span>
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
              <Link href="/map?type=closing" 
                className="group bg-yellow-400 hover:bg-yellow-300 text-black px-10 py-5 rounded-full font-black text-xl shadow-2xl transform hover:scale-105 transition-all duration-200">
                <span className="flex items-center">
                  🔥 Find Closing Sales
                  <ArrowRight className="ml-3 transition-transform duration-300 group-hover:translate-x-2" size={24} />
                </span>
              </Link>
              
              <Link href="/map?type=opening" 
                className="group bg-green-500 hover:bg-green-400 text-white px-10 py-5 rounded-full font-black text-xl shadow-xl transform hover:scale-105 transition-all duration-200">
                <span className="flex items-center">
                  🎉 Discover New Stores
                  <ArrowRight className="ml-3 transition-transform duration-300 group-hover:translate-x-2" size={24} />
                </span>
              </Link>
            </div>
            
            <div className="text-center">
              <p className="text-yellow-100 mb-4 font-semibold">💯 100% Free to use • No spam • Instant access</p>
              <div className="flex justify-center items-center space-x-6 text-sm">
                <span className="flex items-center">
                  <Shield size={16} className="mr-1" /> Verified Deals
                </span>
                <span className="flex items-center">
                  <Star size={16} className="mr-1" /> 5-Star Reviews
                </span>
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" /> Updated Daily
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer - REMOVED EXTRA WHITE SECTION */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-6 text-orange-400">DiscountsMap</h3>
              <p className="text-gray-400 mb-6">
                Your trusted source for finding the best deals and discounts before they're gone forever.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-800 hover:bg-orange-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </a>
                <a href="#" className="bg-gray-800 hover:bg-orange-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-6 text-orange-400">For Shoppers</h3>
              <ul className="space-y-3">
                <li><Link href="/map" className="text-gray-400 hover:text-white transition">Find Deals</Link></li>
                <li><Link href="/map?type=closing" className="text-gray-400 hover:text-white transition">Closing Sales</Link></li>
                <li><Link href="/map?type=opening" className="text-gray-400 hover:text-white transition">New Openings</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white transition">Sign Up Free</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-6 text-orange-400">For Businesses</h3>
              <ul className="space-y-3">
                <li><Link href="/submit" className="text-gray-400 hover:text-white transition">List Your Store</Link></li>
                <li><Link href="/verification" className="text-gray-400 hover:text-white transition">Verification Process</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Business Support</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition">Success Stories</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-6 text-orange-400">Support</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-500">
            <p>© {new Date().getFullYear()} DiscountsMap. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Shield size={16} />
              <span className="text-sm">Verified • Trusted • Secure</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}