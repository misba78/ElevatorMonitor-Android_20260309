'use client';

import { MapPin, Globe2, Plane, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// 🌟 한국 위치
const KOREA_POS = { top: '31%', left: '75.5%' };

// 🌟 수출 국가 데이터 (이모지 대신 국가 코드 'code' 추가)
const exportCountries = [
  { name: '미국', name_en: 'USA', code: 'us', top: '35%', left: '28%' },
  { name: '캐나다', name_en: 'Canada', code: 'ca', top: '22%', left: '28%' },
  { name: '독일', name_en: 'Germany', code: 'de', top: '30%', left: '48%' },
  { name: '러시아', name_en: 'Russia', code: 'ru', top: '20%', left: '68%' },
  { name: '모로코', name_en: 'Morocco', code: 'ma', top: '42%', left: '46%' },
  { name: '중국', name_en: 'China', code: 'cn', top: '38%', left: '70%' },
  { name: '일본', name_en: 'Japan', code: 'jp', top: '33%', left: '78%' },
  { name: '베트남', name_en: 'Vietnam', code: 'vn', top: '53%', left: '77%' },
  { name: '태국', name_en: 'Thailand', code: 'th', top: '48%', left: '72%' },
  { name: '말레이시아', name_en: 'Malaysia', code: 'my', top: '56%', left: '72%' },
  { name: '호주', name_en: 'Australia', code: 'au', top: '70%', left: '78%' },
  { name: '뉴질랜드', name_en: 'New Zealand', code: 'nz', top: '82%', left: '86%' }
];

export default function GlobalNetworkPage() {
  return (
    <div className="w-full min-h-screen bg-white pt-24 pb-24">
      
      <style>{`
        @keyframes dashFlow {
          to { stroke-dashoffset: -20; }
        }
        .flowing-line {
          stroke-dasharray: 6 6;
          animation: dashFlow 1.5s linear infinite;
        }
      `}</style>
      
      {/* 1. 상단 비주얼 */}
      <section className="relative w-full bg-blue-900 py-20 flex flex-col items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 z-10 opacity-90"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-blue-800 rounded-2xl mb-6 shadow-inner">
            <Globe2 size={32} className="text-blue-300" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">GLOBAL NETWORK</h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            전 세계 12개국 이상의 파트너들에게 안전하게 공급하고 있습니다.
          </p>
        </div>
      </section>

      {/* 2. 지도 영역 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-blue-50/50 rounded-[3rem] p-4 md:p-12 border border-blue-100 shadow-inner overflow-hidden relative">
          <div className="relative w-full aspect-[4/3] md:aspect-[2/1] bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-contain bg-center opacity-80">
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#2563eb" opacity="0.6" />
                </marker>
              </defs>
              {exportCountries.map((country, idx) => (
                <line key={`line-${idx}`} x1={KOREA_POS.left} y1={KOREA_POS.top} x2={country.left} y2={country.top} stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" markerEnd="url(#arrowhead)" className="flowing-line" />
              ))}
            </svg>

            {/* 한국 본진 */}
            <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20" style={{ top: KOREA_POS.top, left: KOREA_POS.left }}>
              <div className="bg-red-600 text-white text-[9px] md:text-[11px] font-black px-2 py-0.5 rounded shadow-lg whitespace-nowrap mb-1 flex items-center gap-1">
                KOREA <img src="https://flagcdn.com/w40/kr.png" className="w-3 h-2" alt="kr" />
              </div>
              <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse"></div>
            </div>

            {/* 도착 국가 핀 */}
            {exportCountries.map((country, idx) => (
              <div key={`pin-${idx}`} className="absolute transform -translate-x-1/2 -translate-y-full flex flex-col items-center group cursor-pointer z-10 hover:z-50 transition-all duration-300" style={{ top: country.top, left: country.left }}>
                <div className="bg-blue-700 text-white text-sm md:text-base font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-3 transition-all duration-300 shadow-2xl whitespace-nowrap mb-1 flex items-center gap-2">
                  <img src={`https://flagcdn.com/w40/${country.code}.png`} className="w-5 h-3.5 object-cover" alt={country.name} />
                  {country.name}
                </div>
                <MapPin className="text-blue-500 fill-blue-50 group-hover:scale-[1.8] transition-transform" size={24} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 리스트 영역 (이미지 아이콘 적용) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white rounded-[2rem] border-2 border-gray-100 p-10 shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
               <Plane size={24} className="mr-3 text-blue-600" /> 주요 수출 국가
            </h3>
            <div className="flex flex-wrap gap-3">
              {exportCountries.map((country, idx) => (
                <span key={idx} className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors">
                  {/* 🌟 국가 코드 기반 이미지 로딩 (확실한 방법) */}
                  <img 
                    src={`https://flagcdn.com/w40/${country.code}.png`} 
                    className="w-5 h-3.5 object-cover mr-2 shadow-sm rounded-sm" 
                    alt={country.name} 
                  />
                  {country.name} ({country.name_en})
                </span>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-10 shadow-xl text-white flex flex-col justify-between">
            <TrendingUp size={32} className="text-blue-300 mb-6" />
            <h3 className="text-2xl font-black mb-4">글로벌 파트너 문의</h3>
            <Link href="/contact" className="flex items-center justify-between w-full px-6 py-4 bg-white text-blue-700 font-black rounded-xl">
              수출 문의하기 <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}