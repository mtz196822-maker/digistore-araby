import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Button } from './Button';

interface NavbarProps {
  user: User | null;
  onOpenAuth: (mode: 'login' | 'signup' | 'merchant') => void;
  onLogout: () => void;
  onOpenMerchantDashboard: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onOpenAuth, 
  onLogout, 
  onOpenMerchantDashboard,
  isDarkMode,
  toggleTheme
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          
          {/* RIGHT: Dark Mode Toggle */}
          <div className="flex-shrink-0 flex items-center">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* CENTER: Logo "Trillion" */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white font-bold text-xl">
              T
            </div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-400 dark:to-teal-200 tracking-tight">
              ترليون
            </h1>
          </div>

          {/* LEFT: Hamburger Menu */}
          <div className="flex-shrink-0 relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute left-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 transform origin-top-left transition-all z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                
                {/* User Info Header if Logged In */}
                {user && (
                   <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                     <p className="text-sm text-gray-500 dark:text-gray-400">مرحباً</p>
                     <p className="text-base font-bold text-gray-800 dark:text-white truncate">{user.name}</p>
                   </div>
                )}

                <div className="p-2 space-y-1">
                  {user ? (
                    <>
                      {user.role === 'merchant' && (
                        <button 
                          onClick={() => { onOpenMerchantDashboard(); setIsMenuOpen(false); }}
                          className="w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2"
                        >
                          <span>📊</span> لوحة التاجر
                        </button>
                      )}
                      <button 
                        onClick={() => { onLogout(); setIsMenuOpen(false); }}
                        className="w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                      >
                         <span>🚪</span> تسجيل الخروج
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { onOpenAuth('login'); setIsMenuOpen(false); }}
                        className="w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                         <span>🔐</span> تسجيل الدخول
                      </button>
                      <button 
                        onClick={() => { onOpenAuth('signup'); setIsMenuOpen(false); }}
                        className="w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                         <span>✨</span> إنشاء حساب جديد
                      </button>
                      <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                      <button 
                        onClick={() => { onOpenAuth('merchant'); setIsMenuOpen(false); }}
                        className="w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center gap-2"
                      >
                         <span>💼</span> دخول كتاجر
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};