'use client';

import { Utensils, ChefHat, Store, ArrowRight, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function FnCPage() {
  const brands = [
    {
      name: "Cheonan K-BBQ",
      category: "프리미엄 한식 다이닝",
      desc: "대한민국 산지 직송 최상급 육류와 신선한 식재료를 활용한 프리미엄 코리안 바비큐 전문점입니다.",
      icon: <Utensils size={40} className="text-orange-500 mb-4" />
    },
    {
      name: "Fresh Salad & Bowl",
      category: "건강식 패스트 캐주얼",
      desc: "자사 농장에서 당일 수확한 유기농 채소로 만드는 건강하고 트렌디한 샐러드 & 포케 브랜드입니다.",
      icon: <Coffee size={40} className="text-green-500 mb-4" />
    },
    {
      name: "K-Street Food Hub",
      category: "글로벌 분식 프랜차이즈",
      desc: "전 세계인의 입맛을 사로잡은 K-분식을 모던하고 위생적인 시스템으로 제공하는 글로벌 브랜드입니다.",
      icon: <Store size={40} className="text-red-500 mb-4" />
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 pb-24">
      
      {/* 🌟 1. F&C 비주얼 영역 (오렌지/따뜻한 톤) */}
      <section className="relative w-full h-[40vh] bg-orange-900 flex flex-col items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900 via-orange-800 to-red-900 z-10 opacity-90"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-orange-800 rounded-2xl mb-6 shadow-inner border border-orange-700">
            <ChefHat size={32} className="text-orange-200" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">F&C Business</h1>
          <p className="text-orange-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            자연의 신선함을 식탁 위까지.<br/>차별화된 맛과 서비스로 글로벌 외식 문화를 선도합니다.
          </p>
        </div>
      </section>

      {/* 🌟 2. 브랜드 소개 영역 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-950 mb-4 tracking-tight">운영 브랜드 소개</h2>
          <p className="text-gray-500 font-bold">CheonanFresh의 신선한 식재료로 완성되는 프리미엄 외식 브랜드를 만나보세요.</p>
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

      {/* 🌟 3. 가맹 및 입점 문의 유도 */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[3rem] p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl font-black mb-6">성공적인 외식 비즈니스 파트너</h3>
          <p className="text-orange-100 mb-10 text-lg">
            CheonanFresh의 탄탄한 식재료 공급망과 외식 경영 노하우를 바탕으로<br/>가맹점주님들의 성공적인 창업을 지원합니다.
          </p>
          <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-black rounded-2xl hover:bg-orange-50 transition-colors shadow-lg">
            가맹 및 입점 문의하기 <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}