import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2,Upload, Edit } from 'lucide-react';
import { useProducts, useProductTypes } from '../../hooks/useSupabaseStore';
import ImageUpload from '../ImageUpload';
import { toast } from 'sonner';
import ProductOptionModal from './ProductOptionModal'; // <-- Import the new modal
import { useImageUpload } from "@/hooks/useImageUpload"; // Make sure to import this
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';


interface ProductOption {
  name: string;
  priceModifier: number;
}

type ContentBlock = {
  type: 'text' | 'image';
  content: string;
};

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
  const [minQuantity, setMinQuantity] = useState('1');
  const [maxQuantity, setMaxQuantity] = useState('');
  
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceBeforeDiscount, setPriceBeforeDiscount] = useState('');
  const [productTypeId, setProductTypeId] = useState(selectedTypeId);
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<ProductOption[]>([]);
  const [colors, setColors] = useState<ProductOption[]>([]);

  const [quantityOffers, setQuantityOffers] = useState<Array<{ quantity: string; price: string }>>([]);

  const [descriptionBlocks, setDescriptionBlocks] = useState<ContentBlock[]>([]);
  const { uploadImage, uploading } = useImageUpload(); // Use your existing image upload hook


  // State for the new options modal
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [optionType, setOptionType] = useState<'size' | 'color'>('size');
  const [editingOption, setEditingOption] = useState<{ index: number; data: ProductOption } | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
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
        setMinQuantity(editingProduct.min_quantity?.toString() || '1');
      setMaxQuantity(editingProduct.max_quantity?.toString() || '');
// Fix description content initialization
        if (editingProduct.description_content && Array.isArray(editingProduct.description_content)) {
          setDescriptionBlocks(editingProduct.description_content);
        } else {
          setDescriptionBlocks([]);
        }

    } else {
      resetForm();
      setQuantityOffers([]);
      setDescriptionBlocks([]); // Add this
      

    }
  }, [editingProduct, selectedTypeId]);

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setBasePrice('');
    setPriceBeforeDiscount('');
    setProductTypeId(selectedTypeId);
    setImages([]);
    setSizes([]);
    setColors([]);
    setQuantityOffers([]);
    setDescriptionBlocks([]); // Add this line
    setMinQuantity('1');
    setMaxQuantity('');


  };


  // In src/components/dashboard/AddProductModal.tsx

const addTextBlock = () => {
  setDescriptionBlocks([...descriptionBlocks, { type: 'text', content: '' }]);
};

const handleDescriptionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    try {
      const result = await uploadImage(e.target.files[0]);
      
      // Check if upload was successful and extract the imageUrl
      if (result.success && result.imageUrl) {
        setDescriptionBlocks([...descriptionBlocks, { 
          type: 'image', 
          content: result.imageUrl  // Use result.imageUrl instead of result
        }]);
        toast.success('تم إضافة الصورة للوصف!');
      } else {
        throw new Error(result.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      toast.error('فشل رفع الصورة. يرجى المحاولة مرة أخرى.');
      console.error('Upload error:', error);
    }
  }
};

      // Use the same upload method as product images
     

const handleBlockChange = (index: number, newContent: string) => {
  const updatedBlocks = [...descriptionBlocks];
  updatedBlocks[index].content = newContent;
  setDescriptionBlocks(updatedBlocks);
};

const removeBlock = (index: number) => {
  setDescriptionBlocks(descriptionBlocks.filter((_, i) => i !== index));
};

// Update your onSubmit function

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


  const preventScrollWheel = (e: React.WheelEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
  setTimeout(() => {
    e.currentTarget.focus();
  }, 0);
};

  // Find the handleSubmit function in your AddProductModal component
// Fix the handleSubmit function
// Locate this function
// Locate this function
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Get form data directly from the form elements
  const formData = new FormData(e.target as HTMLFormElement);
  const minQtyValue = ((e.target as HTMLFormElement).querySelector('input[name="minQuantity"]') as HTMLInputElement)?.value || '1';
  const maxQtyValue = ((e.target as HTMLFormElement).querySelector('input[name="maxQuantity"]') as HTMLInputElement)?.value || '';
  
  console.log('Direct form minQuantity:', minQtyValue);
  console.log('Direct form maxQuantity:', maxQtyValue);
    if (!productName.trim() || !basePrice || !productTypeId) {
        toast.error('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    // Validate inventory
    const minQty = parseInt(minQuantity, 10);
    const maxQty = maxQuantity ? parseInt(maxQuantity, 10) : null;

    console.log('Raw minQuantity input:', minQuantity);
    console.log('Raw maxQuantity input:', maxQuantity);
    console.log('Parsed minQty:', minQty);
    console.log('Parsed maxQty:', maxQty);

    if (isNaN(minQty) || minQty < 1) {
      toast.error('الحد الأدنى للكمية يجب أن يكون رقم صحيح أكبر من 0');
      return;
    }

    if (maxQty !== null && (isNaN(maxQty) || maxQty < minQty)) {
      toast.error('الحد الأقصى للكمية يجب أن يكون أكبر من أو يساوي الحد الأدنى');
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
   // Filter out empty description blocks
    const filteredDescriptionBlocks = descriptionBlocks
      .filter(block => block.content && block.content.trim() !== '');

        const productData = {
            name: productName.trim(),
            description: description.trim(),
            base_price: formatPriceForDb(basePrice) || 0, // Apply helper
            price_before_discount: formatPriceForDb(priceBeforeDiscount), // Apply helper
            product_type_id: productTypeId,
            images: images.length > 0 ? images : ['/placeholder.svg'],
            options: { sizes, colors },
            quantity_offers: formattedQuantityOffers,
            description_content: filteredDescriptionBlocks.length > 0 ? filteredDescriptionBlocks : null,
             min_quantity: minQty,
        max_quantity: maxQty

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
              <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} onWheel={preventScrollWheel}className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="2500" min="0" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">السعر قبل الخصم (اختياري)</label>
              <input type="number" value={priceBeforeDiscount} onChange={(e) => setPriceBeforeDiscount(e.target.value)} onWheel={preventScrollWheel} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="3000" min="0" step="0.01" />
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
                      onWheel={preventScrollWheel}
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

          {/* Inventory Management Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">الحد الأدنى للكمية *</label>
            <input
              type="number"
              name="minQuantity"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              onWheel={preventScrollWheel}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="1"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الحد الأقصى للكمية</label>
            <input
              type="number"
              name="maxQuantity"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              onWheel={preventScrollWheel}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="اتركه فارغاً للكمية غير المحدودة"
              min="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              اتركه فارغاً إذا كنت تريد كمية غير محدودة
            </p>
          </div>
        </div>

            <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="وصف المنتج..." rows={3} />
            </div>
          
          <div>
              <label className="block text-sm font-medium mb-2">وصف تفصيلي للمنتج</label>
              {/* Inside the form in AddProductModal.tsx */}


          {/* Add content buttons */}
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTextBlock}
            >
              <Plus className="w-4 h-4 mr-1" />
              إضافة نص
            </Button>
            
            <Label
              htmlFor="description-image-upload"
              className={`inline-flex items-center px-3 py-1 border border-border rounded-md cursor-pointer hover:bg-muted text-sm transition-all duration-200 ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 mr-1 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                 ... جارٍ الرفع
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1" />
                  إضافة صورة
                </>
              )}
            </Label>
            
            <Input
              id="description-image-upload"
              type="file"
              className="hidden"
              onChange={handleDescriptionImageUpload}
              disabled={uploading}
              accept="image/*"
            />
          </div>

          {/* Render description blocks */}
          <div className="space-y-3">
            {descriptionBlocks.map((block, index) => (
              <div key={index} className="flex items-start gap-2 p-3 border border-border rounded-lg">
                {block.type === 'text' ? (
                  <Textarea
                    className="flex-grow min-h-[80px]"
                    placeholder=" ...اكتب وصف المنتج"
                    value={block.content}
                    onChange={(e) => handleBlockChange(index, e.target.value)}
                  />
                ) : (
                  <div className="flex-grow">
                    <img
                      src={block.content}
                      alt={`محتوى ${index + 1}`}
                      className="w-full max-w-xs h-32 object-cover rounded border"
                    />
                    
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeBlock(index)}
                  disabled={uploading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {descriptionBlocks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
            لا يوجد محتوى. اضغط على الأزرار أعلاه لإضافة نص أو صورة.
          </div>
        )}




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
            <button type="submit" className="flex-1 btn-gradient py-2 rounded-lg disabled:opacity-50" disabled={loading}>{loading ? ' ...جارٍ الحفظ' : (editingProduct ? 'تحديث المنتج' : 'إضافة المنتج')}</button>
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