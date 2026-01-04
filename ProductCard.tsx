import React from 'react';
import { Product } from '../types';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-gray-50 dark:bg-slate-900">
        <img 
          src={product.image_url} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out opacity-90 hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 dark:opacity-80 transition-opacity duration-300"></div>
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-1 border border-gray-100 dark:border-slate-700">
          {product.type === 'package' ? '📦 باقة' : '⚡ رقمي'}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg leading-tight">{product.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow leading-relaxed">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-slate-700">
          <div className="flex flex-col">
              <span className="text-xs text-gray-400 dark:text-gray-500">السعر</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{product.price} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">ر.س</span></span>
          </div>
          <Button size="sm" onClick={() => onAddToCart(product)} className="shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            إضافة
          </Button>
        </div>
      </div>
    </div>
  );
};