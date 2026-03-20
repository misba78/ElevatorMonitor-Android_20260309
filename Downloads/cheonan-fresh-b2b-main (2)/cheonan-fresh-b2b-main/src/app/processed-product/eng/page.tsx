'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Image as ImageIcon, X, Send, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Product = {
  id: number;
  name: string;
  name_en?: string;
  category: string;
  desc: string;
  image_url: string | null;
  keywords?: string;
};

// 배너 타입 정의
type Banner = {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
};

export default function ProcessedProductPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🎡 배너 상태 추가
  const [banners, setBanners] = useState<Banner[]>([]);

  // 💬 문의하기 팝업 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // 제품 데이터 가져오기 (가공제품 카테고리 필터링)
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
        
      if (!productError && productData) {
        const processedCategories = ['Ambient', 'Frozen'];
        const processedData = productData.filter(p => processedCategories.includes(p.category));
        setProducts(processedData);
      }

      // 배너 데이터 가져오기 (가공제품 섹션용)
      const { data: bannerData } = await supabase
        .from('banners')
        .select('*')
        .eq('section', 'processed') // 가공제품용 섹션 배너 호출
        .order('id', { ascending: false });

      if (bannerData) setBanners(bannerData);
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // 롤링 배너를 위한 아이템 복제
  const marqueeItems = Array(10).fill(banners).flat();

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(product => product.category === activeTab);

  // 💬 팝업 열기/닫기 및 폼 입력 핸들러
  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({ name: '', email: '', message: '' });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 문의하기 전송 함수
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return alert('Please fill in all required fields.');
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('inquiries').insert([{
        product_name: selectedProduct?.name,
        customer_name: formData.name,
        customer_email: formData.email,
        message: formData.message,
        status: 'Pending'
      }]);

      if (error) throw error;
      
      alert('Your inquiry has been successfully submitted. Our representative will contact you shortly!');
      setIsModalOpen(false);
    } catch (error) {
      alert('An error occurred while submitting your inquiry. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-24 pt-20">
      
      {/* 롤링 배너 애니메이션 스타일 */}
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
      
      {/* 🌟 상단 비주얼 영역 */}
      <section className="relative w-full h-[30vh] bg-slate-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/40 z-10"></div>
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-wider">PROCESSED PRODUCT</h1>
          <p className="text-blue-100 text-lg font-light">Diverse K-Food Flavors Captivating Global Taste Buds</p>
        </div>
      </section>

      {/* 🎡 추가된 롤링 배너 섹션 */}
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
                  <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest mb-3 inline-block shadow-lg">
                    {banner.subtitle || 'HOT'}
                  </span>
                  <h3 className="text-white text-xl font-black truncate drop-shadow-md">{banner.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* 🗂️ 카테고리 탭 버튼 */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['All', 'Ambient', 'Frozen'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-md transform -translate-y-1' 
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-gray-200'
              }`}
            >
              {tab === 'All' ? 'View All' : tab === 'Ambient' ? 'Ambient' : 'Frozen'}
            </button>
          ))}
        </div>

        {/* ⏳ 로딩 중 화면 */}
        {isLoading ? (
          <div className="w-full py-32 flex flex-col items-center justify-center text-blue-600">
             <Loader2 size={48} className="animate-spin mb-4" />
             <p className="text-gray-500 font-medium">Fetching processed product data securely...</p>
          </div>
        ) : (
          /* 🥫 제품 그리드 진열대 */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                
                {/* 🌟 상세 페이지로 이동하는 Link 래퍼 적용! */}
                <Link href={`/product/${product.id}`} className="flex-grow flex flex-col cursor-pointer">
                  {/* 제품 사진 영역 */}
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <ImageIcon size={64} className="text-gray-300 opacity-70 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                        <Search size={24} className="text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* 제품 설명 영역 */}
                  <div className="p-6 flex-grow flex flex-col bg-white z-10">
                    <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2 block">{product.category}</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{product.name}</h3>
                    <p className="text-xs text-gray-400 font-medium mb-3">{product.name_en}</p>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed flex-grow">{product.desc}</p>
                    
                    {product.keywords && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                        {product.keywords.split(',').slice(0, 2).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">#{keyword.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>

                {/* 🚀 하단 버튼 영역 (상세설명 버튼 추가!) */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                  <Link 
                    href={`/product/${product.id}`}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm transition-all hover:-translate-y-0.5"
                  >
                    <Search size={16} className="mr-2 text-gray-400 group-hover:text-blue-600" />
                    Details
                  </Link>
                  <button 
                    onClick={() => openModal(product)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:-translate-y-0.5"
                  >
                    <Send size={16} className="mr-2" />
                    Inquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 텅 빈 경우 */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="w-full py-32 text-center flex flex-col items-center">
            <ImageIcon size={64} className="text-gray-200 mb-4" />
            <p className="text-gray-500 text-lg">No processed products found.<br/>Please register products in the Admin Panel!</p>
          </div>
        )}
      </div>

      {/* 💬 문의하기 모달 */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold flex items-center">
                <Send size={18} className="mr-2" /> B2B Import & Export Inquiry
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-100 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitInquiry} className="p-6">
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center space-x-4">
                {selectedProduct.image_url ? (
                  <img src={selectedProduct.image_url} className="w-12 h-12 object-cover rounded-md border border-white shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-gray-300 shadow-sm"><ImageIcon size={20} /></div>
                )}
                <div>
                  <p className="text-xs font-bold text-blue-600 mb-1">Selected Product</p>
                  <p className="font-bold text-gray-900 leading-tight">{selectedProduct.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Company / Contact Name <span className="text-blue-600">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="e.g. Evergood / John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email <span className="text-blue-600">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" placeholder="example@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Inquiry Details (Qty, Lead Time, etc.) <span className="text-blue-600">*</span></label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} required rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow" placeholder="Please enter the required quantity, desired delivery date, and other specific requests." />
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-2 w-2/3 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                  {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}