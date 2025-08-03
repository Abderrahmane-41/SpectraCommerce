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
        quantity: order.quantity || 1 // Add default value for quantity
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

    // 1. Create the order in Supabase
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      createdOrder = {
      ...data,
      status: (data.status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned') || 'pending',
      product_id: data.product_id || '',
      quantity: data.quantity || 1,
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
    const isDevelopment = process.env.NODE_ENV === 'development';

    // 2. Sync to Google Sheets if URL is provided
    if (gsheetUrl && createdOrder) {
      try {
    console.log('📊 Starting Google Sheets sync...', { gsheetUrl });

        const { data: product } = await supabase.from('products').select('product_type_id, name').eq('id', createdOrder.product_id).single();
        const { data: productType } = await supabase.from('product_types').select('name').eq('id', product?.product_type_id).single();

        const statusTranslations: { [key: string]: string } = {
        pending: 'En attente', 
        confirmed: 'Confirmée', 
        processing: 'En cours', 
        shipped: 'Expédiée', 
        delivered: 'Livrée', 
        cancelled: 'Annulée', 
        returned: 'Retournée',
      };

        const payload = {
        created_at: new Date(createdOrder.created_at).toLocaleString('fr-FR'),
        productTypeName: productType?.name || 'N/A',
        product_name: product?.name,
        quantity: createdOrder.quantity,
        size: createdOrder.size,
        color: createdOrder.color,
        total_price: `${createdOrder.total_price} DZD`,
        customer_name: createdOrder.customer_name,
        customer_phone: createdOrder.customer_phone,
        wilaya: createdOrder.wilaya,
        commune: createdOrder.commune,
        full_address: createdOrder.full_address,
        status: statusTranslations[createdOrder.status] || createdOrder.status,
      };

      console.log('📤 Sending payload to Google Sheets:', payload);
      console.log('🔗 Google Sheets URL:', gsheetUrl);


        await fetch(gsheetUrl, { 
        method: 'POST', 
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload) 
      });

            console.log('📡 Google Sheets response sent (no-cors mode)');



            try {
        const testResponse = await fetch(gsheetUrl, { 
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload) 
        });
        
        const responseText = await testResponse.text();
        console.log('📋 Google Sheets response:', responseText);
        
        if (testResponse.ok) {
          console.log('✅ Google Sheets sync successful');
        } else {
          console.error('❌ Google Sheets sync failed:', testResponse.status, responseText);
        }
      } catch (corsError) {
        console.log('🔒 CORS prevented reading response, but request may have succeeded');
        console.log('CORS Error (expected):', corsError);
      }


        // 3. Update the sync status in Supabase
        const { data: updatedOrder } = await supabase.from('orders').update({ is_synced_to_gsheet: true }).eq('id', createdOrder.id).select().single();
        
        // Update local state with the synced status
        if (updatedOrder) {
        const typedUpdatedOrder: Order = {
          ...updatedOrder,
          status: (updatedOrder.status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned') || 'pending',
          product_id: updatedOrder.product_id || '',
          quantity: updatedOrder.quantity || 1,
          ip_address: updatedOrder.ip_address || undefined,
          order_time: updatedOrder.order_time || undefined,
          is_synced_to_gsheet: updatedOrder.is_synced_to_gsheet || false
        } as Order;
        
        setOrders(prev => prev.map(o => o.id === typedUpdatedOrder.id ? typedUpdatedOrder : o));
                console.log('✅ Order sync status updated in database');

      }
        
        
      } catch (syncError) {
      console.error("❌ Google Sheets sync failed:", syncError);
      }
    }else {
    console.log('⏭️ Skipping Google Sheets sync (no URL provided)');
  }
    return createdOrder;
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
          ? product.options as { sizes: Array<{ name: string; priceModifier: number }>; colors: Array<{ name: string; priceModifier: number }> }
          : { sizes: [], colors: [] },
        quantity_offers: Array.isArray(product.quantity_offers) 
          ? product.quantity_offers as Array<{ quantity: number; price: number }>
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
