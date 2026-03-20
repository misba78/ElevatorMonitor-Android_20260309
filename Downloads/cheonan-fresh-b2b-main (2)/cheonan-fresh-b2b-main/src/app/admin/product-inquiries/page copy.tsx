'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ShoppingBag, 
  User, 
  Mail, 
  Building2, 
  Calendar, 
  Trash2, 
  MessageSquare,
  Search
} from 'lucide-react';

export default function AdminProductInquiryPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    // 🌟 product_inquiries 테이블에서 데이터를 가져옵니다.
    const { data, error } = await supabase
      .from('product_inquiries')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) console.error("데이터 로드 에러:", error);
    setInquiries(data || []);
  };

  const handleDelete = async (id: number) => {
    if (confirm('이 제품 문의를 삭제하시겠습니까?')) {
      await supabase.from('product_inquiries').delete().eq('id', id);
      fetchInquiries();
    }
  };

  const filteredInquiries = inquiries.filter(iq => 
    iq.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iq.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 pt-24 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center">
            <ShoppingBag className="mr-3 text-green-600" size={32} />
            제품별 상세 문의 관리
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">바이어가 특정 제품 페이지에서 남긴 문의 목록입니다.</p>
        </div>
        
        {/* 검색창 */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="제품명 또는 이름 검색" 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none shadow-sm text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredInquiries.length > 0 ? filteredInquiries.map((iq) => (
          <div key={iq.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
            {/* 상단바: 제품명 강조 */}
            <div className="bg-green-50 px-8 py-4 border-b border-green-100 flex justify-between items-center">
              <div className="flex items-center">
                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded mr-3">PRODUCT</span>
                <h2 className="font-black text-green-800 text-lg">{iq.product_name}</h2>
              </div>
              <button onClick={() => handleDelete(iq.id)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 바이어 정보 */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-900">
                  <User size={18} className="mr-3 text-gray-400" />
                  <span className="font-bold">{iq.buyer_name}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Mail size={18} className="mr-3 text-gray-400" />
                  <span className="font-medium underline">{iq.buyer_email}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Building2 size={18} className="mr-3 text-gray-400" />
                  <span className="font-medium">{iq.buyer_company || '회사명 미기재'}</span>
                </div>
                <div className="flex items-center text-gray-400 text-xs pt-2">
                  <Calendar size={16} className="mr-3" />
                  <span>접수일: {new Date(iq.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* 문의 내용 */}
              <div className="lg:col-span-2 bg-gray-50 p-6 rounded-2xl relative">
                <MessageSquare className="absolute right-4 top-4 text-gray-200" size={40} />
                <h4 className="text-xs font-black text-gray-400 uppercase mb-3 tracking-widest">Inquiry Message</h4>
                <p className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap relative z-10">
                  {iq.inquiry_content}
                </p>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-32 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
            <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold text-lg">아직 접수된 제품 문의가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}