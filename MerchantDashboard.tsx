import React, { useState } from 'react';
import { Button } from './Button';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface MerchantDashboardProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  sellerId: string;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ onAddProduct, sellerId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'digital_product' as 'digital_product' | 'package',
    imageUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return;

    onAddProduct({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      type: formData.type,
      seller_id: sellerId,
      image_url: formData.imageUrl || `https://picsum.photos/400/400?random=${Date.now()}`
    });

    setFormData({
      title: '',
      description: '',
      price: '',
      type: 'digital_product',
      imageUrl: ''
    });
    alert('تم نشر المنتج بنجاح!');
  };

  // Construct a preview object
  const previewProduct: Product = {
    id: 'preview',
    title: formData.title || 'اسم المنتج...',
    description: formData.description || 'وصف المنتج سيظهر هنا...',
    price: parseFloat(formData.price) || 0,
    type: formData.type,
    seller_id: sellerId,
    image_url: formData.imageUrl || 'https://via.placeholder.com/400?text=Preview'
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full overflow-y-auto p-1">
      {/* Form Section */}
      <div className="flex-1 space-y-6">
        <div>
           <h3 className="text-lg font-bold text-gray-800 mb-1">تفاصيل المنتج</h3>
           <p className="text-sm text-gray-500">أدخل المعلومات بدقة لجذب العملاء.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Type Selection */}
          <div className="grid grid-cols-2 gap-3">
             <div 
               onClick={() => setFormData({...formData, type: 'digital_product'})}
               className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${
                 formData.type === 'digital_product' 
                 ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                 : 'border-gray-200 hover:border-emerald-300'
               }`}
             >
                <span className="text-2xl block mb-1">⚡</span>
                <span className="text-sm font-bold text-gray-700">منتج رقمي</span>
             </div>
             <div 
               onClick={() => setFormData({...formData, type: 'package'})}
               className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${
                 formData.type === 'package' 
                 ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                 : 'border-gray-200 hover:border-emerald-300'
               }`}
             >
                <span className="text-2xl block mb-1">📦</span>
                <span className="text-sm font-bold text-gray-700">باقة متكاملة</span>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="مثال: كورس تصميم المواقع"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="اكتب وصفاً جذاباً ومختصراً..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ر.س)</label>
            <div className="relative">
                <input
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                    SAR
                </div>
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة (URL)</label>
            <div className="flex items-center gap-2">
                <input
                type="url"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm text-gray-600"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
                />
            </div>
            <p className="text-xs text-gray-400 mt-1">اتركها فارغة لاستخدام صورة عشوائية</p>
          </div>

          <Button type="submit" className="w-full py-3 mt-4 text-lg shadow-xl shadow-emerald-500/20">
            نشر المنتج الآن
          </Button>
        </form>
      </div>

      {/* Live Preview Section */}
      <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-0 space-y-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-bold">معاينة حية</span>
              </div>
              
              <div className="pointer-events-none transform scale-95 origin-top">
                <ProductCard product={previewProduct} onAddToCart={() => {}} />
              </div>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700 leading-relaxed">
                  💡 <strong>نصيحة:</strong> استخدم صور عالية الجودة ووصف دقيق لزيادة المبيعات بنسبة 40%.
              </div>
          </div>
      </div>
    </div>
  );
};