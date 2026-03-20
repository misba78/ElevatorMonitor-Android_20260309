'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const languages = ['KR', 'EN', 'CN'];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black text-green-700 tracking-tighter">
              CheonanFresh
            </Link>
          </div>

          {/* 🌟 PC 메뉴: 새소식 뒤에 '고객문의' 추가 */}
          <nav className="hidden xl:flex space-x-6 text-sm">
            <Link href="/about/eng" className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_about')}</Link>
            <Link href="/fresh-product" className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_fresh')}</Link>
            <Link href="/processed-product" className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_processed')}</Link>
            <Link href="/fnc/eng" className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_fnc')}</Link>
            <Link href="/global-network" className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_global')}</Link>
            <Link href="/partners" className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_partners')}</Link>
            <Link href="/news" className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_news')}</Link>
            {/* 👇 새롭게 추가된 고객문의 메뉴 (메인 페이지의 폼으로 부드럽게 이동) */}
            <Link href="/contact/eng" className="text-gray-700 hover:text-green-600 font-medium transition-colors">{t('nav_contact')}</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-3 border-l pl-4 ml-2">
            <Globe size={18} className="text-gray-400" />
            <div className="flex space-x-2 text-sm">
              {languages.map((l) => (
                <button 
                  key={l} 
                  onClick={() => setLang(l as any)}
                  className={`${lang === l ? 'font-bold text-green-700' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="xl:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-green-600 focus:outline-none">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 pb-4 shadow-lg absolute w-full transition-transform origin-top h-[80vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link href="/about" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_about')}</Link>
            <Link href="/fresh-product" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_fresh')}</Link>
            <Link href="/processed-product" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_processed')}</Link>
            <Link href="/fnc" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_fnc')}</Link>
            <Link href="/global-network" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_global')}</Link>
            <Link href="/partners" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_partners')}</Link>
            <Link href="/news" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_news')}</Link>
            {/* 🌟 모바일 메뉴에도 '고객문의' 추가 */}
            <Link href="/#contact-section" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>{t('nav_contact')}</Link>
          </div>
          <div className="px-4 pt-4 pb-6 border-t border-gray-100 flex justify-center space-x-4">
            {languages.map((l) => (
              <button key={l} onClick={() => { setLang(l as any); setIsMobileMenuOpen(false); }} className={`text-sm px-4 py-2 rounded-full ${lang === l ? 'bg-green-100 font-bold text-green-700' : 'text-gray-500 bg-gray-50'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}