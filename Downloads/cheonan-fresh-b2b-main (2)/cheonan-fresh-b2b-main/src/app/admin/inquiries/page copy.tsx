'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, User, Building2, Calendar, Trash2 } from 'lucide-react';

export default function AdminInquiryPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    const { data } = await supabase.from('inquiries').select('*').order('id', { ascending: false });
    setInquiries(data || []);
  };

  const handleDelete = async (id: number) => {
    if (confirm('이 문의건을 삭제하시겠습니까?')) {
      await supabase.from('inquiries').delete().eq('id', id);
      fetchInquiries();
    }
  };

  return (
    <div className="p-8 pt-24 max-w-5xl mx-auto min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">고객 문의 관리</h1>
        <p className="text-gray-500">글로벌 바이어들이 남긴 소중한 비즈니스 제안들입니다.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {inquiries.length > 0 ? inquiries.map((iq) => (
          <div key={iq.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><User size={20} /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{iq.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Mail size={14} className="mr-1" /> {iq.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 font-medium flex items-center justify-end">
                  <Calendar size={14} className="mr-1" /> {new Date(iq.created_at).toLocaleDateString()}
                </span>
                <button onClick={() => handleDelete(iq.id)} className="text-red-400 hover:text-red-600 mt-2 p-2"><Trash2 size={18} /></button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl">
              <div className="flex items-center text-xs font-bold text-gray-400 mb-2">
                <Building2 size={14} className="mr-1" /> {iq.company || '회사명 미기재'}
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{iq.message}</p>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            아직 들어온 문의가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}