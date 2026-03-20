'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Handshake, Loader2, Building } from 'lucide-react';

type Partner = {
  id: number;
  name: string;
  image_url: string;
  link_url: string;
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('partners').select('*').order('id', { ascending: true });
      if (!error && data) {
        setPartners(data);
      }
      setIsLoading(false);
    };
    fetchPartners();
  }, []);

  return (
    <div className="w-full min-h-screen bg-white pt-20 pb-24">
      
      {/* 🌟 1. Partner Visual Section */}
      <section className="relative w-full h-[35vh] bg-slate-900 flex flex-col items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 z-10 opacity-90"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-2xl mb-6 shadow-inner border border-slate-700">
            <Handshake size={32} className="text-gray-300" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">Our Partners</h1>
          <p className="text-gray-300 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            Introducing our reliable partners growing together with CheonanFresh<br/>and pioneering the global market.
          </p>
        </div>
      </section>

      {/* 🌟 2. Partner Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="font-bold">Loading partner information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {partners.map((partner) => (
              <a 
                key={partner.id}
                href={partner.link_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center aspect-square shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={partner.image_url} 
                    alt={partner.name} 
                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100 group-hover:scale-110"
                  />
                </div>
                {/* Enhanced accessibility by showing the name on mobile */}
                <span className="mt-4 text-xs font-bold text-gray-400 group-hover:text-gray-900 transition-colors text-center line-clamp-1">
                  {partner.name}
                </span>
              </a>
            ))}
            {partners.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                <Building size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">No partners found at the moment.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}