'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Mail, Phone, MapPin, Send, Leaf, Globe2, Package } from 'lucide-react';

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      alert('문의가 성공적으로 접수되었습니다. 담당자가 확인 후 빠르게 연락드리겠습니다!');
      setFormData({ name: '', company: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      
      {/* 🌟 1. 메인 히어로(비주얼) 영역 - 높이 최적화 버전 */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfefcb19?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-bold tracking-widest uppercase mb-4 backdrop-blur-sm">
            Premium K-Food Exporter
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tighter">
            Nature's Freshness,<br />Delivered Worldwide.
          </h1>
          <p className="text-base md:text-xl text-gray-300 font-medium mb-8 max-w-3xl mx-auto leading-relaxed">
            자연이 내린 최상의 신선함을 전 세계 식탁으로.<br className="hidden md:block"/>대한민국을 대표하는 프리미엄 농산물 수출 기업, CheonanFresh입니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/about" className="px-8 py-3.5 bg-green-600 text-white font-black rounded-xl hover:bg-green-500 transition-colors w-full sm:w-auto shadow-lg shadow-green-900/50">
              회사 소개
            </Link>
            <Link href="#contact-section" className="px-8 py-3.5 bg-white/10 text-white font-black rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md w-full sm:w-auto border border-white/20">
              수출 문의하기
            </Link>
          </div>
        </div>
      </section>

      {/* 🌟 2. 비즈니스 영역 퀵링크 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-950 mb-4 tracking-tight">Our Business</h2>
            <p className="text-gray-500 font-medium">CheonanFresh의 핵심 비즈니스 영역을 확인하세요.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/fresh-product" className="group bg-gray-50 rounded-[2rem] p-10 hover:bg-green-600 transition-colors duration-300">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
                <Leaf size={32} className="text-green-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-white mb-4">신선 농산물</h3>
              <p className="text-gray-600 group-hover:text-green-100 mb-8 leading-relaxed">엄격한 기준으로 선별된 대한민국의 최상급 제철 과일과 채소를 수출합니다.</p>
              <span className="flex items-center text-green-600 font-bold group-hover:text-white">
                자세히 보기 <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>

            <Link href="/processed-product" className="group bg-gray-50 rounded-[2rem] p-10 hover:bg-blue-600 transition-colors duration-300">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                <Package size={32} className="text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-white mb-4">가공 식품</h3>
              <p className="text-gray-600 group-hover:text-blue-100 mb-8 leading-relaxed">최신 설비와 위생 시스템으로 제조된 안전하고 맛있는 K-가공식품을 제공합니다.</p>
              <span className="flex items-center text-blue-600 font-bold group-hover:text-white">
                자세히 보기 <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>

            <Link href="/global-network" className="group bg-gray-50 rounded-[2rem] p-10 hover:bg-slate-800 transition-colors duration-300">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
                <Globe2 size={32} className="text-slate-800 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-white mb-4">글로벌 네트워크</h3>
              <p className="text-gray-600 group-hover:text-slate-300 mb-8 leading-relaxed">전 세계 12개국 이상의 글로벌 파트너들과 함께 탄탄한 유통망을 구축하고 있습니다.</p>
              <span className="flex items-center text-slate-800 font-bold group-hover:text-white">
                자세히 보기 <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 🌟 3. Contact Us 영역 */}
      <section id="contact-section" className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-black tracking-widest text-sm uppercase mb-2 block">Contact Us</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-950 mb-4 tracking-tight">글로벌 비즈니스 문의</h2>
            <p className="text-gray-500 font-medium text-lg">새로운 시장을 함께 개척할 든든한 파트너를 기다립니다. 언제든 편하게 문의 남겨주세요.</p>
          </div>

          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-2/5 bg-green-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 text-green-800 opacity-50">
                <Globe2 size={250} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-8">Get in Touch</h3>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <MapPin className="mt-1 mr-4 text-green-400 shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-green-400 mb-1">Head Office</h4>
                      <p className="text-green-50 leading-relaxed">충청남도 천안시 서북구<br/>CheonanFresh 글로벌 무역센터 15층</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="mt-1 mr-4 text-green-400 shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-green-400 mb-1">Phone</h4>
                      <p className="text-green-50 leading-relaxed">+82 41-123-4567<br/>평일 09:00 - 18:00 (KST)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="mt-1 mr-4 text-green-400 shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-green-400 mb-1">Email</h4>
                      <p className="text-green-50 leading-relaxed">export@cheonanfresh.com<br/>partnership@cheonanfresh.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-3/5 p-12 lg:p-16">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">담당자 성함 *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all font-medium text-gray-900" placeholder="홍길동" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">회사명 *</label>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all font-medium text-gray-900" placeholder="Company Name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">이메일 주소 *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all font-medium text-gray-900" placeholder="email@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">문의 내용 *</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all font-medium text-gray-900 resize-none" placeholder="수출 국가, 관심 품목, 예상 물량 등을 자유롭게 남겨주세요."></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-green-600 transition-colors group">
                  {isSubmitting ? '전송 중...' : '문의 접수하기'}
                  {!isSubmitting && <Send size={18} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}