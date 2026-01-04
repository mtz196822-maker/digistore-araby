-- Supabase Database Functions (RPC)
-- Run this SQL to create helper functions

-- =====================================================
-- FUNCTION: Update wallet balance
-- =====================================================

CREATE OR REPLACE FUNCTION update_wallet_balance(
  user_id UUID,
  amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET wallet_balance = wallet_balance + amount,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- =====================================================
-- FUNCTION: Increment promo code usage
-- =====================================================

CREATE OR REPLACE FUNCTION increment_promo_usage(
  promo_code TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.promo_codes
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE code = promo_code;
END;
$$;

-- =====================================================
-- FUNCTION: Get product with average rating
-- =====================================================

CREATE OR REPLACE FUNCTION get_product_rating(product_id UUID)
RETUCRE TABLE (
  average_rating DECIMAL,
  review_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(rating), 0)::DECIMAL(3,2) as average_rating,
    COUNT(*)::INTEGER as review_count
  FROM public.reviews
  WHERE product_id = get_product_rating.product_id;
END;
$$;

-- =====================================================
-- FUNCTION: Reserve and get product key (atomic operation)
-- Prevents race conditions when multiple users buy same product
-- =====================================================

CREATE OR REPLACE FUNCTION reserve_product_key(
  p_product_id UUID,
  p_order_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key TEXT;
BEGIN
  -- Find and reserve an available key
  UPDATE public.product_keys
  SET status = 'sold',
      order_id = p_order_id,
      sold_at = NOW()
  WHERE id = (
    SELECT id
    FROM public.product_keys
    WHERE product_id = p_product_id
      AND status = 'available'
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING key_value INTO v_key;

  IF v_key IS NULL THEN
    RAISE EXCEPTION 'NO_AVAILABLE_KEYS';
  END IF;

  RETURN v_key;
END;
$$;

-- =====================================================
-- FUNCTION: Complete order and deliver key
-- =====================================================

CREATE OR REPLACE FUNCTION complete_order_delivery(
  p_order_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_key TEXT;
BEGIN
  -- Get order details
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id AND user_id = p_user_id;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  -- Get all order items
  FOR item IN 
    SELECT * FROM public.order_items 
    WHERE order_id = p_order_id
  LOOP
    -- Reserve key for each digital product
    IF EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = item.product_id AND type = 'digital_product'
    ) THEN
      v_key := reserve_product_key(item.product_id, p_order_id);
      
      -- Update order item with delivered key
      UPDATE public.order_items
      SET delivered_key = v_key
      WHERE id = item.id;
    END IF;
  END LOOP;

  -- Update order status
  UPDATE public.orders
  SET status = 'completed',
      updated_at = NOW()
  WHERE id = p_order_id;
END;
$$;

-- =====================================================
-- FUNCTION: Calculate order total with promo
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_order_total(
  p_items JSONB,
  p_promo_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  subtotal DECIMAL,
  tax DECIMAL,
  discount DECIMAL,
  total DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_subtotal DECIMAL := 0;
  v_discount DECIMAL := 0;
  v_item JSONB;
  v_promo RECORD;
BEGIN
  -- Calculate subtotal from items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_subtotal := v_subtotal + (v_item->>'price')::DECIMAL * (v_item->>'quantity')::INTEGER;
  END LOOP;

  -- Apply promo code if provided
  IF p_promo_code IS NOT NULL THEN
    SELECT * INTO v_promo
    FROM public.promo_codes
    WHERE code = p_promo_code
      AND is_active = true
      AND (valid_until IS NULL OR valid_until > NOW())
      AND (max_uses IS NULL OR current_uses < max_uses);

    IF FOUND AND v_subtotal >= COALESCE(v_promo.min_order_amount, 0) THEN
      IF v_promo.discount_type = 'percentage' THEN
        v_discount := v_subtotal * (v_promo.discount_value / 100);
      ELSE
        v_discount := v_promo.discount_value;
      END IF;

      -- Cap discount to subtotal
      IF v_discount > v_subtotal THEN
        v_discount := v_subtotal;
      END IF;
    END IF;
  END IF;

  -- Calculate tax (15% VAT)
  v_tax := (v_subtotal - v_discount) * 0.15;

  RETURN QUERY SELECT 
    v_subtotal,
    v_tax,
    v_discount,
    (v_subtotal - v_discount + v_tax);
END;
$$;

-- =====================================================
-- FUNCTION: Get merchant statistics
-- =====================================================

CREATE OR REPLACE FUNCTION get_merchant_stats(
  p_seller_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_sales DECIMAL,
  total_orders INTEGER,
  total_products INTEGER,
  average_order_value DECIMAL,
  top_products JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(oi.total_price), 0)::DECIMAL as total_sales,
    COUNT(DISTINCT o.id)::INTEGER as total_orders,
    (SELECT COUNT(*) FROM public.products WHERE seller_id = p_seller_id)::INTEGER as total_products,
    CASE 
      WHEN COUNT(DISTINCT o.id) > 0 
      THEN SUM(oi.total_price) / COUNT(DISTINCT o.id)
      ELSE 0
    END::DECIMAL as average_order_value,
    (
      SELECT jsonb_agg(jsonb_build_object(
        'title', p.title,
        'sales', COUNT(oi.id),
        'revenue', SUM(oi.total_price)
      ))
      FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE p.seller_id = p_seller_id
      GROUP BY p.id, p.title
      ORDER BY SUM(oi.total_price) DESC
      LIMIT 5
    ) as top_products
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE p.seller_id = p_seller_id
    AND o.status = 'completed'
    AND o.created_at BETWEEN p_start_date AND p_end_date;
END;
$$;

-- =====================================================
-- FUNCTION: Get user purchase history with keys
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_purchases(p_user_id UUID)
RETURNS TABLE (
  order_id UUID,
  order_date TIMESTAMP WITH TIME ZONE,
  total_amount DECIMAL,
  status TEXT,
  items JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.created_at,
    o.total_amount,
    o.status,
    (
      SELECT jsonb_agg(jsonb_build_object(
        'product_title', oi.product_title,
        'quantity', oi.quantity,
        'delivered_key', oi.delivered_key,
        'product_price', oi.product_price
      ))
      FROM public.order_items oi
      WHERE oi.order_id = o.id
    ) as items
  FROM public.orders o
  WHERE o.user_id = p_user_id
  ORDER BY o.created_at DESC;
END;
$$;

-- =====================================================
-- TRIGGER: Update product stock on order
-- =====================================================

CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_product RECORD;
BEGIN
  -- Get product details
  SELECT * INTO v_product
  FROM public.products
  WHERE id = NEW.product_id;

  IF v_product.type = 'digital_product' THEN
    -- Digital products - decrement stock
    UPDATE public.products
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity),
        updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_item_created
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();
