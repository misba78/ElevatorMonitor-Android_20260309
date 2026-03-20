'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

type Product = {
  id: number;
  category: string;
  name: string;
  name_en?: string;
  desc: string;
  image_url: string | null;
  detail_image_url: string | null;   // 🌟 상세 통이미지
  detail_content: string | null;     // 🌟 텍스트 상세설명
  keywords?: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 문의하기 폼 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('제품을 불러오는 중 에러 발생:', error);
        alert('제품 정보를 불러올 수 없습니다.');
        router.push('/fresh-product');
      } else {
        setProduct(data);
      }
      setIsLoading(false);
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return alert('모든 항목을 입력해주세요.');

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('inquiries').insert([{
        product_name: product?.name,
        customer_name: formData.name,
        customer_email: formData.email,
        message: formData.message,
        status: '대기중'
      }]);

      if (error) throw error;
      alert('문의가 성공적으로 접수되었습니다. 담당자가 빠르게 연락드리겠습니다!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      alert('문의 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
        <Loader2 size={48} className="animate-spin text-green-600 mb-4" />
        <p className="text-gray-500 font-bold">제품 상세 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 뒤로가기 버튼 */}
        <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-green-600 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> 목록으로 돌아가기
        </button>

        {/* 🌟 1. 상단: 제품 요약 및 문의 폼 영역 */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-12 flex flex-col lg:flex-row">
          
          {/* 좌측: 대표 이미지 */}
          <div className="lg:w-1/2 bg-gray-100 flex items-center justify-center relative aspect-square lg:aspect-auto">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={64} className="text-gray-300" />
            )}
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-black rounded-lg uppercase shadow-sm tracking-widest">
                {product.category}
              </span>
            </div>
          </div>

          {/* 우측: 요약 정보 및 빠른 문의 폼 */}
          <div className="lg:w-1/2 p-10 lg:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-950 mb-2">{product.name}</h1>
            <p className="text-gray-400 font-bold mb-6 text-lg">{product.name_en}</p>
            <p className="text-gray-600 text-lg leading-relaxed font-medium mb-8">
              {product.desc}
            </p>

            {product.keywords && (
              <div className="flex flex-wrap gap-2 mb-10 pb-10 border-b border-gray-100">
                {product.keywords.split(',').map((keyword, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-bold rounded-lg">#{keyword.trim()}</span>
                ))}
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                <Send size={18} className="mr-2 text-green-600" /> 이 제품 빠른 문의하기
              </h3>
              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* 🌟 placeholder 색상과 입력 텍스트 색상을 또렷하게 수정했습니다! */}
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="회사명 / 담당자명" 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm font-bold text-gray-900 placeholder:text-gray-500 placeholder:font-medium" 
                  />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="이메일 주소" 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm font-bold text-gray-900 placeholder:text-gray-500 placeholder:font-medium" 
                  />
                </div>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleInputChange} 
                  required 
                  rows={3} 
                  placeholder="필요하신 수량, 희망 납기일 등 문의 내용을 적어주세요." 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm font-bold text-gray-900 placeholder:text-gray-500 placeholder:font-medium resize-none" 
                />
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-colors flex justify-center items-center shadow-md disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                  {isSubmitting ? '전송 중...' : '문의 접수하기'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 🌟 2. 하단: 상세 이미지 및 텍스트 상세설명 영역 */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-gray-900 flex items-center justify-center">
              <CheckCircle2 size={24} className="mr-2 text-green-600" /> 제품 상세 정보
            </h2>
          </div>

          {/* 텍스트 상세 설명이 있다면 출력! */}
          {product.detail_content && (
            <div className="max-w-4xl mx-auto mb-16 whitespace-pre-wrap text-gray-700 text-lg leading-loose font-medium bg-gray-50 p-8 rounded-2xl border border-gray-100">
              {product.detail_content}
            </div>
          )}

          {/* 세로로 긴 통이미지가 있다면 출력! */}
          {product.detail_image_url ? (
            <div className="w-full max-w-4xl mx-auto">
              <img src={product.detail_image_url} alt={`${product.name} 상세 이미지`} className="w-full h-auto rounded-2xl shadow-sm" />
            </div>
          ) : (
            !product.detail_content && (
              <div className="text-center py-20 text-gray-400 font-bold">
                등록된 상세 설명 내용이 없습니다.
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}