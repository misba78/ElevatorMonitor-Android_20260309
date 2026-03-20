'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight, Eye, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Supabase 설정 불러오기

const ITEMS_PER_PAGE = 5;

export default function NewsPage() {
  const [newsData, setNewsData] = useState<any[]>([]); // DB에서 가져온 데이터 상태
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Supabase에서 실시간으로 데이터 가져오기
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('id', { ascending: false }); // 최신순 정렬

      if (error) {
        console.error("데이터 로드 에러:", error);
      } else {
        setNewsData(data || []);
      }
      setIsLoading(false);
    };

    fetchNews();
  }, []);

  // 2. 검색 및 페이지네이션 로직
  const filteredNews = newsData.filter(news => 
    news.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentNews = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-24">
      
      {/* 3. 서브 페이지 비주얼 (디자인 유지) */}
      <section className="relative w-full h-[30vh] bg-green-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div className="relative z-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">NEWS</h1>
          <p className="text-green-100 text-lg">CheonanFresh의 새로운 소식과 다양한 활동을 전해드립니다.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* 4. 검색창 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="text-gray-600 font-medium">
            Total <span className="text-green-600 font-bold">{filteredNews.length}</span> 건
          </div>
          
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="검색어를 입력하세요" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm transition-shadow"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* 5. 게시판 리스트 영역 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* List Header (PC Only) */}
          <div className="hidden md:flex bg-gray-100 py-4 px-6 border-b border-gray-200 text-sm font-bold text-gray-700 text-center">
            <div className="w-20">NO</div>
            <div className="w-28">CATEGORY</div>
            <div className="flex-1 text-left pl-4">TITLE</div>
            <div className="w-32">DATE</div>
            {/* Supabase에는 views가 기본으로 없을 수 있으므로 유지 또는 제거 가능 */}
            <div className="w-20">VIEWS</div>
          </div>

          {/* List Body */}
          <ul className="divide-y divide-gray-100">
            {isLoading ? (
              <li className="py-20 text-center text-gray-500">데이터를 불러오는 중입니다...</li>
            ) : currentNews.length > 0 ? (
              currentNews.map((news, index) => (
                <li key={news.id} className="hover:bg-green-50 transition-colors duration-200">
                  <Link href={`/news/${news.id}`} className="flex flex-col md:flex-row items-start md:items-center py-5 px-6">
                    
                    <div className="hidden md:block w-20 text-center text-gray-400 font-medium">
                      {filteredNews.length - startIndex - index}
                    </div>
                    
                    {/* 카테고리 태그 (관리자 페이지 설정 반영) */}
                    <div className="w-auto md:w-28 text-center mb-2 md:mb-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        news.category === 'Notice' ? 'bg-red-100 text-red-600' :
                        news.category === 'Exhibition' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {news.category}
                      </span>
                    </div>

                    {/* 제목 및 이미지 아이콘 표시 */}
                    <div className="flex-1 w-full text-left md:pl-4 mb-3 md:mb-0">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-green-700 flex items-center">
                        {news.title}
                        {news.image_url && <ImageIcon size={16} className="ml-2 text-gray-400" />}
                      </h3>
                    </div>

                    {/* 날짜 및 조회수 */}
                    <div className="w-full md:w-auto flex items-center text-sm text-gray-500 gap-4 md:gap-0">
                      <div className="md:w-32 flex items-center md:justify-center">
                        <Calendar size={14} className="mr-2 md:hidden" />
                        {news.date}
                      </div>
                      <div className="md:w-20 flex items-center md:justify-center">
                        <Eye size={14} className="mr-2 md:hidden" />
                        <span className="md:hidden">조회수 </span> {news.views || 0}
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="py-20 text-center text-gray-500">
                검색된 게시글이 없습니다.
              </li>
            )}
          </ul>
        </div>

        {/* 6. 페이지네이션 (Pagination) */}
        {totalPages > 0 && (
          <div className="flex justify-center items-center mt-12 space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-green-50 border border-transparent'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}