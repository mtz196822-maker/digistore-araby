import React from 'react';
import { NewsItem } from '../types';

interface NewsSectionProps {
  news: NewsItem[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  const getIcon = (type: NewsItem['type']) => {
    switch (type) {
      case 'offer': return '🔥';
      case 'update': return '🛠️';
      case 'alert': return '📢';
      default: return '📄';
    }
  };

  const getStyle = (type: NewsItem['type']) => {
    switch (type) {
      case 'offer': return 'bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-800 border-orange-100 dark:border-orange-900/30 text-orange-900 dark:text-orange-200';
      case 'update': return 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 border-blue-100 dark:border-blue-900/30 text-blue-900 dark:text-blue-200';
      case 'alert': return 'bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-slate-800 border-red-100 dark:border-red-900/30 text-red-900 dark:text-red-200';
      default: return 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-gray-100 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          آخر التحديثات
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto p-5 space-y-4">
        {news.map((item) => (
          <div 
            key={item.id} 
            className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 ${getStyle(item.type)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl bg-white dark:bg-slate-700/50 p-2 rounded-full shadow-sm">{getIcon(item.type)}</span>
              <span className="text-xs font-medium opacity-60 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-full text-current">{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
            </div>
            <h3 className="font-bold text-base mb-2">{item.title}</h3>
            <p className="text-sm opacity-80 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};