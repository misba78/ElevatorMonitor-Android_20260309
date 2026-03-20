'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Save, X, Loader2, Image as ImageIcon, Upload, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Product = {
  id: number;
  category: string;
  image_url?: string;
  detail_image_url?: string; // 🌟 상세 이미지 URL 추가
  name: string;      name_en?: string;  name_cn?: string;
  desc: string;      desc_en?: string;  desc_cn?: string;
  keywords?: string; detail_content?: string;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ 
    category: 'Fruits', image_url: '', detail_image_url: '', // 🌟 추가
    name: '', name_en: '', name_cn: '', 
    desc: '', desc_en: '', desc_cn: '',
    keywords: '', detail_content: ''
  });
  
  // 대표 이미지 상태
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 🌟 상세 이미지 상태 추가
  const [detailImageFile, setDetailImageFile] = useState<File | null>(null);
  const [detailImagePreview, setDetailImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (error) console.error("제품 불러오기 에러:", error);
    setProducts(data || []);
    setIsLoading(false);
  };

  const openModal = (product: Product | null = null) => {
    setImageFile(null);
    setDetailImageFile(null); // 초기화
    if (product) {
      setEditingId(product.id);
      setFormData({ 
        category: product.category, 
        image_url: product.image_url || '',
        detail_image_url: product.detail_image_url || '', // 🌟 추가
        name: product.name, name_en: product.name_en || '', name_cn: product.name_cn || '',
        desc: product.desc, desc_en: product.desc_en || '', desc_cn: product.desc_cn || '',
        keywords: product.keywords || '', detail_content: product.detail_content || ''
      });
      setImagePreview(product.image_url || null);
      setDetailImagePreview(product.detail_image_url || null); // 🌟 추가
    } else {
      setEditingId(null);
      setFormData({ 
        category: 'Fruits', image_url: '', detail_image_url: '',
        name: '', name_en: '', name_cn: '', 
        desc: '', desc_en: '', desc_cn: '',
        keywords: '', detail_content: ''
      });
      setImagePreview(null);
      setDetailImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // 🌟 상세 이미지 업로드 핸들러 추가
  const handleDetailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDetailImageFile(e.target.files[0]);
      setDetailImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return alert('한국어 제품명은 필수 입력 사항입니다.');
    
    setIsUploading(true);
    try {
      let finalImageUrl = formData.image_url;
      let finalDetailImageUrl = formData.detail_image_url; // 🌟 추가
      
      // 1. 대표 이미지 업로드
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `product-photos/${Date.now()}_main_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile);
        if (uploadError) throw new Error('대표 이미지 업로드 실패: ' + uploadError.message);
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        finalImageUrl = urlData.publicUrl;
      }

      // 🌟 2. 상세 이미지 업로드
      if (detailImageFile) {
        const fileExt = detailImageFile.name.split('.').pop();
        const filePath = `product-photos/${Date.now()}_detail_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, detailImageFile);
        if (uploadError) throw new Error('상세 이미지 업로드 실패: ' + uploadError.message);
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        finalDetailImageUrl = urlData.publicUrl;
      }

      const productData = { 
        category: formData.category, 
        image_url: finalImageUrl,
        detail_image_url: finalDetailImageUrl, // 🌟 추가
        name: formData.name, name_en: formData.name_en, name_cn: formData.name_cn,
        desc: formData.desc, desc_en: formData.desc_en, desc_cn: formData.desc_cn,
        keywords: formData.keywords, detail_content: formData.detail_content
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingId);
        if (error) throw error;
        alert('제품 정보가 수정되었습니다!');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        alert('새 제품이 등록되었습니다!');
      }
      
      setIsModalOpen(false); 
      fetchProducts();
    } catch (error: any) {
      console.error("저장 중 에러 발생:", error);
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      setIsLoading(true);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert('삭제 실패: ' + error.message);
      fetchProducts();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center text-green-600 mb-2">
              <Package size={24} className="mr-2" />
              <span className="font-black tracking-widest text-sm uppercase">Product Management</span>
            </div>
            <h1 className="text-3xl font-black text-gray-950 tracking-tight">제품 카탈로그 관리</h1>
          </div>
          <button onClick={() => openModal()} className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-black">
            <Plus size={20} className="mr-2" /> 새 제품 등록
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-black text-gray-900 uppercase tracking-widest">
                <th className="p-5 w-24 text-center">Photo</th>
                <th className="p-5 w-32">Category</th>
                <th className="p-5">Product Name</th>
                <th className="p-5 w-32 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-green-50/30">
                  <td className="p-5 flex justify-center">
                    {product.image_url ? <img src={product.image_url} className="w-14 h-14 object-cover rounded-xl border border-gray-100" /> : <div className="w-14 h-14 bg-gray-50 flex items-center justify-center rounded-xl"><ImageIcon size={20} className="text-gray-300" /></div>}
                  </td>
                  <td className="p-5"><span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-black text-gray-600 uppercase tracking-wider">{product.category}</span></td>
                  <td className="p-5">
                    <div className="font-black text-gray-950 text-lg mb-1">{product.name}</div>
                    <div className="text-gray-400 font-semibold text-xs">{product.name_en || '영문명 미등록'}</div>
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={() => openModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl mr-2"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl my-8 overflow-hidden">
              <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gray-50">
                <h3 className="text-2xl font-black text-gray-950">{editingId ? '제품 정보 수정' : '새 제품 등록'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white p-2 rounded-full"><X size={24} /></button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                
                {/* 🌟 1. 이미지 2개 업로드 영역 (정사각형 대표 / 세로형 상세) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 대표 이미지 (목록용) */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <label className="block text-sm font-black text-gray-900 mb-3 text-center">목록용 썸네일 (정사각형 권장)</label>
                    <div className="w-full aspect-square bg-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center overflow-hidden mb-3 relative group">
                      {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400"><ImageIcon size={32} className="mx-auto mb-2 text-gray-300" /><span className="text-xs font-bold">이미지 없음</span></div>}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="text-white" size={24} /></div>
                    </div>
                    <label className="cursor-pointer w-full flex justify-center items-center px-4 py-3 bg-white border-2 border-green-600 text-green-700 rounded-xl text-sm font-black hover:bg-green-50">
                      썸네일 선택
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>

                  {/* 상세 이미지 (올려주신 사진처럼 긴 통이미지) */}
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                    <label className="block text-sm font-black text-green-900 mb-3 text-center">상세페이지 통이미지 (세로형 권장)</label>
                    <div className="w-full aspect-[3/4] bg-white border-2 border-dashed border-green-300 rounded-2xl flex items-center justify-center overflow-hidden mb-3 relative group">
                      {detailImagePreview ? <img src={detailImagePreview} className="w-full h-full object-cover" /> : <div className="text-center text-green-400"><ImageIcon size={32} className="mx-auto mb-2 opacity-50" /><span className="text-xs font-bold">올려주신 디자인처럼<br/>세로로 긴 이미지를 올려주세요</span></div>}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="text-white" size={24} /></div>
                    </div>
                    <label className="cursor-pointer w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 shadow-md">
                      상세 이미지 선택
                      <input type="file" accept="image/*" className="hidden" onChange={handleDetailImageChange} />
                    </label>
                  </div>
                </div>

               {/* 2. 텍스트 입력 영역 */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
  <div>
    <label className="block text-sm font-black text-gray-900 mb-2">카테고리</label>
    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none text-gray-950 font-black">
      <option value="Fruits">Fruits (과일류)</option><option value="Vegetable">Vegetable (채소류)</option><option value="Ambient">Ambient (상온 가공)</option><option value="Frozen">Frozen (냉동 가공)</option>
    </select>
  </div>
  <div>
    <label className="block text-sm font-black text-gray-900 mb-2">한국어 제품명</label>
    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none text-gray-950 font-black text-lg" placeholder="입력예시: 프리미엄 상주 청포도" />
  </div>
  <div className="md:col-span-2">
    <label className="block text-sm font-black text-gray-900 mb-2">짧은 한줄 설명</label>
    <input type="text" name="desc" value={formData.desc} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none text-gray-950 font-bold" placeholder="입력예시: 장인이 키워낸 평균 18 Brix 이상의 깊은 고당도 청포도" />
  </div>
  <div className="md:col-span-2">
     <label className="block text-sm font-black text-gray-900 mb-2">텍스트 상세설명 (이미지와 별개로 검색엔진/번역기용)</label>
     <textarea name="detail_content" value={formData.detail_content} onChange={handleChange} rows={4} className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none resize-none text-gray-950 font-medium leading-relaxed" placeholder="상세 이미지에 있는 글씨를 검색엔진이 읽을 수 있도록 텍스트로도 간단히 적어주시면 좋습니다." />
  </div>
</div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-600 font-black">취소하기</button>
                <button onClick={handleSave} disabled={isUploading} className="flex items-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-black shadow-xl">
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