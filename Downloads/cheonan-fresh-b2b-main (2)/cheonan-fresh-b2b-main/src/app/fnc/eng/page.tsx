'use client';

import { Utensils, ChefHat, Store, ArrowRight, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function FnCPage() {
  const brands = [
    {
      name: "Cheonan K-BBQ",
      category: "Premium Korean Dining",
      desc: "A premium Korean BBQ restaurant utilizing top-grade meat and fresh ingredients delivered directly from farms in Korea.",
      icon: <Utensils size={40} className="text-orange-500 mb-4" />
    },
    {
      name: "Fresh Salad & Bowl",
      category: "Healthy Fast Casual",
      desc: "A healthy and trendy salad & poke brand made with organic vegetables harvested the same day from our own farms.",
      icon: <Coffee size={40} className="text-green-500 mb-4" />
    },
    {
      name: "K-Street Food Hub",
      category: "Global Street Food Franchise",
      desc: "A global brand providing K-street food that has captured the taste buds of people around the world, utilizing a modern and hygienic system.",
      icon: <Store size={40} className="text-red-500 mb-4" />
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 pb-24">
      
      {/* 🌟 1. F&C Visual Section (Orange/Warm Tone) */}
      <section className="relative w-full h-[40vh] bg-orange-900 flex flex-col items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900 via-orange-800 to-red-900 z-10 opacity-90"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-orange-800 rounded-2xl mb-6 shadow-inner border border-orange-700">
            <ChefHat size={32} className="text-orange-200" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">F&C Business</h1>
          <p className="text-orange-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            Bringing nature's freshness to your table.<br/>Leading global dining culture with differentiated taste and service.
          </p>
        </div>
      </section>

      {/* 🌟 2. Brand Introduction Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-950 mb-4 tracking-tight">Our Brands</h2>
          <p className="text-gray-500 font-bold">Discover premium dining brands perfected with fresh ingredients from CheonanFresh.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {brands.map((brand, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-gray-50 inline-block p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                {brand.icon}
              </div>
              <p className="text-sm font-black text-orange-600 mb-2">{brand.category}</p>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{brand.name}</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                {brand.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 3. Franchise & Partnership Inquiry */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[3rem] p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl font-black mb-6">Your Successful Dining Business Partner</h3>
          <p className="text-orange-100 mb-10 text-lg">
            Backed by CheonanFresh's solid ingredient supply chain and dining management know-how,<br/>we support our franchisees in launching a successful business.
          </p>
          <Link href="/contact/eng" className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-black rounded-2xl hover:bg-orange-50 transition-colors shadow-lg">
            Inquire about Franchise & Partnership <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}