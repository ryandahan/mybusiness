import React from 'react';
import Link from 'next/link';
import { Store, Users, BarChart, Heart, ArrowLeft } from 'lucide-react';

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-white hover:text-blue-100 mb-6">
            <ArrowLeft size={16} className="mr-1" />
            Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About DiscountsMap</h1>
          <p className="text-xl max-w-3xl">
            Helping shoppers find great deals while supporting businesses during their closing transitions.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 mb-4">
              DiscountsMap was founded in 2025 with a simple mission: to create a win-win platform that connects shoppers with businesses that are closing their doors.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              After witnessing many local stores struggle during their closing phases and seeing how often shoppers missed out on great deals because they didn't know about these sales, we realized there was a need for a dedicated platform to bridge this gap.
            </p>
            <p className="text-lg text-gray-700">
              Today, DiscountsMap helps thousands of shoppers find exceptional deals while assisting business owners in efficiently managing their store closings with dignity and financial success.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-700 mb-8">
              To transform the challenging experience of closing a business into a positive opportunity for both business owners and consumers.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 text-left mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Store className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-xl font-bold">For Business Owners</h3>
                </div>
                <p className="text-gray-700">
                  We provide tools and resources to help business owners maximize recovery during their closing phase, reach motivated customers, and manage the transition process with less stress.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-xl font-bold">For Shoppers</h3>
                </div>
                <p className="text-gray-700">
                  We help consumers discover significant savings on quality products while supporting local businesses during their transition, creating a more sustainable approach to retail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Founder</h2>
          
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-48 bg-gray-200">
                <img 
                  src="https://placehold.co/400x300?text=Founder" 
                  alt="Founder" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-xl mb-1">RAEEAN AHMED</h3>
                <p className="text-gray-600 mb-4">Founder</p>
                <p className="text-gray-700 text-sm">
                  I believe everyone deserves to keep more money in their pocket while discovering amazing local businesses.
                  <br/><br/>
                  I created Discounts Map because I care about customers not missing great deals and business owners struggling to get their offers noticed. Traditional advertising can be expensive, and many amazing deals go unnoticed.
                  <br/><br/>
                  Whether you're a new store looking to attract customers or a closing business needing to clear inventory quickly, DiscountsMap connects you with shoppers who truly want what you're offering.
                  <br/><br/>
                  That's why Discounts Map is completely free—no ads, no data selling, no hidden fees. Your savings and privacy matter more than profit.
                  <br/><br/>
                  Your success is my success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Heart size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a business owner in transition or a shopper looking for great deals, we're here to help.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/submit" className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition">
              List Your Store
            </Link>
            <Link href="/map" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition">
              Find Closing Stores
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}