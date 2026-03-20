'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return alert('모든 항목을 입력해주세요.');

    setIsSubmitting(true);
    try {
      // 🌟 올려주신 DB 사진과 똑같이 컬럼 이름을 맞췄습니다!
      const { error } = await supabase.from('inquiries').insert([{
        name: formData.name,             // 사진 속 'name' 컬럼
        email: formData.email,           // 사진 속 'email' 컬럼
        message: formData.message,       // 사진 속 'message' 컬럼
        company: '홈페이지 Contact 메뉴'   // 사진 속 'company' 컬럼 (문의 출처 표시용으로 사용)
      }]);

      if (error) throw error;
      
      alert('문의가 성공적으로 접수되었습니다. 담당자가 빠르게 확인 후 연락드리겠습니다!');
      setFormData({ name: '', email: '', message: '' }); 
    } catch (error: any) {
      console.error('전송 에러 상세:', error);
      alert('접수 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 pb-24">
      {/* 상단 타이틀 */}
      <section className="bg-green-900 py-20 text-center px-4 shadow-inner">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">CONTACT US</h1>
        <p className="text-lg text-green-100 font-medium">Cheonan Fresh와 함께할 글로벌 파트너를 기다립니다.</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* 좌측: 연락처 정보 */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-black text-gray-950 mb-6 tracking-tight">무엇이든 물어보세요!</h2>
            <p className="text-gray-600 mb-12 leading-relaxed font-medium text-lg">
              제품 단가, 최소 주문 수량(MOQ), 독점 계약 등 비즈니스 관련하여 궁금하신 점을 남겨주시면, Cheonan Fresh의 수출 전문가가 24시간 이내에 상세히 답변해 드립니다.
            </p>

            <div className="space-y-10">
              {/* 본사 위치 */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><MapPin size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-1">본사 위치</h4>
                  <p className="text-gray-700 font-medium">서울특별시 영등포구 국제금융로 10, Cheonan Fresh빌딩</p>
                </div>
              </div>

              {/* 🌟 추가된 지방 사무소 영역 */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><MapPin size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-2">지방 사무소</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-gray-900 text-base">평택 사무소</p>
                      <p className="text-gray-700 font-medium text-sm mt-1">평택시 평택로 64번길 21-6, 206호(평택동, 라페온빌II)</p>
                      <p className="text-gray-500 font-medium text-sm mt-0.5">연락처: 070-4790-8219</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">수원 사무소</p>
                      <p className="text-gray-700 font-medium text-sm mt-1">경기도 수원시 권선구 곡반정로 145, 2층(곡반정동)</p>
                      <p className="text-gray-500 font-medium text-sm mt-0.5">연락처: 070-4790-8219</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 전화 문의 */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><Phone size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-1">전화 문의</h4>
                  <p className="text-gray-700 font-medium">+82 2-1234-5678 (평일 09:00 - 18:00)</p>
                </div>
              </div>

              {/* 이메일 문의 */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><Mail size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-1">이메일 문의</h4>
                  <p className="text-gray-700 font-medium">export@CheonanFresh.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 문의 폼 */}
          <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-950 mb-8 flex items-center">
              <Send size={24} className="mr-2 text-green-600" /> 온라인 문의 작성
            </h3>
            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">회사명 / 담당자 성함 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none bg-white text-gray-950 font-black text-lg placeholder:text-gray-400 placeholder:font-medium transition-all shadow-sm" 
                  placeholder="예: Cheonan Fresh 파트너스 / 홍길동" 
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">회신받을 이메일 <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none bg-white text-gray-950 font-black text-lg placeholder:text-gray-400 placeholder:font-medium transition-all shadow-sm" 
                  placeholder="example@company.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">문의 내용 <span className="text-red-500">*</span></label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleInputChange} 
                  required 
                  rows={6} 
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none resize-none bg-white text-gray-950 font-bold text-base leading-relaxed placeholder:text-gray-400 placeholder:font-medium transition-all shadow-sm" 
                  placeholder="제휴 문의, 견적 요청 등 자유롭게 작성해주세요." 
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full flex items-center justify-center py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all transform hover:-translate-y-1 disabled:opacity-50 text-lg mt-4"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin mr-2" /> : <Send size={24} className="mr-2" />}
                {isSubmitting ? '전송 중...' : '문의 보내기'}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}