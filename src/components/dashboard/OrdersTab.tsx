// src/components/dashboard/OrdersTab.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, Phone, MapPin, Package, Calendar, Filter, Trash2, ChevronDown, DollarSign, X, FileText } from 'lucide-react'; // Import FileText icon
import { useOrders, useProducts, useProductTypes } from '../../hooks/useSupabaseStore';
import OrderFilterModal from './OrderFilterModal';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { format } from 'date-fns';
import { MobileTooltip } from "@/components/MobileTooltip";
import { AlertTriangle } from "lucide-react";


// This is now the single source of truth for this type.
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface FilterOptions {
  status?: OrderStatus;
  product: string;
  productType: string;
  wilaya: string;
  dateRange?: DateRangeOption;

}
export type DateRangeOption =
  | 'all'
  | 'last24hours'
  | 'lastWeek'
  | 'last2Weeks'
  | 'last3Weeks'
  | 'lastMonth'
  | 'last3Months'
  | 'last6Months'
  | 'lastYear';

const dateRangeTranslations: Record<DateRangeOption, string> = {
  all: 'جميع الفترات',
  last24hours: 'آخر 24 ساعة',
  lastWeek: 'الأسبوع الماضي',
  last2Weeks: 'آخر أسبوعين',
  last3Weeks: 'آخر 3 أسابيع',
  lastMonth: 'الشهر الماضي',
  last3Months: 'آخر 3 أشهر',
  last6Months: 'آخر 6 أشهر',
  lastYear: 'السنة الماضية'
};

const isWithinDateRange = (dateString: string, range: DateRangeOption): boolean => {
  if (range === 'all') return true;

  const orderDate = new Date(dateString);
  const now = new Date();

  switch (range) {
    case 'last24hours': {
      const yesterday = new Date(now);
      yesterday.setHours(now.getHours() - 24);
      return orderDate >= yesterday;
    }

    case 'lastWeek': {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      return orderDate >= lastWeek;
    }

    case 'last2Weeks': {
      const last2Weeks = new Date(now);
      last2Weeks.setDate(now.getDate() - 14);
      return orderDate >= last2Weeks;
    }

    case 'last3Weeks': {
      const last3Weeks = new Date(now);
      last3Weeks.setDate(now.getDate() - 21);
      return orderDate >= last3Weeks;
    }

    case 'lastMonth': {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      return orderDate >= lastMonth;
    }

    case 'last3Months': {
      const last3Months = new Date(now);
      last3Months.setMonth(now.getMonth() - 3);
      return orderDate >= last3Months;
    }

    case 'last6Months': {
      const last6Months = new Date(now);
      last6Months.setMonth(now.getMonth() - 6);
      return orderDate >= last6Months;
    }

    case 'lastYear': {
      const lastYear = new Date(now);
      lastYear.setFullYear(now.getFullYear() - 1);
      return orderDate >= lastYear;
    }

    default:
      return true;
  }
};

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  returned: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
};
const statusTranslations: Record<OrderStatus, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    processing: 'جاري التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغاة',
    returned: 'مسترجع',
};



const OrdersTab = () => {
  const { orders, loading, updateOrderStatus, deleteOrder } = useOrders();
  const { products } = useProducts(''); // Get all products
  const { productTypes } = useProductTypes(); // Get all product types
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    product: '',
    productType: '',
    wilaya: '',
    dateRange: 'all' // Default to show all dates
  });

  const formatDate = (dateString: string) => {
    // Use the format function for consistent output
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const success = await updateOrderStatus(orderId, newStatus);
      if (success) {
        toast.success(`تم تحديث حالة الطلب إلى ${statusTranslations[newStatus]}`);
      } else {
        toast.error('فشل تحديث حالة الطلب');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const handleDeleteOrder = async (orderId: string, customerName: string) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف طلب ${customerName}؟`)) {
      try {
        const success = await deleteOrder(orderId);
        if (success) {
          toast.success('تم حذف الطلب بنجاح');
        } else {
          toast.error('فشل حذف الطلب');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('حدث خطأ أثناء حذف الطلب');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filters.status && order.status !== filters.status) return false;

    // Product name filter
    if (filters.product && order.product_name !== filters.product) return false;

    // Product type filter
    if (filters.productType) {
      // Find the product using product_id from the order
      const product = products.find(p => p.id === order.product_id);

      if (!product) {
        return false;
      }

      // Find the product type of this product
      const productType = productTypes.find(pt => pt.id === product.product_type_id);

      // Check if the product type name matches the filter
      if (!productType) {
        return false;
      }

      if (productType.name !== filters.productType) {
        // Product exists but doesn't match the selected product type
        return false;
      }
    }

    // Wilaya filter
    if (filters.wilaya && order.wilaya !== filters.wilaya) return false;

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all' && !isWithinDateRange(order.created_at, filters.dateRange)) return false;

    return true;
  });

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    // Only count dateRange as active if it's not 'all'
    if (key === 'dateRange') return value !== 'all';
    return Boolean(value);
  }).length;

  const handleExportOrders = () => {
    if (filteredOrders.length === 0) {
      toast.info('لا توجد طلبات لتصديرها بناءً على الفلاتر الحالية.');
      return;
    }

    const headers = [
      'تاريخ الطلب',
      'نوع المنتج',
      'اسم المنتج',
      'الكمية',
      'المقاس',
      'اللون',
      'اجمالي السعر',
      'اسم العميل',
      'رقم الهاتف',
      'الولاية',
      'البلدية',
      'العنوان الكامل',
      'الحالة'
    ];

    const csvRows = filteredOrders.map(order => {
      // Find product type name
      const product = products.find(p => p.id === order.product_id);
      const productType = product ? productTypes.find(pt => pt.id === product.product_type_id) : null;
      const productTypeName = productType ? productType.name : 'غير محدد';

      // Function to escape CSV values (handle commas and quotes)
      const escapeCsvValue = (value: React.ReactNode | null | undefined) => {
        if (value === null || value === undefined) return '""';
        // Convert ReactNode to string safely
        const stringValue = String(value);
        // If the string contains a comma, double quote, or newline, enclose it in double quotes
         // Force phone numbers to be treated as text by prefixing with ="
        if (
          // Check if this is the phone number column (index 8 in your array)
          // OR check if the string looks like a phone number
          stringValue.match(/^0\d+$/) || 
          stringValue.match(/^\+?\d+$/)
        ) {
          return `="${stringValue}"`;  // Add a single quote to preserve the leading zero
        }
        // and escape any existing double quotes by doubling them
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      return [
        escapeCsvValue(formatDate(order.created_at)),
        escapeCsvValue(productTypeName),
        escapeCsvValue(order.product_name),
        escapeCsvValue(order.quantity),
        escapeCsvValue(order.size),
        escapeCsvValue(order.color),
        escapeCsvValue(`${order.total_price} دج`),
        escapeCsvValue(order.customer_name),
        escapeCsvValue(order.customer_phone),
        escapeCsvValue(order.wilaya),
        escapeCsvValue(order.commune),
        escapeCsvValue(order.full_address),
        escapeCsvValue(statusTranslations[order.status])
      ].join(',');
    });

    // Add BOM for UTF-8 encoding compatibility with Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('تم تصدير الطلبات بنجاح إلى ملف Excel (CSV)!');
    } else {
      toast.error('متصفحك لا يدعم التحميل المباشر. يرجى حفظ المحتوى يدويًا.');
      const newWindow = window.open();
      newWindow?.document.write('<pre>' + csvContent + '</pre>');
    }
  };


  const renderContent = () => {
    if (filteredOrders.length > 0) {
      return (
        <div className="grid gap-3 sm:gap-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              className="relative p-[3px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>

              <div className="glass-effect p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl relative z-10 bg-card dark:bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="font-semibold text-sm sm:text-base">تفاصيل العميل</span>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-end items-center">
                        {/* This is the new part for the icon */}
                       <div className="flex items-center gap-2">
                          {!order.is_synced_to_gsheet && (
                            <div className="mr-1">
                              <MobileTooltip
                                content={
                                  <p className="max-w-[200px] text-sm">هذه الطلبية لم تتم مزامنتها مع جوجل شيتس.</p>
                                }
                              >
                                <AlertTriangle className="w-6 h-6 text-destructive cursor-pointer" />
                              </MobileTooltip>
                            </div>
                          )}
                          
                      </div>
                      <span className="font-bold ">{order.customer_name}</span>
                        {/* This part remains the same */}
                        <strong className="ml-2"> : الإسم</strong>
                </div>
                          
                    <div className="flex items-center justify-between space-x-2 ">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                          <p className="text-muted-foreground text-xs font-semibold" >أنقر للإتصال   <span className="ml-3    ">→</span></p>
                    <span className="font-semibold text-sm sm:text-base"> 
                      
                      <a href={`tel:${order.customer_phone}`} className="hover:underline ">{order.customer_phone}</a>
                    <strong className="ml-2"> : 
                    رقم الهاتف</strong>

                    </span>
                  </div>
                    <div className="flex space-y-3 sm:space-y-2 items-start space-x-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-3" />
                      <div>
                        <p>{order.wilaya}, {order.commune}</p>
                        <p className="text-muted-foreground text-xs font-semibold">{order.full_address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="font-semibold text-sm sm:text-base">تفاصيل المنتج</span>
                  </div>

                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                  <span className="font-bold ml-auto">
                    {(() => {
                      // Find the product using product_id
                      const product = products.find(p => p.id === order.product_id);
                      // Find the product type using product_type_id
                      const productType = product ? productTypes.find(pt => pt.id === product.product_type_id) : null;
                      // Return the product type name, or a placeholder if not found
                      return productType ? productType.name : 'غير محدد';
                    })()}
                  </span>
                  <strong className="ml-2"> : نوع المنتج </strong>
                    </div>
                    <div className="flex justify-between items-center">
                  <span className="font-bold ml-auto">{order.product_name}</span>
                  <strong className="ml-2"> : المنتج</strong>
                    </div>
                  <div className="flex justify-between items-center">
                  <span className="font-bold ml-auto">{order.quantity}</span>
                  <strong className="ml-2"> : الكمية</strong>
                    </div>


                    <div className="flex justify-between items-center">
                  <span className="font-bold ml-auto">{order.size}</span>
                  <strong className="ml-2"> : المقاس</strong>
                    </div>
                    <div className="flex justify-between items-center">
                  <span className="font-bold ml-auto">{order.color}</span>
                  <strong className="ml-2"> : اللون</strong>
                    </div>
                    <p><strong>الإجمالي:</strong> <span className="text-base sm:text-lg font-bold text-primary">{order.total_price} دج</span></p>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    <span className="font-semibold text-sm sm:text-base">حالة الطلب</span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>

                    <div className="flex items-center justify-between">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <button className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${statusColors[order.status]}`}>
                            {statusTranslations[order.status]}
                            <ChevronDown className="w-3 h-3" />
                           </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {statusOptions.map(status => (
                            <DropdownMenuItem key={status} onClick={() => handleStatusChange(order.id, status)}>
                              {statusTranslations[status]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <motion.button
                        onClick={() => handleDeleteOrder(order.id, order.customer_name)}
                        className="p-1.5 sm:p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    if (orders.length > 0) {
      return (
        <div className="relative p-[3px] max-w-lg mx-auto">
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
          <div className="text-center py-12 relative z-10 bg-card dark:bg-card rounded-lg sm:rounded-xl">
            <Filter className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد طلبات تطابق فلاتر البحث</h3>
            <p className="text-muted-foreground mb-4">حاول تعديل معايير التصفية الخاصة بك.</p>
            <button
              onClick={() => setFilters({ product: '', productType: '', wilaya: '', dateRange: 'all' })}
              className="btn-gradient px-6 py-2 rounded-lg"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      );
    }


    return (
      <div className="relative p-[3px] max-w-lg mx-auto">
        <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
        <div className="text-center py-12 relative z-10 bg-card dark:bg-card rounded-lg sm:rounded-xl">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لم يتم استلام أي طلبات بعد.</h3>
          <p className="text-muted-foreground">عندما يقوم العميل بتقديم طلب، سيظهر هنا.</p>
        </div>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
const calculateTotalProfit = () => {
    return filteredOrders.reduce((total, order) => {
      // Make sure total_price is treated as a number
      const orderPrice = typeof order.total_price === 'string'
        ? parseFloat(order.total_price) || 0
        : order.total_price || 0;
      return total + orderPrice;
    }, 0).toFixed(2);
  };

  // Calculate this once
  const totalProfit = calculateTotalProfit();
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">إدارة الطلبات</h2>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">

          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors relative text-sm"
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>تصفية</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {/* New Export to Excel Button */}
          <button
            onClick={handleExportOrders}
            className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 btn-gradient rounded-lg text-sm"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>  Excel تحميل </span>
          </button>
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            {filteredOrders.length} من {orders.length} طلبات
          </div>
        </div>
      </div>

       {/* Profit Stats Card - NEW */}
        <motion.div
          className="relative p-[3px] w-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
          <div className="glass-effect p-4 sm:p-5 rounded-lg sm:rounded-xl relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-2 sm:mb-0">
              <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                  <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold">إجمالي الأرباح</h3>
                <p className="text-xs text-foreground font-medium">
                  {activeFiltersCount > 0 ? 'مصفاة' : 'كل الطلبات'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold text-primary ltr:text-left rtl:text-right">{totalProfit} DA</span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => setFilters({ product: '', productType: '', wilaya: '', dateRange: 'all' })}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  عرض الكل
                </button>
              )}
            </div>
          </div>
        </motion.div>


      {renderContent()}

      <OrderFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />
    </div>
  );
};

export default OrdersTab;