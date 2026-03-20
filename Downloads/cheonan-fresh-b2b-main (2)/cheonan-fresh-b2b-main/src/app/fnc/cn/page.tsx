'use client';

import { Utensils, ChefHat, Store, ArrowRight, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function FnCPage() {
  const brands = [
    {
      name: "Cheonan K-BBQ",
      category: "高端韩式餐饮",
      desc: "选用韩国产地直供的顶级肉类与新鲜食材，打造极致体验的高端韩式烧烤专门店。",
      icon: <Utensils size={40} className="text-orange-500 mb-4" />
    },
    {
      name: "Fresh Salad & Bowl",
      category: "健康轻食快餐",
      desc: "选用自家农场当日采收的有机蔬菜，打造健康且充满时尚感的沙拉与波奇饭品牌。",
      icon: <Coffee size={40} className="text-green-500 mb-4" />
    },
    {
      name: "K-Street Food Hub",
      category: "全球韩式小吃连锁",
      desc: "以现代化且卫生的管理系统，向全世界呈现深受大众喜爱的韩式潮流美食。",
      icon: <Store size={40} className="text-red-500 mb-4" />
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 pb-24">
      
      {/* 🌟 1. F&C 可视化区域 */}
      <section className="relative w-full h-[40vh] bg-orange-900 flex flex-col items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900 via-orange-800 to-red-900 z-10 opacity-90"></div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-orange-800 rounded-2xl mb-6 shadow-inner border border-orange-700">
            <ChefHat size={32} className="text-orange-200" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">F&C Business</h1>
          <p className="text-orange-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            将大自然的新鲜带到餐桌。<br/>以差异化的美味与服务，引领全球餐饮文化。
          </p>
        </div>
      </section>

      {/* 🌟 2. 品牌介绍区域 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-950 mb-4 tracking-tight">运营品牌介绍</h2>
          <p className="text-gray-500 font-bold">探索由 CheonanFresh 优质新鲜食材打造的高端餐饮品牌。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {brands.map((brand, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-gray-50 inline-block p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                {brand.icon}
              </div>
              <p className="text-sm font-black text-orange-600 mb-2">{brand.category}</p>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{brand.name}</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                {brand.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌟 3. 加盟与入驻咨询 */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[3rem] p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl font-black mb-6">成功的餐饮业务伙伴</h3>
          <p className="text-orange-100 mb-10 text-lg">
            依托 CheonanFresh 强大的食材供应链与餐饮经营秘诀，<br/>助力各位加盟商开启成功创业之路。
          </p>
          <Link href="/contact/cn" className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-black rounded-2xl hover:bg-orange-50 transition-colors shadow-lg">
            加盟及入驻咨询 <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}