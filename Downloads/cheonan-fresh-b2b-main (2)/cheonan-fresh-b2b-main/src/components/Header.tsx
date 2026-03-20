'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();
  
  const router = useRouter();
  const pathname = usePathname();

  const languages = ['KR', 'EN', 'CN'] as const;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * 🌟 1. 경로 반환 함수 (Safe Path Builder)
   * 현재 선택된 언어에 따라 링크 주소 뒤에 /eng 또는 /cn을 안전하게 붙여줍니다.
   */
  const getLocalizedPath = (basePath: string) => {
    // 슬래시 중복 및 시작 슬래시 누락 방지
    const cleanPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
    
    // 메인 홈('/')인 경우 접미사를 붙이지 않거나 별도 처리
    if (cleanPath === '/') {
      if (lang === 'EN') return '/eng';
      if (lang === 'CN') return '/cn';
      return '/';
    }

    if (lang === 'EN') return `${cleanPath}/eng`;
    if (lang === 'CN') return `${cleanPath}/cn`;
    return cleanPath;
  };

  /**
   * 🌟 2. 언어 변경 핸들러 (404 방어 로직 포함)
   * 버튼 클릭 시 현재 페이지의 언어 버전을 찾아 이동합니다.
   */
  const handleLanguageChange = (newLang: string) => {
    setLang(newLang as any);
    
    // 현재 경로에서 기존에 붙어있던 언어 접미사(/eng, /cn)를 제거하여 순수 경로 추출
    let basePath = pathname.replace(/\/eng$/, '').replace(/\/cn$/, '');
    if (basePath === '') basePath = '/';

    // 홈 페이지('/') 대응: 만약 app/eng/page.tsx 등의 파일이 없다면 
    // router.push를 하지 않고 return하게 설정할 수도 있습니다.
    // 여기서는 파일이 존재한다는 가정하에 안전한 경로로 안내합니다.
    
    let targetPath = basePath;
    if (newLang === 'EN') {
      targetPath = basePath === '/' ? '/eng' : `${basePath}/eng`;
    } else if (newLang === 'CN') {
      targetPath = basePath === '/' ? '/cn' : `${basePath}/cn`;
    } else {
      targetPath = basePath; // KR인 경우
    }

    // 이동하려는 경로가 현재와 같지 않을 때만 push
    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  };

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md py-0' 
          : 'bg-white shadow-sm py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 로고 */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={lang === 'KR' ? '/' : lang === 'EN' ? '/eng' : '/cn'} className="text-2xl font-black text-green-700 tracking-tighter">
              CheonanFresh
            </Link>
          </div>

          {/* PC 내비게이션 */}
          <nav className="hidden xl:flex space-x-6 text-sm">
            <Link href={getLocalizedPath('/about')} className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_about')}</Link>
            <Link href={getLocalizedPath('/fresh-product')} className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_fresh')}</Link>
            <Link href={getLocalizedPath('/processed-product')} className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_processed')}</Link>
            <Link href={getLocalizedPath('/fnc')} className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_fnc')}</Link>
            <Link href={getLocalizedPath('/global-network')} className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_global')}</Link>
            <Link href={getLocalizedPath('/partners')} className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_partners')}</Link>
            <Link href={getLocalizedPath('/news')} className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_news')}</Link>
            <Link href={getLocalizedPath('/contact')} className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_contact')}</Link>
          </nav>

          {/* 언어 선택 (PC) */}
          <div className="hidden md:flex items-center space-x-3 border-l pl-4 ml-2">
            <Globe size={18} className="text-gray-400" />
            <div className="flex space-x-2 text-sm">
              {languages.map((l) => (
                <button 
                  key={l} 
                  onClick={() => handleLanguageChange(l)}
                  className={`${lang === l ? 'font-bold text-green-700 underline underline-offset-4' : 'text-gray-400 hover:text-gray-600'} transition-all`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="xl:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-green-600 focus:outline-none">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 레이어 */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 pb-4 shadow-lg absolute w-full h-[80vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link href={getLocalizedPath('/about')} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_about')}</Link>
            <Link href={getLocalizedPath('/fresh-product')} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_fresh')}</Link>
            <Link href={getLocalizedPath('/processed-product')} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_processed')}</Link>
            <Link href={getLocalizedPath('/fnc')} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_fnc')}</Link>
            <Link href={getLocalizedPath('/global-network')} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_global')}</Link>
            <Link href={getLocalizedPath('/partners')} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_partners')}</Link>
            <Link href={getLocalizedPath('/news')} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_news')}</Link>
            {/* 해시 링크 처리 */}
            <Link href={`${getLocalizedPath('')}/#contact-section`} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_contact')}</Link>
          </div>
          
          {/* 모바일 언어 선택 */}
          <div className="px-4 pt-4 pb-6 border-t border-gray-100 flex justify-center space-x-4">
            {languages.map((l) => (
              <button 
                key={l} 
                onClick={() => { handleLanguageChange(l); setIsMobileMenuOpen(false); }}
                className={`text-sm px-6 py-2 rounded-full transition-all ${lang === l ? 'bg-green-600 font-bold text-white shadow-md' : 'text-gray-500 bg-gray-50'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}