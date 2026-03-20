'use client';

import { useState } from 'react';
import { 
  ShieldCheck, Award, Zap, CheckCircle2, PlayCircle, 
  Quote, CalendarDays, Milestone, ChevronRight 
} from 'lucide-react';

export default function AboutPage() {
  // 탭 상태 관리 (greeting, history, tech)
  const [activeTab, setActiveTab] = useState('greeting');

  const technologies = [
    {
      title: "초신선 콜드체인 유지 특허",
      desc: "산지 수확부터 바이어 도착까지 온/습도를 AI로 제어하여 제품의 신선도를 기존 대비 200% 연장하는 독자적 패키징 기술입니다.",
      icon: <ShieldCheck size={40} className="text-green-600 mb-6" />
    },
    {
      title: "스마트 선별 및 세척 시스템",
      desc: "빅데이터 기반의 광학 선별기를 통해 미세한 흠집까지 완벽하게 걸러내어 최상급 1%의 제품만 수출합니다.",
      icon: <Zap size={40} className="text-blue-600 mb-6" />
    },
    {
      title: "글로벌 식품 안전 인증 (HACCP/ISO)",
      desc: "미국 FDA, 유럽 기준을 상회하는 엄격한 위생 관리 시스템을 구축하여 전 세계 어디든 안전하게 수출 가능한 자격을 갖추었습니다.",
      icon: <Award size={40} className="text-orange-600 mb-6" />
    }
  ];

  const histories = [
    { year: '2024', event: '글로벌 파트너사 50개국 돌파 및 외식사업부(F&C) 출범' },
    { year: '2023', event: '스마트 콜드체인 물류센터 완공 및 FDA 위생 인증 획득' },
    { year: '2021', event: '제 58회 무역의 날 "백만불 수출의 탑" 수상' },
    { year: '2019', event: 'CheonanFresh 농업회사법인 설립 및 K-신선식품 수출 개시' },
  ];

  // 탭 메뉴 구성
  const tabs = [
    { id: 'greeting', label: '대표 인사말' },
    { id: 'history', label: '회사 연혁' },
    { id: 'tech', label: '기술 및 특허' },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 pb-24">
      
      {/* 1. 상단 비주얼 영역 (유지) */}
      <section className="relative w-full h-[40vh] bg-green-900 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-800 to-green-900 z-10 opacity-90"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">About Us</h1>
          <p className="text-green-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            대한민국 농산물의 자부심을 품고,<br/>전 세계 식탁에 가장 안전하고 신선한 먹거리를 전합니다.
          </p>
        </div>
      </section>

      {/* 2. 탭 메뉴 영역 (신규 추가) */}
      <nav className="sticky top-[80px] z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-center gap-2 md:gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-5 px-4 text-sm md:text-base font-black transition-all relative ${
                  activeTab === tab.id ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-16">
        {/* 3. 대표 인사말 컨텐츠 */}
        {activeTab === 'greeting' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
              <div className="bg-white p-3 md:p-5 rounded-[2rem] shadow-xl border border-gray-100 mb-16">
                <div className="aspect-video bg-gray-900 rounded-[1.5rem] overflow-hidden relative">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/g3Q6T8qY_V4?rel=0&mute=1&autoplay=1&loop=1" 
                    title="CheonanFresh Company Introduction"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-48 h-48 md:w-64 md:h-64 bg-green-50 rounded-full flex items-center justify-center border-8 border-green-100/50 shadow-inner">
                    <Quote size={64} className="text-green-200" />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-black text-gray-950 mb-6 leading-tight">
                    "세계가 인정하는 품질,<br/>그 시작은 <span className="text-green-600">진정성</span>입니다."
                  </h2>
                  <div className="space-y-4 text-gray-600 font-medium leading-relaxed mb-8">
                    <p>안녕하십니까, CheonanFresh를 찾아주신 글로벌 파트너 여러분 환영합니다.</p>
                    <p>우리는 단순히 식품을 수출하는 것을 넘어, 대한민국 자연이 길러낸 건강함과 농부들의 땀방울이 담긴 정성을 전 세계의 식탁에 전달한다는 사명감을 가지고 있습니다.</p>
                    <p>앞으로도 끊임없는 품질 혁신과 철저한 콜드체인 시스템을 바탕으로, 바이어 분들께 가장 신뢰받는 최고의 비즈니스 파트너가 될 것을 약속드립니다.</p>
                  </div>
                  <div className="font-black text-gray-900 text-lg">
                    CheonanFresh 대표이사 <span className="text-green-600 text-2xl font-signature ml-2">홍 길 동</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 4. 회사 연혁 컨텐츠 */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="py-12 mb-24">
              <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-16">
                  <span className="text-green-600 font-black tracking-widest text-sm uppercase mb-2 block">Our History</span>
                  <h2 className="text-3xl font-black text-gray-950 tracking-tight">끊임없는 성장의 발자취</h2>
                </div>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-transparent before:via-green-200 before:to-transparent">
                  {histories.map((history, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Milestone size={16} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                        <div className="flex items-center mb-2">
                          <CalendarDays size={18} className="text-green-600 mr-2" />
                          <span className="font-black text-xl text-green-700">{history.year}</span>
                        </div>
                        <p className="text-gray-700 font-bold leading-relaxed">{history.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 5. 기술력 및 특허 컨텐츠 */}
        {activeTab === 'tech' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
              <div className="text-center mb-16">
                <span className="text-green-600 font-black tracking-widest text-sm uppercase mb-2 block">Core Technology</span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-950 mb-4 tracking-tight">압도적인 품질의 비밀, <br className="md:hidden"/>핵심 기술력</h2>
                <p className="text-gray-500 font-medium text-lg">끊임없는 연구 개발과 특허 기술로 신선식품 수출의 새로운 기준을 만듭니다.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {technologies.map((tech, idx) => (
                  <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 group">
                    <div className="bg-gray-50 inline-block p-5 rounded-3xl mb-6 group-hover:scale-110 transition-transform">
                      {tech.icon}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 leading-snug">{tech.title}</h3>
                    <p className="text-gray-600 font-medium leading-relaxed">{tech.desc}</p>
                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center text-gray-400 text-sm font-bold">
                      <CheckCircle2 size={16} className="mr-2 text-green-500" /> 검증된 시스템
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* 6. 회사 철학 (푸터 상단 공통 영역으로 유지) */}
      <section className="w-full bg-green-900 py-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
            "우리의 철학은 <span className="text-green-400">타협하지 않는 품질</span>입니다."
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white border-t border-green-800/50 pt-12">
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">12+</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">수출 국가</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">50+</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">글로벌 파트너</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">100%</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">품질 보증</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">24/7</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">콜드체인 모니터링</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}