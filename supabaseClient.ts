import { createClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';

// إعدادات Supabase - يجب استبدال القيم الفعلية في ملف .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// التحقق من وجود إعدادات Supabase
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// إنشاء عميل Supabase (أو null إذا لم يتم تكوينه)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// =====================================================
// دوال المصادقة (Authentication Functions)
// =====================================================

/**
 * تسجيل مستخدم جديد
 */
export async function signUp(email: string, password: string, name: string) {
  if (!supabase) {
    throw new Error('Supabase غير مُكوّن');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
 */
export async function signInWithPassword(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase غير مُكوّن');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * تسجيل الدخول عبر Google
 */
export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error('Supabase غير مُكوّن');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * تسجيل الخروج
 */
export async function signOut() {
  if (!supabase) {
    throw new Error('Supabase غير مُكوّن');
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * الحصول على المستخدم الحالي
 */
export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * استعادة الجلسة
 */
export async function getSession() {
  if (!supabase) {
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * الاستماع لتغيرات المصادقة
 */
export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  if (!supabase) {
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

// =====================================================
// دوال قاعدة البيانات (Database Functions)
// =====================================================

// --- Users (المستخدمين) ---

export async function getUserProfile(userId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserWalletBalance(userId: string, amount: number) {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc('update_wallet_balance', {
    user_id: userId,
    amount: amount,
  });

  if (error) throw error;
  return data;
}

// --- Products (المنتجات) ---

export async function getProducts(options?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  limit?: number;
  offset?: number;
}) {
  if (!supabase) return [];

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (options?.category) {
    query = query.eq('category', options.category);
  }
  if (options?.minPrice) {
    query = query.gte('price', options.minPrice);
  }
  if (options?.maxPrice) {
    query = query.lte('price', options.maxPrice);
  }
  if (options?.sellerId) {
    query = query.eq('seller_id', options.sellerId);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

export async function getProductById(productId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .select('*, reviews(*, users(name))')
    .eq('id', productId)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

export async function createProduct(product: {
  title: string;
  description: string;
  price: number;
  type: string;
  category?: string;
  image_url: string;
  seller_id: string;
}) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(productId: string, updates: Record<string, unknown>) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Product Keys (مفاتيح المنتجات) ---

export async function getAvailableKey(productId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('product_keys')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'available')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching available key:', error);
    return null;
  }
  return data;
}

export async function reserveAndGetKey(productId: string, orderId: string) {
  if (!supabase) return null;

  // استخدام RPC function لتجنب race conditions
  const { data, error } = await supabase.rpc('reserve_product_key', {
    product_id: productId,
    order_id: orderId,
  });

  if (error) throw error;
  return data;
}

export async function addProductKeys(productId: string, keys: string[]) {
  if (!supabase) return null;

  const keysData = keys.map((key_value) => ({
    product_id: productId,
    key_value,
    status: 'available',
  }));

  const { data, error } = await supabase
    .from('product_keys')
    .insert(keysData)
    .select();

  if (error) throw error;
  return data;
}

// --- Orders (الطلبات) ---

export async function createOrder(order: {
  user_id: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method?: string;
  payment_id?: string;
  promo_code_used?: string;
}) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserOrders(userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
  return data;
}

export async function getOrderById(orderId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }
  return data;
}

// --- Order Items (عناصر الطلب) ---

export async function createOrderItem(item: {
  order_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
  total_price: number;
  delivered_key?: string;
}) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('order_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- News (الأخبار) ---

export async function getNews(limit = 10) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }
  return data;
}

// --- Wishlist (المفضلة) ---

export async function getUserWishlist(userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('wishlists')
    .select('*, products(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
  return data;
}

export async function addToWishlist(userId: string, productId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromWishlist(userId: string, productId: string) {
  if (!supabase) return null;

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) throw error;
}

export async function isInWishlist(userId: string, productId: string) {
  if (!supabase) return false;

  const { data, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (error) return false;
  return !!data;
}

// --- Reviews (التقييمات) ---

export async function getProductReviews(productId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select('*, users(name, avatar_url)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data;
}

export async function createReview(review: {
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
}) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Promo Codes (أكواد الخصم) ---

export async function validatePromoCode(code: string, orderAmount: number) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { valid: false, error: 'كود الخصم غير صحيح أو منتهي' };
  }

  if (data.valid_until && new Date(data.valid_until) < new Date()) {
    return { valid: false, error: 'كود الخصم منتهي الصلاحية' };
  }

  if (data.max_uses && data.current_uses >= data.max_uses) {
    return { valid: false, error: 'تم استخدام الحد الأقصى لهذا الكود' };
  }

  if (orderAmount < data.min_order_amount) {
    return { valid: false, error: `الحد الأدنى للطلب ${data.min_order_amount} ر.س` };
  }

  return { valid: true, promo: data };
}

export async function usePromoCode(code: string) {
  if (!supabase) return null;

  const { error } = await supabase
    .from('promo_codes')
    .update({ current_uses: supabase.rpc('increment', { x: 1 }) })
    .eq('code', code);

  if (error) throw error;
}

// =====================================================
// دوال التخزين (Storage Functions)
// =====================================================

export async function uploadImage(file: File, folder = 'products') {
  if (!supabase) return null;

  const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteImage(imageUrl: string) {
  if (!supabase) return;

  const urlParts = imageUrl.split('/');
  const fileName = urlParts.slice(-2).join('/');

  const { error } = await supabase.storage
    .from('images')
    .remove([fileName]);

  if (error) throw error;
}
