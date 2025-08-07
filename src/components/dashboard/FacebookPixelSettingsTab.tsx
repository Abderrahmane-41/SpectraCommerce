import { motion } from 'framer-motion';
import { BarChart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const FacebookPixelSettingsTab = () => {
  const { settings, updateSettings, loading } = useStoreSettings();
  const [pixelId, setPixelId] = useState(settings?.facebook_pixel_id || '');
  const [originalPixelId, setOriginalPixelId] = useState(settings?.facebook_pixel_id || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Validation state
  const [isValid, setIsValid] = useState(false);
  
  // Check if there's a valid change
  const hasValidChanges = isValid && pixelId !== originalPixelId ;

  // Validate the pixel ID format
  const validatePixelId = (id: string) => {
    if (!id.trim()) return true; // Allow empty
    return /^\d{15,16}$/.test(id.trim());
  };

  useEffect(() => {
    if (settings?.facebook_pixel_id) {
      setPixelId(settings.facebook_pixel_id);
      setOriginalPixelId(settings.facebook_pixel_id);
      setIsValid(validatePixelId(settings.facebook_pixel_id));
    }
  }, [settings]);

  // Update validation on input change
  useEffect(() => {
    setIsValid(validatePixelId(pixelId));
  }, [pixelId]);

  const handleSave = async () => {
    if (pixelId.trim() && !isValid) {
      toast.error('معرف بيكسل فيسبوك غير صالح. يجب أن يكون 15-16 رقماً فقط.');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateSettings({ facebook_pixel_id: pixelId.trim() });
      setOriginalPixelId(pixelId.trim()); // Update the original after successful save
      toast.success('تم حفظ معرف بيكسل فيسبوك بنجاح!');
    } catch (error) {
      toast.error('فشل حفظ معرف بيكسل فيسبوك.');
      console.error('Failed to save Facebook Pixel ID:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Main Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative p-[3px]"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
        <Card className="relative z-10 bg-card dark:bg-card rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-right gradient-text text-xl sm:text-2xl font-bold flex items-center gap-3">
              <BarChart className="w-6 h-6 text-primary" />
              تتبع بيكسل فيسبوك
            </CardTitle>
            <CardDescription className="text-right text-foreground font-medium">
              أدخل معرف بيكسل فيسبوك الخاص بك لتتبع أحداث المستخدم وتحسين إعلاناتك على منصة فيسبوك.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_pixel_id" className="text-right block font-semibold">
                معرف البيكسل
              </Label>
              <Input
                id="facebook_pixel_id"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="مثال: 123456789012345"
                className={`text-left ${
                  pixelId.trim() && !isValid 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-border focus:border-primary'
                } glass-effect`}
                dir="ltr"
              />
              {pixelId.trim() && !isValid && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 text-right"
                >
                  معرف بيكسل فيسبوك يجب أن يتكون من 15-16 رقماً فقط.
                </motion.p>
              )}
              {pixelId.trim() && isValid && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-green-500 text-right"
                >
                  صيغة معرف البيكسل صحيحة.
                </motion.p>
              )}
            </div>
            <div className="flex justify-start">
              <Button 
                onClick={handleSave} 
                disabled={loading || isSaving || !hasValidChanges}
                className={`transition-all duration-300 ${
                  hasValidChanges 
                    ? 'btn-gradient opacity-100 scale-100 shadow-lg hover:shadow-xl' 
                    : 'bg-muted text-muted-foreground opacity-50 scale-95 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>...جاري الحفظ</span>
                  </div>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Instructions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative p-[3px] "
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
        <Card className="relative z-10 bg-card dark:bg-card rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-right gradient-text text-xl font-bold">
              كيفية الحصول على معرف البيكسل
            </CardTitle>
          </CardHeader>
          <CardContent className="glass-effect rounded-lg">
            <ol className="space-y-4 text-right " style={{ listStylePosition: 'inside' }}>
              <li className="leading-relaxed flex items-start ">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 mr-0 flex-shrink-0">
                  1
                </span>
                <span>انتقل إلى{' '}
                  <a 
                    href="https://business.facebook.com/events_manager" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Facebook Events Manager
                  </a>
                </span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  2
                </span>
                <span>اختر البيكسل الخاص بك من القائمة</span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  4
                </span>
                <span>انسخ معرف البيكسل من الإعدادات والصقه في الحقل أعلاه</span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  5
                </span>
                <span>تأكد من أن المعرف يتكون من 15-16 رقماً فقط</span>
              </li>
            </ol>
            
            <div className="mt-6 p-4 glass-effect bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">💡 نصيحة مهمة</h4>
              <p className="text-sm text-foreground font-medium">
                بعد إضافة معرف البيكسل، ستتمكن من تتبع زيارات العملاء وتحويلاتهم لتحسين إعلاناتك على فيسبوك وإنستغرام.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FacebookPixelSettingsTab;