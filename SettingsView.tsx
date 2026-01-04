import React from 'react';
import { User } from '../types';
import { Button } from './Button';

interface SettingsViewProps {
  user: User | null;
  onLogout: () => void;
  onLogin: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout, onLogin }) => {
  return (
    <div className="h-full bg-gray-50 dark:bg-slate-900 overflow-y-auto no-scrollbar pb-20 lg:pb-0">
      
      {/* Header Profile / Wallet Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-b-3xl shadow-sm mb-4 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-black text-gray-800 dark:text-white">حسابي</h2>
           {user && (
             <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
               {user.role === 'merchant' ? 'تاجر معتمد' : 'عضو مميز'}
             </span>
           )}
        </div>

        {user ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-900/20 mb-4">
             {/* Abstract Shapes */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl transform -translate-x-5 translate-y-5"></div>

             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 p-0.5">
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                   </div>
                   <div>
                      <p className="text-gray-300 text-sm">مرحباً بك،</p>
                      <h3 className="text-xl font-bold">{user.name}</h3>
                   </div>
                </div>

                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-xs text-emerald-400 mb-1 font-medium tracking-wider">رصيد المحفظة</p>
                      <p className="text-3xl font-bold tracking-tight">1,250.00 <span className="text-base font-normal text-gray-400">ر.س</span></p>
                   </div>
                   <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm transition-colors border border-white/10">
                      شحن الرصيد
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-6 text-center border-2 border-dashed border-gray-200 dark:border-slate-600">
             <div className="w-16 h-16 bg-gray-200 dark:bg-slate-600 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">👋</div>
             <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">لم تقم بتسجيل الدخول</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">سجل دخولك للوصول لمحفظتك ومشترياتك.</p>
             <Button onClick={onLogin} className="w-full">تسجيل الدخول / إنشاء حساب</Button>
          </div>
        )}
      </div>

      {/* Settings Sections */}
      <div className="px-4 space-y-4">
         
         {/* Group 1 */}
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <SettingsItem icon="🛍️" title="مشترياتي" subtitle="سجل الطلبات السابقة" hasArrow />
            <div className="h-px bg-gray-50 dark:bg-slate-700 mx-4"></div>
            <SettingsItem icon="❤️" title="المفضلة" subtitle="المنتجات المحفوظة" hasArrow />
            <div className="h-px bg-gray-50 dark:bg-slate-700 mx-4"></div>
            <SettingsItem icon="🎫" title="الكوبونات" subtitle="القسائم والخصومات" hasArrow />
         </div>

         {/* Group 2 */}
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <SettingsItem icon="🔔" title="الإشعارات" subtitle="تنبيهات العروض والتحديثات" toggle />
            <div className="h-px bg-gray-50 dark:bg-slate-700 mx-4"></div>
            <SettingsItem icon="🌍" title="اللغة" subtitle="العربية" />
            <div className="h-px bg-gray-50 dark:bg-slate-700 mx-4"></div>
            <SettingsItem icon="🌙" title="المظهر" subtitle="متكيف مع النظام" />
         </div>

         {/* Group 3 */}
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <SettingsItem icon="🎧" title="الدعم الفني" subtitle="تواصل معنا" hasArrow />
            <div className="h-px bg-gray-50 dark:bg-slate-700 mx-4"></div>
            <SettingsItem icon="📄" title="الشروط والأحكام" subtitle="سياسة الخصوصية" hasArrow />
         </div>

         {user && (
            <button 
              onClick={onLogout}
              className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
               تسجيل الخروج
            </button>
         )}

         <div className="text-center pb-8 pt-4">
             <p className="text-xs text-gray-400">نسخة التطبيق 2.5.0 (Pro)</p>
             <p className="text-[10px] text-gray-300 mt-1">Trillion Digital Store © 2024</p>
         </div>
      </div>
    </div>
  );
};

// Helper Component for Settings Items
const SettingsItem: React.FC<{icon: string, title: string, subtitle?: string, hasArrow?: boolean, toggle?: boolean}> = ({ icon, title, subtitle, hasArrow, toggle }) => (
  <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
      <div className="flex items-center gap-4">
          <span className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">{icon}</span>
          <div className="text-right">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{title}</h4>
              {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
      </div>
      {hasArrow && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
      )}
      {toggle && (
          <div className="w-11 h-6 bg-emerald-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
          </div>
      )}
  </button>
);