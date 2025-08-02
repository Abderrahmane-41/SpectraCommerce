
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface Review {
  id: string;
  product_id: string;
  rating: number;
  comment?: string;
  reviewer_name?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  price_before_discount?: number | null;
  image_url?: string;
  images: string[];
  product_type_id: string;
  sizes?: string[];
  colors?: string[];
  options?: {
    sizes: Array<{ name: string; priceModifier: number }>;
    colors: Array<{ name: string; priceModifier: number }>;
  };
  quantity_offers?: Array<{ quantity: number; price: number }>; // Add this line
  description_content?: Array<{ type: 'text' | 'image'; content: string }> | null;
  min_quantity: number;
  max_quantity: number | null;

}

export interface OrderData {
  customer_name: string;
  customer_phone: string;
  wilaya: string;
  commune: string;
  full_address: string;
  product_name: string;
  product_id: string; // Add this field
  ip_address?: string;
  size: string;
  color: string;
  quantity: number;
  base_price: number;
  total_price: number;
  status: 'pending' | 'confirmed';
}

export const useProductById = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } else {
      // Transform the data to match our Product interface
      const options = data.options && typeof data.options === 'object' && data.options !== null 
        ? data.options as { sizes?: Array<{ name: string; priceModifier: number }>; colors?: Array<{ name: string; priceModifier: number }> }
        : { sizes: [], colors: [] };

      // Process description content before setting it
      let parsedDescriptionContent = null;
      if (data.description_content) {
        if (Array.isArray(data.description_content)) {
          parsedDescriptionContent = data.description_content;
        } else if (typeof data.description_content === 'string') {
          try {
            parsedDescriptionContent = JSON.parse(data.description_content);
          } catch (error) {
            console.error('Error parsing description_content:', error);
          }
        } else {
          parsedDescriptionContent = data.description_content;
        }
      }

      const transformedProduct: Product = {
        ...data,
        image_url: data.images?.[0] || null,
        sizes: options.sizes?.map((s) => s.name) || [],
        colors: options.colors?.map((c) => c.name) || [],
        options: {
          sizes: options.sizes || [],
          colors: options.colors || []
        },
        quantity_offers: data.quantity_offers ?
          (typeof data.quantity_offers === 'string' ?
            JSON.parse(data.quantity_offers) : data.quantity_offers) as Array<{ quantity: number; price: number; }> :
          undefined,
        description_content: parsedDescriptionContent,
        min_quantity: data.min_quantity || 1, // Default to 1 if not set
        max_quantity: data.max_quantity !== undefined ? data.max_quantity : null, // Default to
      };
      setProduct(transformedProduct);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  return { product, loading, refreshProduct: fetchProduct };
};

export const useReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();

    if (error) {
      console.error('Error adding review:', error);
      throw error;
    } else {
      await fetchReviews(); // Refresh reviews
      return data;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  return { reviews, loading, addReview, refreshReviews: fetchReviews };
};

export const useOrders = () => {
  const checkDuplicateOrder = async (productId: string, ipAddress: string): Promise<boolean> => {
    // Calculate time 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 6);
    
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('product_id', productId)
      .eq('ip_address', ipAddress)
      .gte('created_at', oneDayAgo.toISOString())
      .limit(1);
    
    if (error) {
      console.error('Error checking for duplicate orders:', error);
      return false; // Assume no duplicates if there's an error
    }
    
    return data && data.length > 0;
  };

  const addOrder = async (orderData: OrderData) => {
    console.log('Adding order with data:', orderData);
    
    // Get client IP address
    const ipAddress = orderData.ip_address || 'unknown';
    
    // Check for duplicate orders
    if (orderData.product_id) {
      const isDuplicate = await checkDuplicateOrder(orderData.product_id, ipAddress);
      
      if (isDuplicate) {
        throw new Error('duplicate_order');
      }
    }
    
    // Ensure all required fields are present
    const completeOrderData = {
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      wilaya: orderData.wilaya,
      commune: orderData.commune,
      full_address: orderData.full_address,
      product_name: orderData.product_name,
      product_id: orderData.product_id, // Add the product ID
      quantity: orderData.quantity,
      size: orderData.size,
      color: orderData.color,
      total_price: orderData.total_price,
      status: orderData.status || 'pending',
      ip_address: ipAddress // Add the IP address
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([completeOrderData])
      .select()
      .single();

    if (error) {
      console.error('Error adding order:', error);
      throw error;
    }

    console.log('Order successfully created:', data);
    return data;
  };

  return { addOrder };
};


export async function getClientIp(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return 'unknown';
  }
}