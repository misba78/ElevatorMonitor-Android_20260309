'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
// 🌟 Animation Library
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Leaf, 
  ChevronRight, 
  Loader2,
  Calendar,
  Mail,
  MessageSquare,
  Newspaper 
} from 'lucide-react';

// Banner Type Definition
type Banner = {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
};

export default function HomePage() {
  const [news, setNews] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);

  // 🌍 Language state & Timer logic
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryData, setInquiryData] = useState({ name: '', email: '', company: '', message: '' });

  useEffect(() => {
    // Switch language every 3 seconds (KO <-> EN)
    const langTimer = setInterval(() => {
      setLang((prev) => (prev === 'ko' ? 'en' : 'ko'));
    }, 3000);

    const fetchData = async () => {
      setIsLoading(true);
      const { data: newsData } = await supabase.from('news').select('*').order('id', { ascending: false }).limit(3);
      const { data: productData } = await supabase.from('products').select('*').order('id', { ascending: false }).limit(3);
      const { data: partnerData } = await supabase.from('partners').select('*').order('id', { ascending: true });
      
      const { data: bannerData } = await supabase
        .from('banners')
        .select('*')
        .eq('section', 'fresh')
        .order('id', { ascending: false });
      
      setNews(newsData || []);
      setLatestProducts(productData || []);
      setPartners(partnerData || []);
      if (bannerData) setBanners(bannerData);
      
      setIsLoading(false);
    };

    fetchData();
    return () => clearInterval(langTimer); // Prevent memory leaks
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryData.name || !inquiryData.email || !inquiryData.message) {
      return alert('Name, email, and message are required fields.');
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([{ 
          name: inquiryData.name, 
          email: inquiryData.email, 
          company: inquiryData.company, 
          message: inquiryData.message 
        }]);

      if (error) throw error;
      alert('Your inquiry has been successfully submitted. We will contact you shortly!');
      setInquiryData({ name: '', email: '', company: '', message: '' });
    } catch (error: any) {
      alert('An error occurred while submitting: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const marqueeItems = Array(10).fill(banners).flat();

  // 🌟 Sophisticated Animation Presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.165, 0.84, 0.44, 1] } 
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 1. Hero Section */}
      <section className="relative w-full min-h-[85vh] py-32 md:py-0 bg-green-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-900 z-0"></div>
        
        <motion.div 
          className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-12 md:mt-16 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span 
            variants={itemVariants}
            className="px-3 py-1.5 rounded-full bg-green-800 border border-green-600 text-green-300 text-[11px] md:text-sm font-bold tracking-widest mb-6 uppercase"
          >
            PREMIUM KOREAN FOOD EXPORTER
          </motion.span>
          
          <AnimatePresence mode="wait">
            <motion.h1 
              key={lang} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight px-2"
            >
              {lang === 'ko' ? (
                <>Delivering <br className="block sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">Nature's Finest Freshness</span><br className="hidden md:block" /> to the Whole World.</>
              ) : (
                <>Delivering <br className="block sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">Nature's Freshness</span><br className="hidden md:block" /> to the Whole World.</>
              )}
            </motion.h1>
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={lang + "-p"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-base md:text-xl text-green-100 mb-10 max-w-2xl font-light leading-relaxed px-4 min-h-[3rem]"
            >
              {lang === 'ko' 
                ? "CheonanFresh delivers Korea's premium produce worldwide through rigorous quality control and cold-chain systems."
                : "CheonanFresh delivers Korea's premium produce worldwide through rigorous quality control and cold-chain systems."}
            </motion.p>
          </AnimatePresence>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0">
            <Link href="/fresh-product" className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-green-500 hover:bg-green-400 text-white rounded-2xl sm:rounded-full font-black text-lg shadow-xl shadow-green-900/50 flex items-center justify-center transition-all transform hover:-translate-y-1">
              {lang === 'ko' ? 'View Products' : 'View Products'} <ArrowRight className="ml-2" size={20} />
            </Link>
            <a href="#contact-section" className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-transparent border-2 border-green-400/50 hover:bg-green-800 text-green-100 rounded-2xl sm:rounded-full font-black text-lg flex items-center justify-center transition-all">
              {lang === 'ko' ? 'Inquire Now' : 'Inquire Now'}
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* 🎡 Rolling Banner Section */}
      {!isLoading && banners.length > 0 && (
        <section className="w-full bg-white py-12 border-b border-gray-100 overflow-hidden relative shadow-sm z-20">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex animate-marquee space-x-6 px-6">
            {marqueeItems.map((banner, idx) => (
              <a 
                href={banner.link_url || '#'} 
                key={`${banner.id}-${idx}`} 
                className="group relative w-64 h-64 md:w-72 md:h-72 rounded-[2rem] overflow-hidden flex-shrink-0 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="px-3 py-1 bg-teal-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest mb-3 inline-block shadow-lg">
                    {banner.subtitle || 'HOT'}
                  </span>
                  <h3 className="text-white text-xl font-black truncate drop-shadow-md">{banner.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 2. Latest News */}
      <section className="py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">LATEST NEWS</h2>
            <p className="text-gray-500 mt-2 font-medium">The latest updates and activities from CheonanFresh.</p>
            <Link href="/news" className="mt-4 inline-block text-green-600 font-black hover:text-green-800 transition-colors cursor-pointer tracking-tighter uppercase text-sm border-b-2 border-green-600/20 pb-1">
              View All News
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {!isLoading && news.length > 0 ? news.map((item) => (
              <Link 
                href={`/news/${item.id}`} 
                key={item.id} 
                className="group bg-white rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2 overflow-hidden shadow-sm cursor-pointer"
              >
                <div className="w-full aspect-video bg-gray-100 relative overflow-hidden border-b border-gray-50">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <Newspaper size={48} className="opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-green-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                      {item.category || 'NEWS'}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center text-gray-400 text-[11px] font-black mb-3 uppercase tracking-wider">
                    <Calendar size={13} className="mr-1.5" /> 
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-black text-gray-950 mb-3 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-8 line-clamp-3 flex-grow font-medium">
                    {item.content}
                  </p>
                  <div className="pt-5 border-t border-gray-50 flex items-center text-green-600 font-black text-xs uppercase tracking-widest group-hover:text-green-800 transition-colors">
                    Read More <ChevronRight size={14} className="ml-1 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-3 py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                {isLoading ? (
                  <div className="flex flex-col items-center text-green-600 font-black">
                    <Loader2 className="animate-spin mb-3" size={40} />
                    <p className="uppercase tracking-widest text-xs">Loading News...</p>
                  </div>
                ) : (
                  <p className="text-gray-400 font-bold">No news articles registered yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Our Products */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">OUR PRODUCTS</h2>
          <p className="text-gray-500 font-medium font-serif italic">Premium Selection from Korea</p>
          <Link href="/fresh-product" className="mt-4 inline-block text-green-600 font-black hover:text-green-800 transition-colors cursor-pointer tracking-tighter uppercase text-sm border-b-2 border-green-600/20 pb-1">
            View All Products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {!isLoading && latestProducts.map((product, index) => (
            <Link 
              href={`/product/${product.id}`} 
              key={index} 
              className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative border-b border-gray-50">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200"><Leaf size={64} /></div>
                )}
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1 bg-white/90 backdrop-blur-sm text-gray-950 text-[10px] font-black rounded-full uppercase shadow-sm border border-gray-100 tracking-widest">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="p-10">
                <h3 className="text-2xl font-black text-gray-950 mb-3 tracking-tight group-hover:text-green-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-[15px] line-clamp-2 mb-8 font-medium leading-relaxed">
                  {product.desc}
                </p>
                <div className="text-green-600 font-black flex items-center text-xs uppercase tracking-widest group/btn">
                  View Details <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Global Partners Section */}
      {!isLoading && partners.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-black text-gray-400 tracking-widest uppercase mb-10">TRUSTED BY GLOBAL PARTNERS</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
              {partners.map((partner) => (
                <a 
                  key={partner.id} 
                  href={partner.link_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block hover:scale-110 transition-transform duration-300 grayscale hover:grayscale-0 opacity-60 hover:opacity-100"
                >
                  <img src={partner.image_url} alt={partner.name} className="h-12 md:h-16 object-contain" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🌟 Slogan Section */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
              "Delivering <span className="text-green-600">Nature's Finest Freshness</span> to the World."
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 font-medium">
              Korea's Leading Premium Produce Exporter, <br className="md:hidden" />
              <span className="text-gray-900 font-black border-b-4 border-green-500/30 pb-1">CheonanFresh</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. Contact Us Section */}
      <section id="contact-section" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-900 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row border-8 border-green-800/20">
            <div className="lg:w-2/5 p-12 lg:p-20 text-white flex flex-col justify-center bg-green-800">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                <Mail size={32} className="text-green-300" />
              </div>
              <h2 className="text-4xl font-black mb-6 leading-tight tracking-tighter">We look forward to <br/>Global Partnerships</h2>
              <p className="text-green-100/70 mb-10 leading-relaxed font-medium">
                Please leave your inquiry for premium fresh food exports or business proposals. Our representative will respond within 24 business hours.
              </p>
              <div className="space-y-5 text-sm font-black text-green-300 uppercase tracking-widest">
                <p className="flex items-center"><ChevronRight size={18} className="mr-3 text-green-500" /> GLOBAL EXPORT NETWORK</p>
                <p className="flex items-center"><ChevronRight size={18} className="mr-3 text-green-500" /> 24/7 QUALITY RESPONSE</p>
              </div>
            </div>

            <div className="lg:w-3/5 p-12 lg:p-20 bg-white">
              <form onSubmit={handleInquirySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-3 ml-1 uppercase tracking-tighter">Full Name / Contact Person</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-semibold text-gray-900"
                      placeholder="Your Full Name"
                      value={inquiryData.name}
                      onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-3 ml-1 uppercase tracking-tighter">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-semibold text-gray-900"
                      placeholder="email@company.com"
                      value={inquiryData.email}
                      onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-3 ml-1 uppercase tracking-tighter">Company Name (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-semibold text-gray-900"
                    placeholder="Your Company Name"
                    value={inquiryData.company}
                    onChange={(e) => setInquiryData({...inquiryData, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-3 ml-1 uppercase tracking-tighter">Inquiry Details</label>
                  <textarea 
                    rows={5}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all resize-none font-semibold text-gray-900 shadow-inner"
                    placeholder="Please describe your inquiry in detail."
                    value={inquiryData.message}
                    onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-100 flex items-center justify-center transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-3" size={24} /> : <MessageSquare className="mr-3" size={24} />}
                  {isSubmitting ? 'SENDING...' : 'SEND INQUIRY'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}