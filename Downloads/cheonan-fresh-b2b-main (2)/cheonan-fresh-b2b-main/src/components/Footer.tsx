export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-gray-800 pb-8">
          
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter mb-4">CheonanFresh</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              자연이 내린 최상의 신선함을 전 세계로.<br/>
              대한민국 1등 프리미엄 농산물 수출 기업 Cheonan Fresh입니다.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-green-400 transition-colors">회사소개</a></li>
              <li><a href="/fresh-product" className="hover:text-green-400 transition-colors">신선제품</a></li>
              <li><a href="/processed-product" className="hover:text-green-400 transition-colors">가공제품</a></li>
              <li><a href="/contact" className="hover:text-green-400 transition-colors">고객문의</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: export@CheonanFresh.com</li>
              <li>Tel: +82 2-1234-5678</li>
              <li>Address: 서울특별시 영등포구 국제금융로 10</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Cheonan Fresh Corp. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <a href="/admin/login" className="hover:text-white transition-colors">관리자 접속</a>
          </div>
        </div>
      </div>
    </footer>
  );
}