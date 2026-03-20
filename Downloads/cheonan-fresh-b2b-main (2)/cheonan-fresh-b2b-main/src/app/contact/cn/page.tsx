'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return alert('请填写所有必填项。');

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('inquiries').insert([{
        name: formData.name,
        email: formData.email,
        message: formData.message,
        company: '官网 Contact 页面' 
      }]);

      if (error) throw error;
      
      alert('您的咨询已成功提交。负责人将尽快查看并与您联系！');
      setFormData({ name: '', email: '', message: '' }); 
    } catch (error: any) {
      console.error('发送错误详情:', error);
      alert('提交过程中发生错误: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-20 pb-24">
      {/* 상단 타이틀 */}
      <section className="bg-green-900 py-20 text-center px-4 shadow-inner">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">CONTACT US</h1>
        <p className="text-lg text-green-100 font-medium">期待与 Cheonan Fresh 的全球伙伴携手合作。</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* 좌측: 연락처 정보 */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-black text-gray-950 mb-6 tracking-tight">如有疑问，欢迎咨询！</h2>
            <p className="text-gray-600 mb-12 leading-relaxed font-medium text-lg">
              如果您对产品单价、起订量(MOQ)、独家代理等业务有任何疑问，请留言垂询。Cheonan Fresh 的出口专家将在 24 小时内为您提供详细解答。
            </p>

            <div className="space-y-10">
              {/* 본사 위치 */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><MapPin size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-1">总公司地址</h4>
                  <p className="text-gray-700 font-medium">首尔特别市永登浦区国际金融路 10，Cheonan Fresh 大厦</p>
                </div>
              </div>

              {/* 지방 사무소 영역 */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><MapPin size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-2">地方办事处</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-gray-900 text-base">平泽办事处</p>
                      <p className="text-gray-700 font-medium text-sm mt-1">平泽市平泽路 64 街 21-6, 206 号 (平泽洞, Lafeon Ville II)</p>
                      <p className="text-gray-500 font-medium text-sm mt-0.5">联系电话: 070-4790-8219</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">水原办事处</p>
                      <p className="text-gray-700 font-medium text-sm mt-1">京畿道水原市劝善区谷伴亭路 145, 2楼 (谷伴亭洞)</p>
                      <p className="text-gray-500 font-medium text-sm mt-0.5">联系电话: 070-4790-8219</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 전화 문의 */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><Phone size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-1">电话咨询</h4>
                  <p className="text-gray-700 font-medium">+82 2-1234-5678 (工作日 09:00 - 18:00)</p>
                </div>
              </div>

              {/* 이메일 문의 */}
              <div className="flex items-start group">
                <div className="p-4 bg-green-100 rounded-2xl text-green-700 mr-5 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm"><Mail size={28} /></div>
                <div>
                  <h4 className="font-black text-gray-950 text-lg mb-1">邮件咨询</h4>
                  <p className="text-gray-700 font-medium">export@CheonanFresh.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 문의 폼 */}
          <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-950 mb-8 flex items-center">
              <Send size={24} className="mr-2 text-green-600" /> 填写在线咨询
            </h3>
            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">公司名称 / 负责人姓名 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none bg-white text-gray-950 font-black text-lg placeholder:text-gray-400 placeholder:font-medium transition-all shadow-sm" 
                  placeholder="例：Cheonan Fresh 合作伙伴 / 洪吉童" 
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">回复邮箱 <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none bg-white text-gray-950 font-black text-lg placeholder:text-gray-400 placeholder:font-medium transition-all shadow-sm" 
                  placeholder="example@company.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">咨询内容 <span className="text-red-500">*</span></label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleInputChange} 
                  required 
                  rows={6} 
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none resize-none bg-white text-gray-950 font-bold text-base leading-relaxed placeholder:text-gray-400 placeholder:font-medium transition-all shadow-sm" 
                  placeholder="请自由填写您的合作咨询、报价请求等内容。" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full flex items-center justify-center py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all transform hover:-translate-y-1 disabled:opacity-50 text-lg mt-4"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin mr-2" /> : <Send size={24} className="mr-2" />}
                {isSubmitting ? '发送中...' : '提交咨询'}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}