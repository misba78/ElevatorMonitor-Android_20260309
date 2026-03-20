'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Image as ImageIcon, Upload, Building2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Partner = {
  id: number;
  name: string;
  image_url: string;
  link_url: string;
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ name: '', image_url: '', link_url: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('partners').select('*').order('id', { ascending: true });
    if (error) console.error("불러오기 에러:", error);
    setPartners(data || []);
    setIsLoading(false);
  };

  const openModal = (partner: Partner | null = null) => {
    setImageFile(null);
    if (partner) {
      setEditingId(partner.id);
      setFormData({ name: partner.name, image_url: partner.image_url, link_url: partner.link_url || '' });
      setImagePreview(partner.image_url);
    } else {
      setEditingId(null);
      setFormData({ name: '', image_url: '', link_url: '' });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return alert('기관/회사명은 필수입니다.');
    
    setIsUploading(true);
    try {
      let finalImageUrl = formData.image_url;
      
      // 이미지 업로드 로직 (기존 product-images 버킷 재사용)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `partners/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile);
        if (uploadError) throw new Error('로고 업로드 실패: ' + uploadError.message);
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        finalImageUrl = urlData.publicUrl;
      }

      if (!finalImageUrl) return alert('로고 이미지를 선택해주세요.');

      const partnerData = { 
        name: formData.name, 
        image_url: finalImageUrl,
        link_url: formData.link_url
      };

      if (editingId) {
        const { error } = await supabase.from('partners').update(partnerData).eq('id', editingId);
        if (error) throw error;
        alert('수정되었습니다!');
      } else {
        const { error } = await supabase.from('partners').insert([partnerData]);
        if (error) throw error;
        alert('등록되었습니다!');
      }
      
      setIsModalOpen(false); 
      fetchPartners();
    } catch (error: any) {
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) alert('삭제 실패: ' + error.message);
      fetchPartners();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center text-blue-600 mb-2">
              <Building2 size={24} className="mr-2" />
              <span className="font-black tracking-widest text-sm uppercase">Partners Management</span>
            </div>
            <h1 className="text-3xl font-black text-gray-950 tracking-tight">협력사 배너 관리</h1>
          </div>
          <button onClick={() => openModal()} className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black">
            <Plus size={20} className="mr-2" /> 새 배너 등록
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-black text-gray-900 uppercase tracking-widest">
                <th className="p-5 w-32 text-center">Logo</th>
                <th className="p-5">Partner Name / Link</th>
                <th className="p-5 w-32 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-blue-50/30">
                  <td className="p-5 flex justify-center">
                    <img src={partner.image_url} alt={partner.name} className="w-20 h-10 object-contain" />
                  </td>
                  <td className="p-5">
                    <div className="font-black text-gray-950 text-lg mb-1">{partner.name}</div>
                    <div className="text-blue-500 font-medium text-xs flex items-center">
                      <LinkIcon size={12} className="mr-1" /> {partner.link_url || '링크 없음'}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={() => openModal(partner)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl mr-2"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(partner.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {!isLoading && partners.length === 0 && (
                <tr><td colSpan={3} className="p-10 text-center text-gray-400 font-bold">등록된 협력사가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 등록 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-950">{editingId ? '배너 수정' : '새 배너 등록'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-900" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">로고 이미지 (가로형 권장)</label>
                  <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center overflow-hidden mb-3 relative group">
                    {imagePreview ? <img src={imagePreview} className="w-full h-full object-contain p-4" /> : <ImageIcon size={32} className="text-gray-300" />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="text-white" size={24} /></div>
                  </div>
                  <label className="cursor-pointer block text-center px-4 py-3 bg-white border-2 border-blue-600 text-blue-700 rounded-xl font-black hover:bg-blue-50">
                    로고 선택하기 <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <div>
  <label className="block text-sm font-black text-gray-900 mb-2">기관 / 회사명</label>
  <input 
    type="text" 
    name="name" 
    value={formData.name} 
    onChange={handleChange} 
    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-gray-950 font-black" 
    placeholder="예: 한국무역협회 (KITA)" 
  />
</div>
<div>
  <label className="block text-sm font-black text-gray-900 mb-2">연결할 웹사이트 링크</label>
  <input 
    type="text" 
    name="link_url" 
    value={formData.link_url} 
    onChange={handleChange} 
    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-gray-900 font-bold" 
    placeholder="https://www.kita.net" 
  />
</div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button onClick={handleSave} disabled={isUploading} className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black">
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