import React, { useState } from 'react';
import { Button } from './Button';
import { User } from '../types';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

interface AuthFormsProps {
  mode: 'login' | 'signup' | 'merchant';
  onSuccess: (user: User) => void;
  onClose: () => void;
}

export const AuthForms: React.FC<AuthFormsProps> = ({ mode: initialMode, onSuccess, onClose }) => {
  const [activeMode, setActiveMode] = useState<'login' | 'signup'>(initialMode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // If initial mode is merchant, we lock the view to login but keep logic specific to merchant
  const isMerchantAuth = initialMode === 'merchant';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured && supabase) {
        if (activeMode === 'signup' && !isMerchantAuth) {
          const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
          if (authError) throw authError;
          if (authData.user) {
            const newUser: User = {
                id: authData.user.id,
                email: email,
                name: name,
                role: 'customer'
            };
            await supabase.from('users').insert(newUser);
            onSuccess(newUser);
          }
        } else {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;

            if (authData.user) {
                 const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();
                
                if (userError) throw userError;
                if (isMerchantAuth && userData.role !== 'merchant') {
                    throw new Error("هذا الحساب ليس حساب تاجر");
                }
                onSuccess(userData as User);
            }
        }
      } else {
        // Mock Logic
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockUser: User = {
          id: 'user_' + Date.now(),
          email,
          name: name || (isMerchantAuth ? 'التاجر التجريبي' : 'مستخدم تجريبي'),
          role: isMerchantAuth ? 'merchant' : 'customer'
        };

        // Basic validation simulation
        if (activeMode === 'login' && isMerchantAuth && !email.includes('merchant') && email !== '') {
           // allow for demo flexibility, but ideally would check
        }
        
        // Save mock user to local storage to simulate session persistence
        localStorage.setItem('digistore_user', JSON.stringify(mockUser));
        onSuccess(mockUser);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء العملية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!isMerchantAuth && (
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveMode('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeMode === 'login' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            تسجيل دخول
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('signup')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeMode === 'signup' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            حساب جديد
          </button>
        </div>
      )}

      {isMerchantAuth && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
            <span className="bg-white p-2 rounded-full shadow-sm">🏪</span>
            <div className="text-sm font-medium">مرحباً شريكنا العزيز، سجل دخولك لإدارة متجرك.</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {activeMode === 'signup' && !isMerchantAuth && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0h-3v-1a1 1 0 00-1-1H7a1 1 0 00-1 1v1H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                required
                className="w-full pr-10 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد محمد"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              type="email"
              required
              className="w-full pr-10 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isMerchantAuth ? 'merchant@store.com' : 'user@example.com'}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full pr-10 pl-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full py-3 shadow-lg shadow-emerald-500/20" 
          disabled={loading}
          size="lg"
        >
          {loading ? 'جاري المعالجة...' : (
            activeMode === 'signup' && !isMerchantAuth ? 'إنشاء الحساب' : 'تسجيل الدخول'
          )}
        </Button>

        <div className="text-center text-xs text-gray-400 mt-4">
          {!isSupabaseConfigured && (
            <p className="opacity-75">يتم حفظ الجلسة محلياً (وضع العرض)</p>
          )}
        </div>
      </form>
    </div>
  );
};