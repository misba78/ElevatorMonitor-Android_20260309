'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, X, Loader2, Newspaper, Image as ImageIcon, Upload } from 'lucide-react';

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null); // 이미지 파일 상태 추가
  const [formData, setFormData] = useState({ 
    title: '', 
    content: '', 
    category: 'Notice', 
    date: new Date().toISOString().split('T')[0].replace(/-/g, '.') 
  });

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    const { data, error } = await supabase.from('news').select('*').order('id', { ascending: false });
    if (error) console.error("불러오기 에러:", error);
    setNews(data || []);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) return alert('제목과 내용을 모두 입력해주세요!');
    
    setIsSubmitting(true);
    try {
      let image_url = '';

      // 🌟 1. 이미지가 있다면 Supabase Storage에 업로드
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `news-photos/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('news-images') // 아까 만든 버킷 이름
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 업로드된 이미지의 공개 URL 가져오기
        const { data: urlData } = supabase.storage
          .from('news-images')
          .getPublicUrl(filePath);
        
        image_url = urlData.publicUrl;
      }

      // 🌟 2. 뉴스 데이터 저장 (이미지 URL 포함)
      const { error } = await supabase.from('news').insert([
        { ...formData, image_url: image_url }
      ]);

      if (error) throw error;
      
      alert('성공적으로 등록되었습니다!');
      setIsModalOpen(false);
      setFile(null); // 파일 초기화
      setFormData({ title: '', content: '', category: 'Notice', date: new Date().toISOString().split('T')[0].replace(/-/g, '.') });
      fetchNews();
    } catch (error: any) {
      alert('저장 실패: ' + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, imageUrl: string) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      // 🌟 삭제 시 이미지도 Storage에서 지우고 싶다면 추가 로직이 필요하지만, 
      // 우선 DB 데이터부터 삭제합니다.
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) alert('삭제 실패!');
      fetchNews();
    }
  };

  return (
    <div className="p-8 pt-24 max-w-5xl mx-auto min-h-screen bg-gray-50/50">
      {/* 상단 헤더 영역 */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center text-blue-600 mb-2">
            <Newspaper size={24} className="mr-2" />
            <span className="font-black tracking-widest text-sm uppercase">Management</span>
          </div>
          <h1 className="text-4xl font-black text-gray-950 tracking-tighter">NEWS & UPDATE</h1>
          <p className="text-gray-500 mt-2 font-medium">홈페이지 메인에 노출될 기업 소식을 관리합니다.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center font-black shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-1"
        >
          <Plus size={20} className="mr-2 stroke-[3px]" /> 소식 추가하기
        </button>
      </div>

      {/* 뉴스 리스트 영역 */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {news.length > 0 ? news.map((item) => (
          <div key={item.id} className="p-8 flex justify-between items-center hover:bg-blue-50/30 transition-all group">
            <div className="flex items-center space-x-6">
              {/* 리스트에서 이미지 미리보기 */}
              {item.image_url ? (
                <img src={item.image_url} className="w-20 h-20 object-cover rounded-2xl border border-gray-100 shadow-sm" alt="Thumbnail" />
              ) : (
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 border border-gray-100">
                  <ImageIcon size={24} />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-md shadow-blue-100">
                    {item.category}
                  </span>
                  <span className="text-sm text-gray-400 font-bold">{item.date}</span>
                </div>
                <h3 className="font-black text-gray-900 text-xl group-hover:text-blue-700 transition-colors">{item.title}</h3>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(item.id, item.image_url)} 
              className="text-gray-300 hover:text-red-600 p-3 hover:bg-red-50 rounded-2xl transition-all"
            >
              <Trash2 size={24} />
            </button>
          </div>
        )) : (
          <div className="p-32 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
              <Newspaper size={40} />
            </div>
            <p className="text-gray-400 font-bold text-lg">등록된 소식이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 💬 새 소식 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-2xl border border-white/20 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <h3 className="text-2xl font-black text-gray-950 flex items-center">
                <Plus className="mr-2 text-blue-600 stroke-[3px]" /> 새 뉴스 작성
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* 이미지 업로드 칸 (추가됨!) */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 ml-1">뉴스 이미지 <span className="text-gray-400 font-medium">(선택사항)</span></label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="news-image-upload"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="news-image-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all overflow-hidden"
                  >
                    {file ? (
                      <div className="relative w-full h-full">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white mr-2" />
                          <span className="text-white font-bold">이미지 변경</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500 font-bold">이미지를 클릭하여 업로드하세요</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* 카테고리 선택 */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 ml-1">카테고리</label>
                <select 
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-600 outline-none font-bold text-gray-900 shadow-sm" 
                  value={formData.category} 
                  onChange={(e)=>setFormData({...formData, category: e.target.value})}
                >
                  <option value="Notice">Notice (일반 공지)</option>
                  <option value="Exhibition">Exhibition (전시회)</option>
                  <option value="Event">Event (이벤트)</option>
                </select>
              </div>

              {/* 제목 입력 */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 ml-1">제목</label>
                <input 
                  type="text" 
                  placeholder="소식 제목을 입력하세요" 
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-600 outline-none text-gray-950 font-black text-lg shadow-sm" 
                  value={formData.title} 
                  onChange={(e)=>setFormData({...formData, title: e.target.value})} 
                />
              </div>

              {/* 내용 입력 */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 ml-1">내용</label>
                <textarea 
                  placeholder="바이어들에게 전할 내용을 입력하세요." 
                  className="w-full p-5 bg-white border-2 border-gray-200 rounded-2xl h-32 focus:border-blue-600 outline-none resize-none text-gray-900 font-semibold shadow-sm" 
                  value={formData.content} 
                  onChange={(e)=>setFormData({...formData, content: e.target.value})} 
                />
              </div>

              {/* 하단 버튼 */}
              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-5 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200"
                >
                  취소
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSubmitting} 
                  className="flex-[2] py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-3" size={24} /> : null}
                  {isSubmitting ? '업로드 중...' : '뉴스 공개하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}