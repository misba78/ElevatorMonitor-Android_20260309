import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import Header from '@/components/Header'; 
import Footer from '@/components/Footer'; 
import { LanguageProvider } from '@/context/LanguageContext'; // 🌟 방송국 불러오기

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cheonan Fresh - Global Fresh Food Leader',
  description: 'Cheonan Fresh - 신선 과일, 임산물 수출입 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        
        {/* 🌟 방송국 텐트로 웹사이트 전체를 감싸줍니다! */}
        <LanguageProvider>
          
          {/* 이제 Header도 방송국 안에 있으니 lang과 t를 꺼내 쓸 수 있습니다! */}
          <Header /> 
          
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
            <Footer /> 
          </div>

        </LanguageProvider>

      </body>
    </html>
  );
}