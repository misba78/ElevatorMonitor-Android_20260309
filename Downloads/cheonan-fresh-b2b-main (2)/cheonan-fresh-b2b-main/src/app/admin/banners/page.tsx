'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Image as ImageIcon, Upload, MonitorPlay, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Banner = {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  section: string;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ title: '', subtitle: '', image_url: '', link_url: '', section: 'fresh' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('banners').select('*').order('id', { ascending: false });
    if (error) console.error("불러오기 에러:", error);
    setBanners(data || []);
    setIsLoading(false);
  };

  const openModal = (banner: Banner | null = null) => {
    setImageFile(null);
    if (banner) {
      setEditingId(banner.id);
      setFormData({ title: banner.title, subtitle: banner.subtitle || '', image_url: banner.image_url, link_url: banner.link_url || '', section: banner.section });
      setImagePreview(banner.image_url);
    } else {
      setEditingId(null);
      setFormData({ title: '', subtitle: '', image_url: '', link_url: '', section: 'fresh' });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return alert('배너 메인 타이틀은 필수입니다.');
    
    setIsUploading(true);
    try {
      let finalImageUrl = formData.image_url;
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `banners/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile);
        if (uploadError) throw new Error('배너 이미지 업로드 실패: ' + uploadError.message);
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        finalImageUrl = urlData.publicUrl;
      }

      if (!finalImageUrl) return alert('배너 이미지를 선택해주세요.');

      const bannerData = { 
        title: formData.title, 
        subtitle: formData.subtitle,
        image_url: finalImageUrl,
        link_url: formData.link_url,
        section: formData.section
      };

      if (editingId) {
        const { error } = await supabase.from('banners').update(bannerData).eq('id', editingId);
        if (error) throw error;
        alert('배너가 수정되었습니다!');
      } else {
        const { error } = await supabase.from('banners').insert([bannerData]);
        if (error) throw error;
        alert('새 배너가 등록되었습니다!');
      }
      
      setIsModalOpen(false); 
      fetchBanners();
    } catch (error: any) {
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('이 배너를 롤링 목록에서 삭제하시겠습니까?')) {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) alert('삭제 실패: ' + error.message);
      fetchBanners();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center text-teal-600 mb-2">
              <MonitorPlay size={24} className="mr-2" />
              <span className="font-black tracking-widest text-sm uppercase">Rolling Banner</span>
            </div>
            <h1 className="text-3xl font-black text-gray-950 tracking-tight">롤링 배너 관리</h1>
          </div>
          <button onClick={() => openModal()} className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-black">
            <Plus size={20} className="mr-2" /> 새 배너 등록
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-black text-gray-900 uppercase tracking-widest">
                <th className="p-5 w-32 text-center">Image</th>
                <th className="p-5 w-24 text-center">Section</th>
                <th className="p-5">Banner Info</th>
                <th className="p-5 w-32 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-teal-50/30">
                  <td className="p-5 flex justify-center">
                    <img src={banner.image_url} alt={banner.title} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                  </td>
                  <td className="p-5 text-center">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-[10px] font-black uppercase tracking-wider">{banner.section}</span>
                  </td>
                  <td className="p-5">
                    <div className="text-xs font-bold text-teal-500 mb-1">{banner.subtitle || '뱃지 없음'}</div>
                    <div className="font-black text-gray-950 text-lg mb-1">{banner.title}</div>
                    <div className="text-gray-400 font-medium text-xs flex items-center mt-2">
                      <LinkIcon size={12} className="mr-1" /> {banner.link_url || '연결 링크 없음'}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={() => openModal(banner)} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl mr-2"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(banner.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {!isLoading && banners.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-bold">등록된 배너가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-950">{editingId ? '배너 수정' : '새 배너 등록'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-900" /></button>
              </div>
              <div className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">배너 노출 위치 (섹션)</label>
                  <select name="section" value={formData.section} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none text-gray-950 font-black">
                    <option value="fresh">신선제품 (Fresh Product) 페이지</option>
                    <option value="processed">가공제품 (Processed Product) 페이지</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">배너 이미지 (1:1 정사각형 권장)</label>
                  <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center overflow-hidden mb-3 relative group">
                    {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-gray-300" />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="text-white" size={24} /></div>
                  </div>
                  <label className="cursor-pointer block text-center px-4 py-3 bg-white border-2 border-teal-600 text-teal-700 rounded-xl font-black hover:bg-teal-50">
                    이미지 선택하기 <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">짧은 뱃지 텍스트</label>
                  <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none text-gray-950 font-bold" placeholder="예: BEST PICK, 시즌 한정" />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">메인 타이틀</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none text-gray-950 font-black" placeholder="예: 최상급 청포도 수출 특가" />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">클릭 시 이동할 링크 주소 (선택)</label>
                  <input type="text" name="link_url" value={formData.link_url} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none text-gray-950 font-bold" placeholder="예: /product/12 (해당 제품 상세페이지 주소)" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button onClick={handleSave} disabled={isUploading} className="flex items-center px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-black">
                  {isUploading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />} 저장하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}