// src/components/dashboard/StoreSettingsModal.tsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X , Facebook, Instagram, Send } from 'lucide-react';
import { useStoreSettings, StoreSettings } from '@/contexts/StoreSettingsContext';
import ImageUpload from '../ImageUpload';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StoreSettingsModal = ({ isOpen, onClose }: StoreSettingsModalProps) => {
  const { settings, updateSettings, loading: settingsLoading } = useStoreSettings();
  const [formData, setFormData] = useState<Partial<StoreSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (settings && isOpen) {
      setFormData(settings);
      setPhoneError(null);
    }
  }, [settings, isOpen]);

  const validateAlgerianPhone = (phone: string): boolean => {
    const algerianPhoneRegex = /^(05|06|07)\d{8}$/;
    return algerianPhoneRegex.test(phone);
  };

  const handleInputChange = (field: keyof StoreSettings, value: string) => {
    if (field === 'phone_number') {
      if (value.trim() === '' || validateAlgerianPhone(value)) {
        setPhoneError(null);
      } else {
        setPhoneError('يجب أن يبدأ رقم الهاتف بـ 05 أو 06 أو 07 ويتكون من 10 أرقام');
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: 'facebook' | 'instagram' | 'telegram', value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };

  const handleLogoUpload = (url: string) => {
    setFormData(prev => ({ ...prev, logo_url: url }));
  };

  const handleHeroImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, hero_images: [...(prev.hero_images || []), url]}));
  };

  const removeHeroImage = (index: number) => {
    const newImages = [...(formData.hero_images || [])];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, hero_images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone_number && !validateAlgerianPhone(formData.phone_number)) {
      toast.error('الرجاء إدخال رقم هاتف صحيح.');
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('تم تحديث إعدادات المتجر بنجاح!');
      onClose();
    } catch (error) {
      toast.error('فشل تحديث الإعدادات.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-background rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">تعديل إعدادات المتجر</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {settingsLoading ? <p>Loading settings...</p> : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <Label htmlFor="store_name">اسم المتجر</Label>
                      <Input id="store_name" value={formData.store_name || ''} onChange={e => handleInputChange('store_name', e.target.value)} />
                  </div>
                  <div>
                      <Label htmlFor="phone_number">رقم الهاتف</Label>
                      <Input
                        id="phone_number"
                        value={formData.phone_number || ''}
                        onChange={e => handleInputChange('phone_number', e.target.value)}
                        className={phoneError ? 'border-red-500' : ''}
                      />
                      {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                  </div>
                </div>

                <div>
                  <Label>شعار المتجر</Label>
                  <ImageUpload onImageUploaded={handleLogoUpload} currentImage={formData.logo_url} onImageRemoved={() => handleInputChange('logo_url', '')} />
                </div>

                <div>
                  <Label>صور الواجهة</Label>
                  <div className="space-y-3">
                    <ImageUpload onImageUploaded={handleHeroImageUpload} className="w-full" />
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {formData.hero_images?.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={image} alt={`Hero ${index + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                          <button type="button" onClick={() => removeHeroImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-3 opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>حسابات التواصل</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder="Facebook URL"
                        value={formData.social_media?.facebook || ''}
                        onChange={e => handleSocialChange('facebook', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder="Instagram URL"
                        value={formData.social_media?.instagram || ''}
                        onChange={e => handleSocialChange('instagram', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Send className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder="Telegram URL"
                        value={formData.social_media?.telegram || ''}
                        onChange={e => handleSocialChange('telegram', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>إلغاء</Button>
                  <Button type="submit" disabled={isSaving || !!phoneError}>{isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</Button>
                </div>
            </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StoreSettingsModal;