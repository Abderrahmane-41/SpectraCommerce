import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit,DollarSign } from 'lucide-react';
import { useProducts, useProductTypes } from '../../hooks/useSupabaseStore';
import ImageUpload from '../ImageUpload';
import { toast } from 'sonner';
import ProductOptionModal from './ProductOptionModal'; // <-- Import the new modal


interface ProductOption {
  name: string;
  priceModifier: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTypeId: string;
  editingProduct?: any;
}

const AddProductModal = ({ isOpen, onClose, selectedTypeId, editingProduct }: AddProductModalProps) => {
  const { addProduct, updateProduct } = useProducts('');
  const { productTypes } = useProductTypes();
  const [loading, setLoading] = useState(false);
  
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceBeforeDiscount, setPriceBeforeDiscount] = useState('');
  const [productTypeId, setProductTypeId] = useState(selectedTypeId);
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<ProductOption[]>([]);
  const [colors, setColors] = useState<ProductOption[]>([]);

  const [quantityOffers, setQuantityOffers] = useState<Array<{ quantity: string; price: string }>>([]);


  // State for the new options modal
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [optionType, setOptionType] = useState<'size' | 'color'>('size');
  const [editingOption, setEditingOption] = useState<{ index: number; data: ProductOption } | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setDetailedDescription(editingProduct.detailed_description || '');
      setBasePrice(editingProduct.base_price?.toString() || '');
      setPriceBeforeDiscount(editingProduct.price_before_discount?.toString() || '');
      setProductTypeId(editingProduct.product_type_id || selectedTypeId);
      setImages(editingProduct.images || []);
      const options = editingProduct.options;
      setSizes(options?.sizes || []);
      setColors(options?.colors || []);
      setQuantityOffers(
    editingProduct.quantity_offers?.map((o: { quantity: number; price: number }) => ({
      quantity: o.quantity.toString(),
      price: o.price.toString(),
    })) || []
  );
    } else {
      resetForm();
      setQuantityOffers([]);

    }
  }, [editingProduct, selectedTypeId]);

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setDetailedDescription('');
    setBasePrice('');
    setPriceBeforeDiscount('');
    setProductTypeId(selectedTypeId);
    setImages([]);
    setSizes([]);
    setColors([]);
    setQuantityOffers([]);

  };

  // Locate this function
const handleOfferChange = (index: number, field: 'quantity' | 'price', value: string) => {
    const newOffers = [...quantityOffers];
    // Simply store the string value from the input directly.
    // We'll handle numerical conversion and precision on submission.
    newOffers[index][field] = value;
    setQuantityOffers(newOffers);
};

const addOffer = () => {
  setQuantityOffers([...quantityOffers, { quantity: '', price: '' }]);
};

const removeOffer = (index: number) => {
  const newOffers = [...quantityOffers];
  newOffers.splice(index, 1);
  setQuantityOffers(newOffers);
};

  const handleImageUploaded = (imageUrl: string) => setImages(prev => [...prev, imageUrl]);
  const handleImageRemoved = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleOpenOptionModal = (type: 'size' | 'color', optionData: { index: number; data: ProductOption } | null = null) => {
    setOptionType(type);
    setEditingOption(optionData);
    setIsOptionModalOpen(true);
  };
  
  const handleSaveOption = (option: ProductOption) => {
    if (optionType === 'size') {
      if (editingOption !== null) {
        const newSizes = [...sizes];
        newSizes[editingOption.index] = option;
        setSizes(newSizes);
      } else {
        setSizes([...sizes, option]);
      }
    } else {
      if (editingOption !== null) {
        const newColors = [...colors];
        newColors[editingOption.index] = option;
        setColors(newColors);
      } else {
        setColors([...colors, option]);
      }
    }
    setEditingOption(null);
  };
  
  const removeOption = (type: 'size' | 'color', index: number) => {
    if (type === 'size') {
      setSizes(sizes.filter((_, i) => i !== index));
    } else {
      setColors(colors.filter((_, i) => i !== index));
    }
  };


  // Find the handleSubmit function in your AddProductModal component
// Fix the handleSubmit function
// Locate this function
// Locate this function
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !basePrice || !productTypeId) {
        toast.error('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    setLoading(true);

    try {
        // Helper function to safely parse and fix precision for prices
         const formatPriceForDb = (priceString: string | null): number | null => {
               if (priceString === null || priceString.trim() === '') {
                   return null;
               }
               // Remove any thousands separators (like commas)
               const cleanedString = priceString.replace(/,/g, '');

               // Check if the cleaned string contains an explicit decimal point
               const hasExplicitDecimal = cleanedString.includes('.');

               if (!hasExplicitDecimal) {
                   // If no decimal point, or only "X.0", "X.00" etc., parse as an integer.
                   // This is more robust for whole numbers.
                   const intValue = parseInt(cleanedString, 10);
                   return isNaN(intValue) ? null : intValue;
               } else {
                   // If an explicit decimal point is present, parse as a float.
                   // Then, round to 2 decimal places to handle precision consistently.
                   const floatValue = parseFloat(cleanedString);
                   return isNaN(floatValue) ? null : parseFloat(floatValue.toFixed(2));
               }
           };

        const formattedQuantityOffers = quantityOffers
            .filter(o => o.quantity && o.price)
            .map(o => ({
                quantity: parseInt(o.quantity, 10), // Quantity is always an integer
                price: formatPriceForDb(o.price) || 0 // Use the helper for price
            }));

        const productData = {
            name: productName.trim(),
            description: description.trim(),
            detailed_description: detailedDescription.trim(),
            base_price: formatPriceForDb(basePrice) || 0, // Apply helper
            price_before_discount: formatPriceForDb(priceBeforeDiscount), // Apply helper
            product_type_id: productTypeId,
            images: images.length > 0 ? images : ['/placeholder.svg'],
            options: { sizes, colors },
            quantity_offers: formattedQuantityOffers
        };

        console.log("Submitting product data:", productData); // Debug log

        if (editingProduct) {
            await updateProduct(editingProduct.id, productData);
            toast.success('تم تحديث المنتج بنجاح!');
        } else {
            await addProduct(productData as any);
            toast.success('تمت إضافة المنتج بنجاح!');
        }

        resetForm();
        onClose();
    } catch (error) {
        console.error("Error saving product:", error);
        toast.error('فشل حفظ المنتج. يرجى المحاولة مرة أخرى.');
    } finally {
        setLoading(false);
    }
};
  if (!isOpen) return null;

  const renderOptionsList = (type: 'size' | 'color', options: ProductOption[]) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">{type === 'size' ? 'المقاسات' : 'الألوان'}</label>
        <button type="button" onClick={() => handleOpenOptionModal(type)} className="flex items-center space-x-1 text-primary hover:text-primary/80 text-sm">
          <Plus className="w-4 h-4" />
          <span>إضافة {type === 'size' ? 'مقاس' : 'لون'}</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-1 bg-muted/50 rounded-full px-3 py-1 text-sm">
            <span>{option.name} ({option.priceModifier >= 0 ? '+' : ''}{option.priceModifier} دج)</span>
            <button type="button" onClick={() => handleOpenOptionModal(type, { index, data: option })} className="p-1 hover:text-blue-500 rounded-full">
              <Edit className="w-3 h-3"/>
            </button>
            <button type="button" onClick={() => removeOption(type, index)} className="p-1 hover:text-red-500 rounded-full">
              <Trash2 className="w-3 h-3"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
    <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-background rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="مثال: قميص أساسي" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">نوع المنتج *</label>
              <select value={productTypeId} onChange={(e) => setProductTypeId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" required>
                <option value="">اختر نوع المنتج</option>
                {productTypes.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">السعر الحالي (دج) *</label>
              <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="2500" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">السعر قبل الخصم (اختياري)</label>
              <input type="number" value={priceBeforeDiscount} onChange={(e) => setPriceBeforeDiscount(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="3000" min="0" step="0.01" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">عروض الكمية</label>
              <div className="space-y-3">
                {quantityOffers.map((offer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="number"
                      value={offer.quantity}
                      onChange={(e) => handleOfferChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="الكمية"
                      min="2"
                    />
                    <input
                      type="number"
                      value={offer.price}
                      onChange={(e) => handleOfferChange(index, 'price', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="السعر الإجمالي"
                      step="0.01"
                    />
                    <button
                      type="button"
                      onClick={() => removeOffer(index)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOffer}
                  className="flex items-center space-x-2 text-primary hover:text-primary/80 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عرض كمية</span>
                </button>
              </div>
            </div>

          </div>

          <div>
              <label className="block text-sm font-medium mb-2">الوصف</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="وصف المنتج..." rows={3} />
          </div>
          
          <div>
              <label className="block text-sm font-medium mb-2">وصف تفصيلي للمنتج</label>
              <textarea value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="وصف تفصيلي للمنتج يظهر في صفحة المنتج..." rows={5} />
          </div>
          
          <div>
              <label className="block text-sm font-medium mb-2">صور المنتج</label>
              <div className="space-y-3">
                  <ImageUpload onImageUploaded={handleImageUploaded} className="w-full" />
                  {images.length > 0 && (<div className="grid grid-cols-3 gap-2">{images.map((image, index) => (<div key={index} className="relative group"><img src={image} alt={`Product ${index + 1}`} className="w-full h-24 object-cover rounded-lg border" /><button type="button" onClick={() => handleImageRemoved(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button></div>))}</div>)}
              </div>
          </div>
          
          {renderOptionsList('size', sizes)}
          {renderOptionsList('color', colors)}

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted/50" disabled={loading}>إلغاء</button>
            <button type="submit" className="flex-1 btn-gradient py-2 rounded-lg disabled:opacity-50" disabled={loading}>{loading ? 'جارٍ الحفظ...' : (editingProduct ? 'تحديث المنتج' : 'إضافة المنتج')}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
    
    <ProductOptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        onSave={handleSaveOption}
        optionType={optionType}
        initialData={editingOption?.data || null}
      />
    </>
  );
};

export default AddProductModal;