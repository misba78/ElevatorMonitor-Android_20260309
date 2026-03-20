'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, Eye, ChevronLeft, Clock, Share2 } from 'lucide-react';

export default function NewsDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [news, setNews] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      // 1. 해당 ID의 뉴스 데이터 가져오기
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        alert('존재하지 않는 게시글입니다.');
        router.push('/news');
        return;
      }

      setNews(data);
      setIsLoading(false);
      
      // (선택사항) 조회수 증가 로직을 여기에 추가할 수 있습니다.
    };

    if (id) fetchDetail();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-green-600 font-bold">소식을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white pb-24">
      {/* 상단 헤더 영역 */}
      <div className="bg-gray-50 border-b border-gray-100 pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-green-600 transition-colors mb-6 font-medium"
          >
            <ChevronLeft size={20} /> 목록으로 돌아가기
          </button>
          
          <div className="inline-block px-3 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-bold mb-4">
            {news.category}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 mb-6 leading-tight">
            {news.title}
          </h1>

          <div className="flex flex-wrap items-center text-gray-500 gap-6 text-sm border-t border-gray-200 pt-6">
            <div className="flex items-center"><Calendar size={16} className="mr-2" /> {news.date}</div>
            <div className="flex items-center"><Eye size={16} className="mr-2" /> 조회수 {news.views || 0}</div>
            <div className="ml-auto flex gap-4">
               <button className="hover:text-green-600"><Share2 size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* 대표 이미지가 있는 경우 표시 */}
        {news.image_url && (
          <div className="mb-12 rounded-3xl overflow-hidden shadow-xl shadow-gray-100">
            <img 
              src={news.image_url} 
              alt={news.title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* 텍스트 내용 */}
        <div className="prose prose-lg max-w-none">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
            {news.content}
          </p>
        </div>

        {/* 하단 네비게이션 (심플) */}
        <div className="mt-20 pt-10 border-t border-gray-100 flex justify-center">
          <button 
            onClick={() => router.push('/news')}
            className="px-10 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all shadow-lg shadow-green-100"
          >
            목록보기
          </button>
        </div>
      </div>
    </div>
  );
}