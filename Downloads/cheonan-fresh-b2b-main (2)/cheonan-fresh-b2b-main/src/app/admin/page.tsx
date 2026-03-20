'use client';

import Link from 'next/link';
import { 
  Package,
  ShoppingBag, 
  Newspaper,
  Mail, 
  Building2, 
  ArrowRight, 
  BarChart3, 
  ExternalLink,
  MonitorPlay // 🌟 이 단어가 꼭 들어가야 합니다!
} from 'lucide-react';

export default function AdminDashboard() {
  const menuItems = [
    {
      title: '제품 관리',
      desc: '신선제품 및 가공제품 등록/수정',
      icon: <Package className="text-green-600" size={32} />,
      link: '/admin/products',
      color: 'hover:border-green-500'
    },
    {
      title: '일반 문의함',
      desc: '홈페이지 하단 메인 문의 확인',
      icon: <Mail className="text-blue-600" size={32} />,
      link: '/admin/inquiries',
      color: 'hover:border-blue-500'
    },
    {
      title: '제품 상세 문의',
      desc: '제품별 개별 상담 및 견적 문의',
      icon: <ShoppingBag className="text-orange-600" size={32} />,
      link: '/admin/product-inquiries',
      color: 'hover:border-orange-500'
    },
    {
      title: '뉴스 관리',
      desc: '홈페이지 메인 새소식 업데이트',
      icon: <Newspaper className="text-purple-600" size={32} />,
      link: '/admin/news',
      color: 'hover:border-purple-500'
    },
    {
      title: '협력사 관리',
      desc: '메인 하단 글로벌 파트너 로고 및 링크 설정',
      icon: <Building2 className="text-indigo-600" size={32} />,
      link: '/admin/partners',
      color: 'hover:border-indigo-500'
    },
    // 🌟 롤링 배너 관리 메뉴 완벽 추가!
    {
      title: '롤링 배너 관리',
      desc: '신선/가공제품 페이지 상단 광고 배너 등록',
      icon: <MonitorPlay className="text-teal-600" size={32} />,
      link: '/admin/banners',
      color: 'hover:border-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <BarChart3 className="mr-3 text-gray-400" />
              CheonanFresh ADMIN
            </h1>
            <p className="text-gray-500 mt-2">CheonanFresh B2B 플랫폼 통합 관리 시스템입니다.</p>
          </div>
          <Link href="/" className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center transition-colors">
            사용자 페이지 바로가기 <ExternalLink size={14} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => (
            <Link 
              href={item.link} 
              key={idx}
              className={`group bg-white p-8 rounded-3xl border-2 border-transparent shadow-sm transition-all duration-300 ${item.color} hover:shadow-xl hover:-translate-y-1`}
            >
              <div className="mb-6 p-4 bg-gray-50 w-fit rounded-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {item.desc}
              </p>
              <span className="inline-flex items-center text-sm font-black text-gray-900">
                바로가기 <ArrowRight size={16} className="ml-1 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}