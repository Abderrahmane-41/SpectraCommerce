import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Package, Edit, Trash2, ChevronDown, ChevronUp, Eye, AlertTriangle } from 'lucide-react';
import { useProductTypes, useProducts } from '../../hooks/useSupabaseStore';
import AddProductModal from './AddProductModal';
import ImageUpload from '../ImageUpload';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';

const ProductsTab = () => {
  const { productTypes, loading: typesLoading, addProductType, updateProductType, deleteProductType } = useProductTypes();
  const { products, loading: productsLoading, deleteProduct } = useProducts('');
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEditTypeModal, setShowEditTypeModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [editingType, setEditingType] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'product' | 'productType', id: string} | null>(null);

  const toggleTypeExpansion = (typeId: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(typeId)) {
      newExpanded.delete(typeId);
    } else {
      newExpanded.add(typeId);
    }
    setExpandedTypes(newExpanded);
  };

  const getProductsByType = (typeId: string) => {
    return products.filter(product => product.product_type_id === typeId);
  };
  

// Update the handleDeleteConfirm function
// Fix the handleDeleteConfirm function
const handleDeleteConfirm = async () => {
  if (!deleteTarget) return;

  try {
    setLoading(true);
    
    if (deleteTarget.type === 'productType') {
      // First check if type has products
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('product_type_id', deleteTarget.id);
      
      if (countError) {
        console.error('Error checking for related products:', countError);
        toast.error('حدث خطأ أثناء التحقق من المنتجات المرتبطة.');
        setLoading(false);
        return;
      }
      
      if (count && count > 0) {
        // Show warning about deleting associated products
        if (!window.confirm(`سيؤدي حذف هذا النوع إلى حذف ${count} منتج مرتبط به. هل أنت متأكد؟`)) {
          setLoading(false);
          return;
        }
        
        // Delete associated products first
        const { error: deleteProductsError } = await supabase
          .from('products')
          .delete()
          .eq('product_type_id', deleteTarget.id);
          
        if (deleteProductsError) {
          console.error('Error deleting associated products:', deleteProductsError);
          toast.error('فشل حذف المنتجات المرتبطة.');
          setLoading(false);
          return;
        }
      }
      
      // Now delete the product type
      try {
        await deleteProductType(deleteTarget.id);
        toast.success('تم حذف نوع المنتج بنجاح!');
      } catch (error: any) {
        console.error('Error deleting product type:', error);
        toast.error(`فشل الحذف: ${error.message || 'خطأ غير معروف'}`);
      }
    } else {
      // Delete product
      try {
        await deleteProduct(deleteTarget.id);
        toast.success('تم حذف المنتج بنجاح!');
      } catch (error: any) {
        console.error('Error deleting product:', error);
        toast.error(`فشل الحذف: ${error.message || 'خطأ غير معروف'}`);
      }
    }
  } catch (error: any) {
    console.error('Deletion error:', error);
    toast.error(`حدث خطأ أثناء الحذف: ${error.message || 'خطأ غير معروف'}`);
  } finally {
    setLoading(false);
    setDeleteTarget(null);
    setShowDeleteConfirm(false);
  }
};

  const AddProductTypeModal = () => {
    const [typeName, setTypeName] = useState(editingType?.name || '');
    const [imageUrl, setImageUrl] = useState(editingType?.image_url || '');
    const [loading, setLoading] = useState(false);

    const handleImageUploaded = (url: string) => {
      setImageUrl(url);
    };

    const handleImageRemoved = () => {
      setImageUrl('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      
      try {
        const finalImageUrl = imageUrl || '/placeholder.svg';

        if (editingType) {
          await updateProductType(editingType.id, {
            name: typeName,
            image_url: finalImageUrl
          });
          toast.success('تم تحديث نوع المنتج بنجاح!');
          setShowEditTypeModal(false);
          setEditingType(null);
        } else {
          await addProductType({
            name: typeName,
            image_url: finalImageUrl
          });
          toast.success('تمت إضافة نوع المنتج بنجاح!');
          setShowAddTypeModal(false);
        }
      } catch (error) {
        toast.error('فشل حفظ نوع المنتج. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
        setTypeName('');
        setImageUrl('');
      }
    };

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
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
            {editingType ? 'تعديل نوع المنتج' : 'إضافة نوع منتج جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">اسم النوع</label>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base"
                placeholder="مثال: قمصان، هوديس"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">الصورة</label>
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                currentImage={imageUrl}
                onImageRemoved={handleImageRemoved}
                className="w-full"
              />
            </div>
            <div className="flex space-x-2 sm:space-x-3 pt-3 sm:pt-4">
              <button
                type="button"
                onClick={() => {
                  if (editingType) {
                    setShowEditTypeModal(false);
                    setEditingType(null);
                  } else {
                    setShowAddTypeModal(false);
                  }
                }}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-border rounded-lg hover:bg-muted/50 text-xs sm:text-sm"
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 btn-gradient py-2 rounded-lg disabled:opacity-50 text-xs sm:text-sm"
                disabled={loading}
              >
                {loading ? ' ...جارٍ الحفظ' : (editingType ? 'تحديث النوع' : 'إضافة نوع')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

// Update the DeleteConfirmModal component
const DeleteConfirmModal = () => (
  <motion.div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="bg-background rounded-2xl p-6 w-full max-w-md"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <h3 className="text-xl font-bold mb-4 text-red-500">تأكيد الحذف</h3>
      <p className="text-muted-foreground mb-6">
        هل أنت متأكد أنك تريد حذف هذا {deleteTarget?.type === 'productType' ? 'نوع المنتج' : 'المنتج'}? 
        لا يمكن التراجع عن هذا الإجراء.
      </p>
      <div className="flex space-x-3">
        <button
          onClick={() => {
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
          }}
          className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50"
          disabled={loading}
        >
          إلغاء
        </button>
        <button
          onClick={handleDeleteConfirm}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500"
          disabled={loading}
        >
          {loading ? 'جاري الحذف...' : 'حذف'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

  if (typesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">إدارة المنتجات</h2>
        <button
          onClick={() => setShowAddTypeModal(true)}
          className="btn-gradient px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>إضافة نوع</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {productTypes.map((type, index) => {
          const typeProducts = getProductsByType(type.id);
          const isExpanded = expandedTypes.has(type.id);
          
          return (
            <motion.div
              key={type.id}
              className="relative p-[3px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Gradient border wrapper */}
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
              
              {/* Card content */}
              <div className="glass-effect rounded-lg sm:rounded-xl overflow-hidden border relative z-10 card-hover bg-background">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={type.image_url || '/placeholder.svg'}
                    alt={type.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
                    <h3 className="text-sm sm:text-lg font-bold">{type.name}</h3>
                    <p className="text-xs sm:text-sm opacity-90">{typeProducts.length} منتجات</p>
                    {/* ADD INVENTORY SUMMARY */}
                    <div className="text-xs opacity-80">
                      {(() => {
                        const outOfStock = typeProducts.filter(p => p.max_quantity !== null && p.max_quantity <= (p.min_quantity || 1)).length;
                        const unlimited = typeProducts.filter(p => p.max_quantity === null).length;
                        const inStock = typeProducts.length - outOfStock - unlimited;
                        
                        return (
                          <div className="flex space-x-2">
                            {unlimited > 0 && <span>🟢 {unlimited} غير محدود</span>}
                            {inStock > 0 && <span>🔵 {inStock} متوفر</span>}
                            {outOfStock > 0 && <span>🔴 {outOfStock} نفد</span>}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-2 gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        setSelectedTypeId(type.id);
                        setEditingProduct(null);
                        setShowAddProductModal(true);
                      }}
                      className="bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة</span>
                      {/* ADD INVENTORY INDICATOR */}
                      {(() => {
                        const lowStock = typeProducts.filter(p => p.max_quantity !== null && p.max_quantity <= (p.min_quantity || 1) * 2).length;
                        return lowStock > 0 ? (
                          <AlertTriangle className="w-3 h-3 text-orange-500 ml-1" />
                        ) : null;
                      })()}
                    </button>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleTypeExpansion(type.id)}
                        className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      
                      <button 
                        onClick={() => {
                          setEditingType(type);
                          setShowEditTypeModal(true);
                        }}
                        className="px-2 py-1.5 sm:px-3 sm:py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      
                      <button 
                        onClick={() => {
                          setDeleteTarget({type: 'productType', id: type.id});
                          setShowDeleteConfirm(true);
                        }}
                        className="px-2 py-1.5 sm:px-3 sm:py-2 border border-border rounded-lg hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t pt-2 sm:pt-3 space-y-1 sm:space-y-2"
                    >
                      <h4 className="font-medium text-xs sm:text-sm">المنتجات في هذا النوع:</h4>
                      {typeProducts.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                          {typeProducts.map(product => (
                          <div key={product.id} className="flex justify-between items-center p-1.5 sm:p-2 bg-muted/30 rounded text-xs sm:text-sm">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-foreground">{product.base_price} DA</p>
                              {/* ADD THIS INVENTORY DISPLAY */}
                              <div className="flex items-center space-x-1 text-xs">
                                {product.max_quantity === null ? (
                                  <span className="text-green-600 font-semibold">غير محدود</span>
                                ) : product.max_quantity <= (product.min_quantity || 1) ? (
                                  <span className="text-red-600 font-bold">نفد المخزون</span>
                                ) : (
                                  <span className="text-blue-900 font-bold">{product.max_quantity} متبقي</span>
                                )}
                                <span className="text-foreground font-semibold"> :المخزون</span>

                              </div>
                            </div>
                            <div className="flex space-x-0.5 sm:space-x-1">
                              {/* ADD INVENTORY BADGE NEXT TO EDIT BUTTON */}
                              {product.max_quantity !== null && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-900 font-bold mr-1">
                                  {product.max_quantity}
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setSelectedTypeId(type.id);
                                  setShowEditProductModal(true);
                                }}
                                className="p-0.5 sm:p-1 hover:bg-muted/50 rounded"
                              >
                                <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({type: 'product', id: product.id});
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-0.5 sm:p-1 hover:bg-red-500/10 hover:text-red-500 rounded"
                              >
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-xs sm:text-sm">لا توجد منتجات بعد</p>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {productTypes.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد أنواع منتجات بعد</h3>
          <p className="text-muted-foreground mb-4">قم بإنشاء أول نوع منتج للبدء.</p>
          <button
            onClick={() => setShowAddTypeModal(true)}
            className="btn-gradient px-6 py-2 rounded-lg"
          >
            إضافة نوع المنتج
          </button>
        </div>
      )}

      {(showAddTypeModal || showEditTypeModal) && <AddProductTypeModal />}
      {showDeleteConfirm && <DeleteConfirmModal />}
      
      <AddProductModal
        isOpen={showAddProductModal || showEditProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setShowEditProductModal(false);
          setEditingProduct(null);
          setSelectedTypeId('');
        }}
        selectedTypeId={selectedTypeId}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default ProductsTab;