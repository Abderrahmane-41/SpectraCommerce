import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ProductOption {
  name: string;
  priceModifier: number;
}

interface CustomOption {
  optionName: string;
  values: Array<{ name: string; priceModifier: number }>;
}

interface ProductOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (option: ProductOption | CustomOption) => void;
  optionType: 'size' | 'color' | 'custom';
  initialData?: ProductOption | CustomOption | null;
  editingCustomOption?: boolean;
  existingOptionName?: string; // Add this new prop
}

const ProductOptionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  optionType, 
  initialData, 
  editingCustomOption = false,
  existingOptionName = '' // Default to empty string
}: ProductOptionModalProps) => {
  const [name, setName] = useState('');
  const [priceModifier, setPriceModifier] = useState('');
  const [optionName, setOptionName] = useState('');

  useEffect(() => {
    if (initialData) {
      if ('values' in initialData) {
        // It's a custom option
        setOptionName(initialData.optionName);
      } else {
        // It's a regular option (size or color)
        setName(initialData.name);
        setPriceModifier(initialData.priceModifier.toString());
      }
    } else {
      setName('');
      setPriceModifier('');
      // Only reset optionName if we're not editing an existing option
      if (!existingOptionName) {
        setOptionName('');
      } else {
        setOptionName(existingOptionName);
      }
    }
  }, [initialData, editingCustomOption, existingOptionName]);

  if (!isOpen) return null;

  const namePlaceholder = optionType === 'size' ? 'مثال: L, XL' : 
                          optionType === 'color' ? 'مثال: أحمر, أزرق' : 
                          'مثال: خشب, بلاستيك';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the final option name - either from input or from the existing name
    const finalOptionName = existingOptionName || optionName.trim();
    
    if (optionType === 'custom' && !finalOptionName) {
      toast.error('الرجاء إدخال اسم الخاصية');
      return;
    }
    
    if (!name.trim()) {
      toast.error('الرجاء إدخال اسم الخيار');
      return;
    }
    
    if (optionType === 'custom') {
      if (editingCustomOption) {
        // We're editing the whole custom option, not just one value
        onSave({
          optionName: finalOptionName,
          values: [{
            name: name.trim(),
            priceModifier: parseFloat(priceModifier) || 0,
          }]
        });
      } else {
        // We're adding/editing a value within a custom option
        onSave({
          name: name.trim(),
          priceModifier: parseFloat(priceModifier) || 0,
          optionName: finalOptionName
        } as any);
      }
    } else {
      // Regular size/color option
      onSave({
        name: name.trim(),
        priceModifier: parseFloat(priceModifier) || 0,
      });
    }
    onClose();
  };

  // Determine title based on option type and editing state
  let title;
  if (optionType === 'size') {
    title = `${initialData ? 'تعديل' : 'إضافة'} مقاس`;
  } else if (optionType === 'color') {
    title = `${initialData ? 'تعديل' : 'إضافة'} لون`;
  } else {
    title = existingOptionName 
      ? `${initialData ? 'تعديل' : 'إضافة'} قيمة لـ ${existingOptionName}`
      : `${initialData ? 'تعديل' : 'إضافة'} خاصية مخصصة`;
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-background rounded-xl p-6 w-full max-w-sm"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Only show the option name input if we're creating a new custom option */}
          {optionType === 'custom' && !existingOptionName && (
            <div>
              <label className="block text-sm font-medium mb-2">اسم الخاصية</label>
              <input
                type="text"
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="مثال: المادة, المقاس, النموذج"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                اسم الخاصية الذي سيظهر للعملاء (مثل: المادة، النوع، الموديل)
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">
              {optionType === 'custom' ? 'قيمة الخاصية' : 'الاسم'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={namePlaceholder}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">معدل السعر (دج)</label>
            <input
              type="number"
              value={priceModifier}
              onChange={(e) => setPriceModifier(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0"
              step="0.01"
            />
             <p className="text-xs text-muted-foreground mt-1">
              أضف زيادة أو نقصان على السعر الأساسي. مثال: 100 أو -50.
            </p>
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/50">
              إلغاء
            </button>
            <button type="submit" className="flex-1 btn-gradient py-2 rounded-lg">
              حفظ
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductOptionModal;