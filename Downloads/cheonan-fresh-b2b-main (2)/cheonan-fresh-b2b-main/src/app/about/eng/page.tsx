'use client';

import { useState } from 'react';
import { 
  ShieldCheck, Award, Zap, CheckCircle2, PlayCircle, 
  Quote, CalendarDays, Milestone, ChevronRight 
} from 'lucide-react';

export default function AboutPage() {
  // Tab state management (greeting, history, tech)
  const [activeTab, setActiveTab] = useState('greeting');

  const technologies = [
    {
      title: "Ultra-Fresh Cold Chain Patent",
      desc: "A proprietary packaging technology that uses AI to control temperature and humidity from farm harvest to buyer delivery, extending product freshness by 200% compared to conventional methods.",
      icon: <ShieldCheck size={40} className="text-green-600 mb-6" />
    },
    {
      title: "Smart Sorting & Washing System",
      desc: "Our big data-driven optical sorter detects even the smallest blemishes with precision, ensuring only the top 1% of premium products are exported.",
      icon: <Zap size={40} className="text-blue-600 mb-6" />
    },
    {
      title: "Global Food Safety Certification (HACCP/ISO)",
      desc: "We have established a strict hygiene management system that exceeds U.S. FDA and European standards, qualifying us to safely export to anywhere in the world.",
      icon: <Award size={40} className="text-orange-600 mb-6" />
    }
  ];

  const histories = [
    { year: '2024', event: 'Surpassed 50 global partner countries and launched the Food & Catering Division (F&C)' },
    { year: '2023', event: 'Completed smart cold-chain logistics center and obtained FDA hygiene certification' },
    { year: '2021', event: 'Received the "One Million Dollar Export Tower" award at the 58th Trade Day ceremony' },
    { year: '2019', event: 'Established CheonanFresh Agricultural Corporation and began K-Fresh Food exports' },
  ];

  // Tab menu configuration
  const tabs = [
    { id: 'greeting', label: "CEO's Message" },
    { id: 'history', label: 'Company History' },
    { id: 'tech', label: 'Technology & Patents' },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 pb-24">
      
      {/* 1. Top Visual Section */}
      <section className="relative w-full h-[40vh] bg-green-900 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-800 to-green-900 z-10 opacity-90"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">About Us</h1>
          <p className="text-green-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            Carrying the pride of Korean agriculture,<br/>we bring the safest and freshest food to tables around the world.
          </p>
        </div>
      </section>

      {/* 2. Tab Navigation */}
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
        {/* 3. CEO's Message Content */}
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
                    "Quality recognized by the world<br/>begins with <span className="text-green-600">authenticity</span>."
                  </h2>
                  <div className="space-y-4 text-gray-600 font-medium leading-relaxed mb-8">
                    <p>Welcome to CheonanFresh. We are delighted to meet our global partners.</p>
                    <p>We go beyond simply exporting food — we are driven by a mission to deliver the health nurtured by Korea's nature and the dedication of our farmers to tables all around the world.</p>
                    <p>We promise to continue innovating in quality and maintaining our rigorous cold-chain system, so that we may be the most trusted business partner for all our buyers.</p>
                  </div>
                  <div className="font-black text-gray-900 text-lg">
                    CheonanFresh CEO <span className="text-green-600 text-2xl font-signature ml-2">Hong Gil-dong</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 4. Company History Content */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="py-12 mb-24">
              <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-16">
                  <span className="text-green-600 font-black tracking-widest text-sm uppercase mb-2 block">Our History</span>
                  <h2 className="text-3xl font-black text-gray-950 tracking-tight">A Journey of Continuous Growth</h2>
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

        {/* 5. Technology & Patents Content */}
        {activeTab === 'tech' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
              <div className="text-center mb-16">
                <span className="text-green-600 font-black tracking-widest text-sm uppercase mb-2 block">Core Technology</span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-950 mb-4 tracking-tight">The Secret Behind Superior Quality, <br className="md:hidden"/>Our Core Technology</h2>
                <p className="text-gray-500 font-medium text-lg">Through relentless R&D and patented technology, we set a new standard in fresh food exports.</p>
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
                      <CheckCircle2 size={16} className="mr-2 text-green-500" /> Verified System
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* 6. Company Philosophy (Common footer top section) */}
      <section className="w-full bg-green-900 py-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
            "Our philosophy is <span className="text-green-400">uncompromising quality</span>."
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white border-t border-green-800/50 pt-12">
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">12+</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">Export Countries</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">50+</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">Global Partners</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">100%</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">Quality Guarantee</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2 text-green-400">24/7</div>
              <div className="text-sm font-bold tracking-widest uppercase opacity-80">Cold Chain Monitoring</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
