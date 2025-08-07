import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const TelegramNotificationsTab = () => {
  const { settings, updateSettings, loading } = useStoreSettings();
  const [chatId, setChatId] = useState(settings?.telegram_chat_id || '');
  const [originalChatId, setOriginalChatId] = useState(settings?.telegram_chat_id || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Validation state
  const [isValid, setIsValid] = useState(false);
  
  // Check if there's a valid change
  const hasValidChanges = isValid && chatId !== originalChatId;

  // Validate the chat ID format
  const validateChatId = (id: string) => {
    if (!id.trim()) return true; // Allow empty
    return /^-?\d+$/.test(id.trim()); // Simple check for numeric value with optional minus sign
  };

  useEffect(() => {
    if (settings?.telegram_chat_id) {
      setChatId(settings.telegram_chat_id);
      setOriginalChatId(settings.telegram_chat_id);
      setIsValid(validateChatId(settings.telegram_chat_id));
    }
  }, [settings]);

  // Update validation on input change
  useEffect(() => {
    setIsValid(validateChatId(chatId));
  }, [chatId]);

  const handleSave = async () => {
    if (chatId.trim() && !isValid) {
      toast.error('معرف محادثة تيليجرام غير صالح. يجب أن يكون رقماً فقط.');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateSettings({ telegram_chat_id: chatId.trim() });
      setOriginalChatId(chatId.trim()); // Update the original after successful save
      toast.success('تم حفظ معرف محادثة تيليجرام بنجاح!');
    } catch (error) {
      toast.error('فشل حفظ معرف محادثة تيليجرام.');
      console.error('Failed to save Telegram Chat ID:', error);
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
              <MessageCircle className="w-6 h-6 text-primary" />
              إشعارات تيليجرام للطلبات
            </CardTitle>
            <CardDescription className="text-right text-foreground font-medium">
              أدخل معرف محادثة تيليجرام الخاص بك لتلقي إشعارات الطلبات الجديدة مباشرة على تيليجرام.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegram_chat_id" className="text-right block font-semibold">
                معرف محادثة تيليجرام
              </Label>
              <Input
                id="telegram_chat_id"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="مثال: -1001234567890"
                className={`text-left ${
                  chatId.trim() && !isValid 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-border focus:border-primary'
                } glass-effect`}
                dir="ltr"
              />
              {chatId.trim() && !isValid && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 text-right"
                >
                  معرف محادثة تيليجرام غير صالح. يجب أن يكون رقماً فقط.
                </motion.p>
              )}
              {chatId.trim() && isValid && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-green-500 text-right"
                >
                  صيغة معرّف المحادثة صحيحة.
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
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative p-[3px]"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
        <Card className="relative z-10 bg-card dark:bg-card rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-right gradient-text text-xl font-bold">
              كيفية الحصول على معرف محادثة تيليجرام
            </CardTitle>
          </CardHeader>
          <CardContent className="glass-effect rounded-lg">
            <ol className="space-y-4 text-right" style={{ listStylePosition: 'inside' }}>
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  1
                </span>
                <span>افتح تطبيق تيليجرام وابحث عن البوت <strong>@Smart_Web_41_Bot</strong></span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  2
                </span>
                <span>ابدأ محادثة مع البوت بإرسال الرسالة <code>id/</code></span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  3
                </span>
                <span>سيرسل لك البوت معرف المحادثة الخاص بك  </span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  4
                </span>
                <span>انسخ الرقم الذي سيرسله لك البوت والصقه في الحقل أعلاه</span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  5
                </span>
                <span>قد يبدأ الرقم بعلامة الناقص (-) وهذا أمر طبيعي خاصةً للمجموعات</span>
              </li>
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  6
                </span>
                <span>قم بحفظ التغييرات ثم اتجه للمتجر وجرب طلب منتج ,وإذا لم يصلك إشعار قم بإعادة الخطوات</span>
              </li>
            </ol>
            
            <div className="mt-6 p-4 glass-effect bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">💡 نصيحة مهمة</h4>
              <p className="text-sm text-foreground font-medium">
                بعد إضافة معرف المحادثة، استخدم زر "اختبار الإشعارات" في الأعلى للتأكد من صحة الإعدادات وأنك ستتلقى الإشعارات عند وصول طلبات جديدة.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TelegramNotificationsTab;