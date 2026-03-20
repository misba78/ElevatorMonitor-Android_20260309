'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'KR' | 'EN' | 'CN';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string; 
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// 🌟 Header.tsx에서 사용하는 'nav_xxx' 형식으로 이름표(Key)를 맞췄습니다!
const translations = {
  KR: { 
    nav_about: '회사소개', 
    nav_fresh: '신선제품', 
    nav_processed: '가공제품',
    nav_contact: '고객문의',
    nav_news: '새소식' 
  },
  EN: { 
    nav_about: 'About Us', 
    nav_fresh: 'Fresh Food', 
    nav_processed: 'Processed Food', 
    nav_contact: 'Contact',
    nav_news: 'News'
  },
  CN: { 
    nav_about: '公司介绍', 
    nav_fresh: '新鲜食品', 
    nav_processed: '加工食品', 
    nav_contact: '联系我们',
    nav_news: '新闻'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('KR');

  const t = (key: string) => {
    // translations[KR]['nav_about'] 이런 식으로 글자를 찾아옵니다.
    return (translations[lang] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage는 반드시 LanguageProvider 안에서 사용되어야 합니다!');
  }
  return context;
}