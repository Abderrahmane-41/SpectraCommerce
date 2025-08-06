import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface Order {
  quantity: number;
  id: string;
  customer_name: string;
  customer_phone: string;
  wilaya: string;
  commune: string;
  full_address: string;
  product_name: string;
  size: string;
  product_id: string; // Add this field to link to the product
  ip_address?: string;
  color: string;
  custom_options?: Record<string, string>; // Add this field

  total_price: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  created_at: string;
  updated_at?: string | null;

  order_time?: string; // Add this field for order time
  is_synced_to_gsheet?: boolean; // Add this field to track GSheet sync
}

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  price_before_discount?: number | null;
  images: string[];
  product_type_id: string;
  options: {
    sizes: Array<{ name: string; priceModifier: number }>;
    colors: Array<{ name: string; priceModifier: number }>;
    customOptions: Array<{ 
      optionName: string; 
      values: Array<{ name: string; priceModifier: number }>
    }>;
  };
  quantity_offers?: Array<{ quantity: number; price: number }>; // Add this line
  description_content?: Array<{ type: 'text' | 'image'; content: string }> | null;
  min_quantity: number;
  max_quantity: number | null;

}

export interface ProductType {
  id: string;
  name: string;
  image_url: string;
  productCount?: number;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      // Transform the data to match our Order interface
      const transformedOrders: Order[] = (data || []).map(order => ({
        ...order,
        status: (order.status as   'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned') || 'pending',
        product_id: order.product_id || '', // Add default value for missing product_id
        quantity: order.quantity || 1, // Add default value for quantity
        custom_options: typeof order.custom_options === 'object' ? order.custom_options as Record<string, string> : {}  // Convert JSON to Record<string, string>
      }));
      setOrders(transformedOrders);
    }
    setLoading(false);
  };

    // Add function to update inventory when order status changes
const updateProductInventory = async (productId: string, quantityChange: number) => {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('max_quantity, min_quantity')
    .eq('id', productId)
    .single();

  if (fetchError) {
    console.error('Error fetching product for inventory update:', fetchError);
    return false;
  }

  if (product.max_quantity === null) {
    // Unlimited stock, no update needed
    return true;
  }

  const newMaxQuantity = product.max_quantity + quantityChange;

  if (newMaxQuantity < 0) {
    console.error('Cannot reduce inventory below 0');
    return false;
  }
  
  const { error } = await supabase
    .from('products')
    .update({ 
      max_quantity: newMaxQuantity,
      min_quantity: product.min_quantity // Include the required min_quantity field
    })
    .eq('id', productId);

  if (error) {
    console.error('Error updating product inventory:', error);
    return false;
  }

  return true;
};

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned') => {
    const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('status, product_id, quantity')
    .eq('id', orderId)
    .single();
    if (orderError) {
    console.error('Error fetching order:', orderError);
    return false;
  }

    // Update order status
  const { error } = await supabase
    .from('orders')
    .update({ status: status })
    .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      return false;
    } 
    // Handle inventory changes when status changes to 'delivered'
  if (status === 'delivered' && order.status !== 'delivered') {
    await updateProductInventory(order.product_id, -order.quantity);
  }
  await fetchOrders();
  return true;
  };

  const deleteOrder = async (orderId: string) => {
    try {
      console.log('Attempting to delete order:', orderId);
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) {
        console.error('Error deleting order from database:', error);
        return false;
      } else {
        console.log('Order deleted successfully from database');
        // Update local state immediately
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        return true;
      }
    } catch (error) {
      console.error('Error in deleteOrder function:', error);
      return false;
    }
  };

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

  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'is_synced_to_gsheet'>, gsheetUrl?: string | null) => {
    let createdOrder: Order | null = null;
    
 // Get client IP address
    const ipAddress = orderData.ip_address || 'unknown';
    
    // Check for duplicate orders
    if (orderData.product_id) {
      const isDuplicate = await checkDuplicateOrder(orderData.product_id, ipAddress);
      
      if (isDuplicate) {
        throw new Error('duplicate_order');
      }
    }

    const sanitizedOrderData = {
    ...orderData,
    custom_options: orderData.custom_options || {} // Ensure valid value
  };

    // 1. Create the order in Supabase
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([sanitizedOrderData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      createdOrder = {
      ...data,
      status: (data.status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned') || 'pending',
      product_id: data.product_id || '',
      quantity: data.quantity || 1,
      custom_options: data.custom_options || {}, // Changed from false to empty object

      ip_address: data.ip_address || undefined,
      order_time: data.order_time || undefined,
      is_synced_to_gsheet: data.is_synced_to_gsheet || false
    } as Order;
      // Add the new order to the local state immediately
      if (createdOrder) {
          setOrders(prev => [createdOrder!, ...prev]);
      }
    } catch (error) {
      console.error("Failed to create order in Supabase:", error);
      return null;
    }

    // 2. Sync to Google Sheets if URL is provided
    if (gsheetUrl && createdOrder) {
        syncToGoogleSheetsBackground(createdOrder, gsheetUrl);

    }
      
    return createdOrder;
  };

  // 🔄 BACKGROUND GOOGLE SHEETS SYNC FUNCTION
const syncToGoogleSheetsBackground = async (order: Order, gsheetUrl: string) => {
  try {
    console.log('📊 Starting background Google Sheets sync...', { orderId: order.id });

    // Fetch additional data for Google Sheets
    const [productResult] = await Promise.all([
      supabase.from('products').select('product_type_id, name').eq('id', order.product_id).single(),
      // We'll get product type after we have product_type_id
    ]);

    let productTypeName = '';
    if (productResult?.data?.product_type_id) {
      const productTypeResult = await supabase
        .from('product_types')
        .select('name')
        .eq('id', productResult.data.product_type_id)
        .single();
      productTypeName = productTypeResult?.data?.name || '';
    }

    // Status translation mapping
    const statusTranslations: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'confirmed': 'تم التأكيد',
      'processing': 'قيد التحضير',
      'shipped': 'تم الشحن',
      'delivered': 'تم التوصيل',
      'cancelled': 'ملغي',
      'returned': 'مرجع'
    };

    // Format custom options if they exist
    let customOptionsString = '';
    if (order.custom_options && Object.keys(order.custom_options).length > 0) {
      customOptionsString = Object.entries(order.custom_options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');
    }

      // Format the date in the desired format: DD/MM/YYYY HH:MM:SS
    const formattedDate = (() => {
      try {
        const date = new Date(order.created_at);
        // Format: day/month/year hour:minute:second
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      } catch (e) {
        console.error('Error formatting date:', e);
        return order.created_at; // Fallback to original format
      }
    })();

    // Prepare the payload
    const payload = {
      created_at: formattedDate,
      productTypeName,
      product_name: order.product_name,
      quantity: order.quantity,
      size: order.size || 'لا يوجد',
      color: order.color || 'لا يوجد',
      custom_options: customOptionsString, // Add custom options to payload
      total_price: `${order.total_price} DZD`,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      wilaya: order.wilaya,
      commune: order.commune,
      full_address: order.full_address,
      status: statusTranslations[order.status] || order.status,
    };

    console.log('📤 Sending payload to Google Sheets (background):', payload);

    // ✅ SINGLE FETCH REQUEST - NO CORS TEST
    await fetch(gsheetUrl, { 
      method: 'POST', 
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload) 
    });

    console.log('📡 Google Sheets sync completed (background)');

    // ✅ UPDATE SYNC STATUS IN DATABASE (BACKGROUND)
    const { data: updatedOrder } = await supabase
      .from('orders')
      .update({ is_synced_to_gsheet: true })
      .eq('id', order.id)
      .select()
      .single();

    // Update local state with the synced status
    if (updatedOrder) {
      // Rest of the function remains unchanged...
    }
  } catch (syncError) {
    console.error("❌ Google Sheets background sync failed:", syncError);
  }
};

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, updateOrderStatus, deleteOrder, addOrder, refreshOrders: fetchOrders };
};

export const useProductTypes = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductTypes = async () => {
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching product types:', error);
    } else {
      // Get product count for each type
      const typesWithCount = await Promise.all((data || []).map(async (type) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('product_type_id', type.id);
        
        return { ...type, productCount: count || 0 };
      }));
      setProductTypes(typesWithCount);
    }
    setLoading(false);
  };

  const addProductType = async (productType: Omit<ProductType, 'id'>) => {
    const { data, error } = await supabase
      .from('product_types')
      .insert([{
        name: productType.name,
        image_url: productType.image_url
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding product type:', error);
      return null;
    } else {
      await fetchProductTypes();
      return data;
    }
  };

  const updateProductType = async (id: string, updates: Partial<Omit<ProductType, 'id'>>) => {
    const { error } = await supabase
      .from('product_types')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating product type:', error);
    } else {
      await fetchProductTypes();
    }
  };

  const deleteProductType = async (id: string) => {
    const { error } = await supabase
      .from('product_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product type:', error);
    } else {
      await fetchProductTypes();
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  return { 
    productTypes, 
    loading, 
    addProductType, 
    updateProductType, 
    deleteProductType,
    refreshProductTypes: fetchProductTypes 
  };
};

export const useProducts = (typeId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      // Transform the data to match our Product interface
      const transformedProducts: Product[] = (data || []).map(product => ({
        ...product,
        options: typeof product.options === 'object' && product.options !== null 
          ? product.options as { sizes: Array<{ name: string; priceModifier: number }>; colors: Array<{ name: string; priceModifier: number }>; customOptions: Array<{ optionName: string; values: Array<{ name: string; priceModifier: number }> }> }
          : { sizes: [], colors: [] , customOptions: [] },
        quantity_offers: Array.isArray(product.quantity_offers) 
    ? product.quantity_offers.map(offer => {
        const offerObj = typeof offer === 'string' ? JSON.parse(offer) : offer;
        return {
          quantity: offerObj.quantity,
          price: offerObj.price,
          name: offerObj.name || "قطع" // Add default name if it doesn't exist
        };
      })
    : undefined,
        description_content: Array.isArray(product.description_content)
          ? product.description_content as Array<{ type: 'text' | 'image'; content: string }>
          : null,
        min_quantity: product.min_quantity ?? 1,
        max_quantity: product.max_quantity ?? null
      }));
      setProducts(transformedProducts);
    }
    setLoading(false);
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description,
        base_price: product.base_price,
        price_before_discount: product.price_before_discount,
        images: product.images,
        product_type_id: product.product_type_id,
        options: product.options,
        quantity_offers: product.quantity_offers ,// ADDED THIS LINE
        description_content: product.description_content,
        min_quantity: product.min_quantity,
        max_quantity: product.max_quantity 

      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding product:', error);
      return null;
    } else {
      await fetchProducts();
      return data;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>) => {
    const { error } = await supabase
      .from('products')
      .update({
      ...updates,
      // Ensure description_content is properly handled
      description_content: updates.description_content,
      min_quantity: updates.min_quantity,
      max_quantity: updates.max_quantity
    })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating product:', error);
    } else {
      await fetchProducts();
    }
  };



  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
    } else {
      await fetchProducts();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { 
    products, 
    loading, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    refreshProducts: fetchProducts 
  };
};
