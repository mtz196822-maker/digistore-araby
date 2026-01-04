import React, { useState } from 'react';
import { CartItem } from '../types';
import { Button } from './Button';

interface CartSectionProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const CartSection: React.FC<CartSectionProps> = ({ cart, onUpdateQuantity, onRemove, onCheckout }) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15; // 15% VAT simulation
  const total = subtotal + tax;

  const [promoCode, setPromoCode] = useState('');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🛒</span> سلة المشتريات
          <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{cart.length} منتج</span>
        </h2>
      </div>

      {/* Cart Items List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-900/50">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">السلة فارغة حالياً</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">تصفح المتجر واكتشف أفضل المنتجات الرقمية.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex gap-3 transition-transform hover:scale-[1.01]">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.type === 'package' ? '📦 باقة' : '⚡ ملف'}</p>
                </div>
                <div className="flex justify-between items-end">
                   <div className="font-bold text-emerald-600 dark:text-emerald-400">{item.price} ر.س</div>
                   
                   <div className="flex items-center bg-gray-50 dark:bg-slate-700 rounded-lg p-1 gap-2 border border-gray-200 dark:border-slate-600">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-600 rounded shadow-sm text-gray-600 dark:text-white hover:text-red-500 disabled:opacity-50" disabled={item.quantity <= 1}>-</button>
                      <span className="text-sm font-bold w-4 text-center dark:text-white">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-600 rounded shadow-sm text-gray-600 dark:text-white hover:text-emerald-500">+</button>
                   </div>
                </div>
              </div>
              
              <button 
                onClick={() => onRemove(item.id)}
                className="self-start text-gray-300 hover:text-red-500 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer / Summary */}
      {cart.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          
          {/* Promo Code */}
          <div className="flex gap-2 mb-4">
             <input 
               type="text" 
               placeholder="كود الخصم" 
               className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
               value={promoCode}
               onChange={(e) => setPromoCode(e.target.value)}
             />
             <button className="px-4 py-2 bg-gray-800 dark:bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
               تطبيق
             </button>
          </div>

          <div className="space-y-2 mb-4 text-sm">
             <div className="flex justify-between text-gray-500 dark:text-gray-400">
               <span>المجموع الفرعي</span>
               <span>{subtotal.toFixed(2)} ر.س</span>
             </div>
             <div className="flex justify-between text-gray-500 dark:text-gray-400">
               <span>الضريبة (15%)</span>
               <span>{tax.toFixed(2)} ر.س</span>
             </div>
             <div className="border-t border-dashed border-gray-200 dark:border-slate-600 my-2 pt-2 flex justify-between items-end">
               <span className="font-bold text-gray-800 dark:text-white">الإجمالي النهائي</span>
               <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">{total.toFixed(2)} <span className="text-xs text-gray-400 font-normal">ر.س</span></span>
             </div>
          </div>

          <Button 
            className="w-full py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 text-lg font-bold" 
            onClick={onCheckout}
            size="lg"
          >
            تأكيد الطلب والدفع
          </Button>
        </div>
      )}
    </div>
  );
};