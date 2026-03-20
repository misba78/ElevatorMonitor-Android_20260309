'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, User, Building2, Calendar, Trash2, Loader2, Inbox } from 'lucide-react';

export default function AdminInquiryPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('inquiries').select('*').order('id', { ascending: false });
    setInquiries(data || []);
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('이 문의건을 삭제하시겠습니까?')) {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) alert('삭제 실패: ' + error.message);
      fetchInquiries();
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* 간소화된 헤더 섹션 */}
      <div className="mb-10">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">고객 문의 관리</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">홈페이지 하단 폼을 통해 접수된 일반 비즈니스 문의입니다.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {inquiries.length > 0 ? inquiries.map((iq) => (
            <div key={iq.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{iq.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center mt-0.5">
                      <Mail size={12} className="mr-1.5" /> {iq.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-400 font-bold flex items-center justify-end uppercase tracking-tighter">
                    <Calendar size={13} className="mr-1.5" /> {new Date(iq.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleDelete(iq.id)} 
                    className="text-gray-300 hover:text-red-500 mt-2.5 p-1 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-50">
                <div className="flex items-center text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">
                  <Building2 size={13} className="mr-1.5" /> {iq.company || 'Private / Individual'}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {iq.message}
                </p>
              </div>
            </div>
          )) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox size={32} className="text-gray-200" />
              </div>
              <p className="text-gray-500 font-bold text-lg">아직 들어온 문의가 없습니다.</p>
              <p className="text-gray-400 text-sm mt-1">새로운 비즈니스 제안을 기다려주세요.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}