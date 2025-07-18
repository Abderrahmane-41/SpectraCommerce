import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { useProductTypes, useProducts } from '../../hooks/useSupabaseStore';
import { FilterOptions, OrderStatus } from './OrdersTab'; // <-- Import the types

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
const statusTranslations: Record<OrderStatus, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    processing: 'جاري التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغاة',
    returned: 'مسترجع',
};

interface OrderFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const OrderFilterModal = ({ isOpen, onClose, onApplyFilters, currentFilters }: OrderFilterModalProps) => {
  const { productTypes } = useProductTypes();
  const { products } = useProducts('');
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const wilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa',
    'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa',
    'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel',
    'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara',
    'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj',
    'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naâma',
    'Ain Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun',
    'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès', 'In Salah',
    'In Guezzam', 'Touggourt', 'Djanet', 'El M\'ghair', 'El Meniaa'
  ];

  const handleApply = () => {
    console.log('Applying filters:', filters);
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = { 
      product: '', 
      productType: '', 
      wilaya: '',
      dateRange: 'all'
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-background rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold flex items-center space-x-2">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>تصفية الطلبات</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">الحالة</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({...filters, status: e.target.value as OrderStatus || undefined})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base"
            >
              <option value="">كل الحالات</option>
              {statusOptions.map(status => (
                  <option key={status} value={status}>{statusTranslations[status]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">نوع المنتج</label>
            <select
              value={filters.productType}
              onChange={(e) => setFilters({...filters, productType: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base"
            >
              <option value="">كل أنواع المنتجات</option>
              {productTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">اسم المنتج</label>
            <select
              value={filters.product}
              onChange={(e) => setFilters({...filters, product: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base"
            >
              <option value="">كل المنتجات</option>
              {products.map(product => (
                <option key={product.id} value={product.name}>{product.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">الولاية</label>
            <select
              value={filters.wilaya}
              onChange={(e) => setFilters({...filters, wilaya: e.target.value})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base"
            >
              <option value="">كل الولايات</option>
              {wilayas.map(wilaya => (
                <option key={wilaya} value={wilaya}>{wilaya}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">الفترة الزمنية</label>
            <select
              value={filters.dateRange || 'all'}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value as FilterOptions['dateRange']})}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base"
            >
              <option value="all">جميع الفترات</option>
              <option value="last24hours">آخر 24 ساعة</option>
              <option value="lastWeek">الأسبوع الماضي</option>
              <option value="last2Weeks">آخر أسبوعين</option>
              <option value="last3Weeks">آخر 3 أسابيع</option>
              <option value="lastMonth">الشهر الماضي</option>
              <option value="last3Months">آخر 3 أشهر</option>
              <option value="last6Months">آخر 6 أشهر</option>
              <option value="lastYear">السنة الماضية</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-2 sm:space-x-3 pt-4 sm:pt-6">
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-xs sm:text-sm"
          >
            إعادة تعيين
          </button>
          <button
            onClick={handleApply}
            className="flex-1 btn-gradient py-2 rounded-lg text-xs sm:text-sm"
          >
            تطبيق الفلاتر
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderFilterModal;