// =====================================================
// TypeScript Types for Trillion Digital Store
// Matches Supabase Database Schema
// =====================================================

// --- Enums ---

export type UserRole = 'customer' | 'merchant' | 'admin';

export type ProductType = 'package' | 'digital_product' | 'subscription';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export type NewsType = 'offer' | 'update' | 'alert' | 'general';

export type KeyStatus = 'available' | 'sold' | 'reserved';

export type DiscountType = 'percentage' | 'fixed';

// --- User Types ---

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UserUpdateInput {
  name?: string;
  avatar_url?: string;
  wallet_balance?: number;
}

// --- Product Types ---

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ProductType;
  category?: string;
  image_url: string;
  seller_id?: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  average_rating?: number;
  review_count?: number;
  reviews?: Review[];
}

export interface ProductCreateInput {
  title: string;
  description: string;
  price: number;
  type: ProductType;
  category?: string;
  image_url: string;
  seller_id: string;
}

export interface ProductUpdateInput {
  title?: string;
  description?: string;
  price?: number;
  type?: ProductType;
  category?: string;
  image_url?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

// --- Product Key Types ---

export interface ProductKey {
  id: string;
  product_id: string;
  key_value: string;
  status: KeyStatus;
  order_id?: string;
  sold_at?: string;
  created_at: string;
}

export interface ProductKeyCreateInput {
  product_id: string;
  key_value: string;
}

// --- Order Types ---

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  status: OrderStatus;
  payment_method?: string;
  payment_id?: string;
  promo_code_used?: string;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  order_items?: OrderItem[];
}

export interface OrderCreateInput {
  user_id: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method?: string;
  payment_id?: string;
  promo_code_used?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

// --- Order Item Types ---

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
  total_price: number;
  delivered_key?: string;
}

export interface OrderItemCreateInput {
  order_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  quantity: number;
  total_price: number;
  delivered_key?: string;
}

// --- News Types ---

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: NewsType;
  image_url?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface NewsCreateInput {
  title: string;
  content: string;
  type: NewsType;
  image_url?: string;
  is_published?: boolean;
}

// --- Wishlist Types ---

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// --- Review Types ---

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  is_verified_purchase: boolean;
  created_at: string;
  // Additional fields from joins
  user?: Pick<User, 'name' | 'avatar_url'>;
}

export interface ReviewCreateInput {
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
}

// --- Promo Code Types ---

export interface PromoCode {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
}

export interface PromoCodeValidation {
  valid: boolean;
  promo?: PromoCode;
  error?: string;
}

// --- Auth Types ---

export interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_at: number;
}

// --- API Response Types ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// --- Stats Types ---

export interface MerchantStats {
  total_sales: number;
  total_orders: number;
  total_products: number;
  average_order_value: number;
  top_products: Array<{
    title: string;
    sales: number;
    revenue: number;
  }>;
}

export interface UserPurchase {
  order_id: string;
  order_date: string;
  total_amount: number;
  status: OrderStatus;
  items: Array<{
    product_title: string;
    quantity: number;
    delivered_key?: string;
    product_price: number;
  }>;
}

// --- Filter Types ---

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  type?: ProductType;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}
