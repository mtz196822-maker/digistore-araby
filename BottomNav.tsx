import React from 'react';

type Tab = 'shop' | 'cart' | 'news' | 'settings';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, cartCount }) => {
  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'shop',
      label: 'الرئيسية',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'cart',
      label: 'السلة',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      id: 'news',
      label: 'الجديد',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'حسابي',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:hidden z-50">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-slate-700 p-2 flex justify-between items-center max-w-sm mx-auto relative overflow-hidden">
        
        {/* Animated Background Indicator (Optional enhancement logic could go here, keeping it simple for now) */}
        
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 rounded-xl group ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {item.id === 'cart' && cartCount > 0 && (
                <span className="absolute top-1 right-3 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse"></span>
              )}
              
              <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1 scale-110' : ''}`}>
                {item.icon}
              </div>
              
              <span className={`text-[10px] font-bold absolute bottom-1 transition-opacity duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <span className="absolute -bottom-2 w-1 h-1 bg-emerald-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};