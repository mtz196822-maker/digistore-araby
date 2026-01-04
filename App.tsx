import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartSection } from './components/CartSection';
import { NewsSection } from './components/NewsSection';
import { BottomNav } from './components/BottomNav';
import { SettingsView } from './components/SettingsView';
import { Modal } from './components/Modal';
import { MerchantDashboard } from './components/MerchantDashboard';
import { AuthForms } from './components/AuthForms';
import { Toast } from './components/Toast';
import { MOCK_NEWS } from './constants';
import { User, Product, CartItem, NewsItem } from './types';
import { 
  isSupabaseConfigured, 
  supabase, 
  onAuthStateChange,
  getSession,
  getUserProfile,
  getProducts,
  getNews,
  createOrder,
  updateOrderStatus
} from './services/supabaseClient';

function App() {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState<'shop' | 'cart' | 'news' | 'settings'>('shop');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'package' | 'digital_product'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' | 'merchant' }>({ 
    isOpen: false, 
    mode: 'login' 
  });
  const [merchantModalOpen, setMerchantModalOpen] = useState(false);

  // --- Effects ---

  // Initialize app and auth
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Load theme
      const storedTheme = localStorage.getItem('digistore_theme');
      const isDark = storedTheme === 'dark';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }

      // 2. Load cart from localStorage
      const storedCart = localStorage.getItem('digistore_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }

      // 3. Handle auth state
      if (isSupabaseConfigured && supabase) {
        try {
          // Check existing session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const userProfile = await getUserProfile(session.user.id);
            if (userProfile) {
              setUser(userProfile);
            }
          }

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (event === 'SIGNED_IN' && session?.user) {
                const userProfile = await getUserProfile(session.user.id);
                if (userProfile) {
                  setUser(userProfile);
                  showToast(`مرحباً بك، ${userProfile.name}`, 'success');
                }
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
              }
            }
          );

          return () => subscription.unsubscribe();
        } catch (error) {
          console.error('Auth initialization error:', error);
        }
      }
    };

    initializeApp();
  }, []);

  // Load products and news from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load products
        const fetchedProducts = await getProducts();
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }

        // Load news from database (fallback to mock)
        if (isSupabaseConfigured) {
          const fetchedNews = await getNews();
          if (fetchedNews.length > 0) {
            setNews(fetchedNews);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('digistore_cart', JSON.stringify(cart));
  }, [cart]);

  // --- Theme Toggle ---
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('digistore_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('digistore_theme', 'light');
      }
      return newMode;
    });
  };

  // --- Helpers ---
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  // --- Handlers ---
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`تم إضافة "${product.title}" للسلة`, 'success');
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('تم حذف المنتج من السلة', 'info');
  };

  const handleCheckout = async () => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }

    if (cart.length === 0) {
      showToast('السلة فارغة', 'error');
      return;
    }

    showToast('جاري معالجة الطلب...', 'info');

    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.15;
      const finalAmount = subtotal + tax;

      // Create order in database
      if (isSupabaseConfigured && supabase) {
        const order = await createOrder({
          user_id: user.id,
          total_amount: subtotal,
          tax_amount: tax,
          discount_amount: 0,
          final_amount: finalAmount,
          payment_method: 'manual',
        });

        if (order) {
          await updateOrderStatus(order.id, 'completed');
        }
      }

      setCart([]);
      showToast('تم استلام طلبك بنجاح! 🎉', 'success');
      setActiveTab('shop');
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('حدث خطأ أثناء معالجة الطلب', 'error');
    }
  };

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct = { ...newProductData, id: Date.now().toString() } as Product;
    setProducts(prev => [newProduct, ...prev]);
    setMerchantModalOpen(false);
    showToast('تم نشر المنتج بنجاح في المتجر', 'success');
  };

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setAuthModal({ ...authModal, isOpen: false });
    showToast(`مرحباً بك مجدداً، ${user.name}`, 'success');
  };

  // --- Filtered Products ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  // --- Render Components ---
  
  const ShopComponent = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full overflow-hidden">
      {/* Shop Header & Hero */}
      <div className="bg-white dark:bg-slate-800 sticky top-0 z-10 border-b border-gray-100 dark:border-slate-700">
        
        {/* Banner/Hero */}
        <div className="bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] transform -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[60px] transform translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10 p-8 pb-12">
                <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold mb-3 tracking-wider uppercase">
                  المتجر الرقمي الأول
                </span>
                <h2 className="text-3xl font-black mb-3 tracking-tight leading-tight">
                  ترليون <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-teal-200">للأصول الرقمية</span>
                </h2>
                <p className="text-gray-400 text-sm mb-6 max-w-md leading-relaxed">
                    استثمر في أدواتك الرقمية وارتقِ بمشاريعك للمستوى التالي.
                </p>
                
                {/* Search Bar Floating */}
                <div className="relative shadow-2xl shadow-black/20">
                    <input 
                        type="text" 
                        placeholder="ابحث عن باقات، قوالب، أو كورسات..." 
                        className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border-0 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-3 top-3 bg-emerald-500 p-1.5 rounded-lg text-white shadow-lg shadow-emerald-500/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 p-4 overflow-x-auto no-scrollbar bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
            <button 
                onClick={() => setFilterType('all')}
                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${filterType === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-emerald-400'}`}
            >
                الكل
            </button>
            <button 
                onClick={() => setFilterType('package')}
                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${filterType === 'package' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-emerald-400'}`}
            >
                📦 باقات متكاملة
            </button>
            <button 
                onClick={() => setFilterType('digital_product')}
                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${filterType === 'digital_product' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-blue-400'}`}
            >
                ⚡ ملفات رقمية
            </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 lg:p-6 scroll-smooth bg-gray-50/50 dark:bg-slate-900/50 pb-24 lg:pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <p className="text-lg font-medium">عفواً، لا توجد نتائج</p>
                <button onClick={() => {setSearchQuery(''); setFilterType('all');}} className="text-emerald-600 dark:text-emerald-400 text-sm mt-2 font-bold hover:underline">
                    مسح فلاتر البحث
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
            </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <Navbar 
        user={user}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        onLogout={() => { setUser(null); showToast('تم تسجيل الخروج', 'info'); }}
        onOpenMerchantDashboard={() => setMerchantModalOpen(true)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="flex-grow p-3 lg:p-6 lg:h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto h-full">
          
          {/* --- Desktop Layout (Grid) --- */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-full">
            {/* Main Shop - 8 Columns */}
            <div className="lg:col-span-8 h-full">
               <ShopComponent />
            </div>
            
            {/* Sidebar - 4 Columns */}
            <div className="lg:col-span-4 h-full flex flex-col gap-6">
               <div className="flex-1 overflow-hidden">
                   <CartSection 
                      cart={cart}
                      onUpdateQuantity={handleUpdateCartQuantity}
                      onRemove={handleRemoveFromCart}
                      onCheckout={handleCheckout}
                   />
               </div>
               <div className="h-1/3 overflow-hidden">
                  <NewsSection news={news} />
               </div>
            </div>
          </div>

          {/* --- Mobile Layout --- */}
          <div className="lg:hidden h-full">
            {activeTab === 'shop' && <ShopComponent />}
            
            {activeTab === 'cart' && (
              <div className="h-full pb-20">
                <CartSection 
                    cart={cart}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemove={handleRemoveFromCart}
                    onCheckout={handleCheckout}
                />
              </div>
            )}
            
            {activeTab === 'news' && (
                <div className="h-full pb-20">
                    <NewsSection news={news} />
                </div>
            )}
            
            {activeTab === 'settings' && (
              <SettingsView 
                user={user} 
                onLogout={() => { setUser(null); showToast('تم تسجيل الخروج', 'info'); }}
                onLogin={() => setAuthModal({isOpen: true, mode: 'login'})}
              />
            )}
          </div>

        </div>
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
      />

      {/* Modals */}
      <Modal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        title={
          authModal.mode === 'merchant' ? 'بوابة التجار' :
          activeTab === 'settings' || authModal.mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'
        }
      >
        <AuthForms 
          mode={authModal.mode} 
          onSuccess={handleLoginSuccess}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        />
      </Modal>

      <Modal
        isOpen={merchantModalOpen}
        onClose={() => setMerchantModalOpen(false)}
        title="لوحة تحكم التاجر"
      >
        {user && user.role === 'merchant' && (
          <MerchantDashboard sellerId={user.id} onAddProduct={handleAddProduct} />
        )}
      </Modal>
    </div>
  );
}

export default App;
