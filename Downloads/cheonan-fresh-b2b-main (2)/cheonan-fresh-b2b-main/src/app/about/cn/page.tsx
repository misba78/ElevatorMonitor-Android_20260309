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
      title: "超新鲜冷链维持专利",
      desc: "从产地采收至买家送达，通过 AI 控制温湿度，是将产品新鲜度较现有技术延长 200% 的独家包装技术。",
      icon: <ShieldCheck size={40} className="text-green-600 mb-6" />
    },
    {
      title: "智能筛选及清洗系统",
      desc: "基于大数据的光学筛选机，能完美过滤微小瑕疵，仅出口前 1% 的顶级优质产品。",
      icon: <Zap size={40} className="text-blue-600 mb-6" />
    },
    {
      title: "全球食品安全认证 (HACCP/ISO)",
      desc: "建立了超越美国 FDA 及欧洲标准的严格卫生管理体系，具备向全球各地安全出口的资质。",
      icon: <Award size={40} className="text-orange-600 mb-6" />
    }
  ];

  const histories = [
    { year: '2024', event: '全球合作伙伴突破 50 个国家及餐饮事业部 (F&C) 成立' },
    { year: '2023', event: '智能冷链物流中心竣工并获得 FDA 卫生认证' },
    { year: '2021', event: '荣获第 58 届贸易之日“百万美元出口塔”奖' },
    { year: '2019', event: 'CheonanFresh 农业法人成立并开启 K-新鲜食品出口' },
  ];

  // 탭 메뉴 구성
  const tabs = [
    { id: 'greeting', label: '代表致辞' },
    { id: 'history', label: '公司发展史' },
    { id: 'tech', label: '技术及专利' },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 pb-24">
      
      {/* 1. 상단 비주얼 영역 (유지) */}
      <section className="relative w-full h-[40vh] bg-green-900 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-800 to-green-900 z-10 opacity-90"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">About Us</h1>
          <p className="text-green-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            怀揣韩国农产品的自豪感，<br/>为全球餐桌奉上最安全、最优质的新鲜食材。
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
                    "世界认可的品质，<br/>始于我们的<span className="text-green-600">至诚之心</span>。"
                  </h2>
                  <div className="space-y-4 text-gray-600 font-medium leading-relaxed mb-8">
                    <p>您好，欢迎各位全球合作伙伴访问 CheonanFresh。</p>
                    <p>我们不仅仅是在出口食品，更怀揣着一种使命感，旨在将韩国大自然孕育的健康与农民们辛勤汗水结成的诚意，传递到全球的餐桌上。</p>
                    <p>今后，我们将继续以不断的品质创新和严密的冷链系统为基础，承诺成为各位买家最值得信赖的最佳商业伙伴。</p>
                  </div>
                  <div className="font-black text-gray-900 text-lg">
                    CheonanFresh 代表理事 <span className="text-green-600 text-2xl font-signature ml-2">洪 吉 童</span>
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
                  <h2 className="text-3xl font-black text-gray-950 tracking-tight">不断成长的足迹</h2>
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
                <h2 className="text-3xl md:text-4xl font-black text-gray-950 mb-4 tracking-tight">卓越品质的秘密，<br className="md:hidden"/>核心技术实力</h2>
                <p className="text-gray-500 font-medium text-lg">通过不断的研发与专利技术，树立新鲜食品出口的新标准。</p>
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
                      <CheckCircle2 size={16} className="mr-2 text-green-500" /> 已验证系统
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
            "我们的哲学是<span className="text-green-400">对品质绝不妥协</span>。"
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white border-t border-green-800/50 pt-12">
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">12+</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">出口国家</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">50+</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">全球合作伙伴</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">100%</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">品质保证</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">24/7</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">冷链全天候监测</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}