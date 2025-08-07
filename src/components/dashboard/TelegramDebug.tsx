import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { motion } from 'framer-motion';

export function TelegramDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [debugOutput, setDebugOutput] = useState<string[]>([]);
  const { settings } = useStoreSettings();

  const addDebugLog = (message: string) => {
    setDebugOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testTelegramNotification = async () => {
    if (!settings?.telegram_chat_id) {
      toast.error('لم يتم تعيين معرّف محادثة تيليجرام');
      return;
    }

    setIsLoading(true);
    setDebugOutput([]);
    addDebugLog('🧪 بدء اختبار إشعارات تيليجرام...');

    const testOrder = {
      customer_name: 'عميل تجريبي',
      customer_phone: '+213123456789',
      wilaya: 'الجزائر',
      full_address: 'عنوان تجريبي',
      product_name: 'منتج تجريبي',
      color: 'أزرق',
      size: 'M',
      quantity: 1,
      total_price: '1000 DZD',
    };

    addDebugLog('📤 إرسال بيانات طلب تجريبي...');
    addDebugLog(`👤 معرّف المحادثة: ${settings.telegram_chat_id}`);
    addDebugLog(`📋 بيانات الطلب: ${JSON.stringify(testOrder, null, 2)}`);

    try {
      // Create and format the message for Telegram
      const message = `
        📢 **اختبار إشعارات تيليجرام** 📢
        -----------------------------------
        👤 **الاسم:** ${testOrder.customer_name}
        📞 **الهاتف:** ${testOrder.customer_phone}
        📍 **الولاية:** ${testOrder.wilaya}
        🏠 **العنوان:** ${testOrder.full_address}
        -----------------------------------
        🛒 **المنتج:** ${testOrder.product_name}
        🎨 **اللون:** ${testOrder.color || 'N/A'} | **المقاس:** ${testOrder.size || 'N/A'}
        🔢 **الكمية:** ${testOrder.quantity}
        -----------------------------------
        💰 **السعر الإجمالي:** ${testOrder.total_price}
      `;

      // This would typically call your server-side function
      // For testing purposes, we'll use a simple fetch to the Supabase Edge Function
      const response = await fetch('/api/test-telegram-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: settings.telegram_chat_id,
          message: message
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'فشل إرسال الإشعار');
      }

      const responseData = await response.json();
      addDebugLog(`📡 استجابة الخادم: ${JSON.stringify(responseData)}`);
      addDebugLog('✅ تم إرسال الإشعار بنجاح!');
      toast.success('تم إرسال إشعار تجريبي بنجاح!');

    } catch (error) {
      addDebugLog(`❌ خطأ: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('فشل إرسال الإشعار التجريبي');
      
      // Alternative notification using your edge function
      try {
        addDebugLog('🔄 محاولة استخدام دالة الإشعارات الأساسية...');
        
        // Call your Supabase Edge Function directly
        await fetch('/api/order-notifier', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ record: testOrder })
        });
        
        addDebugLog('📡 تم استدعاء دالة الإشعارات - تحقق من تطبيق تيليجرام');
        toast.success('تم استدعاء دالة الإشعارات - تحقق من تيليجرام');
      } catch (fallbackError) {
        addDebugLog(`❌ فشلت المحاولة البديلة أيضًا: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearDebugOutput = () => {
    setDebugOutput([]);
  };

  return (
    <div className="relative p-[3px]">
      <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
      <Card className="relative z-10 bg-card dark:bg-card rounded-xl border-0">
        <CardHeader>
          <CardTitle className="text-right mb-0 gradient-text text-xl font-bold">
            اختبار إشعارات تيليجرام
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" dir="rtl">
          <div className="flex gap-3 justify-start mt-0">
            <Button 
              onClick={testTelegramNotification} 
              disabled={isLoading}
              className="btn-gradient"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>...جاري الاختبار</span>
                </div>
              ) : (
                'اختبار الإشعارات'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearDebugOutput}
              className="glass-effect border-border hover:bg-primary/10"
            >
              مسح السجل
            </Button>
          </div>
          
          {debugOutput.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-effect bg-card dark:bg-card border border-border rounded-lg overflow-hidden"
            >
              <div className="bg-gradient-primary dark:bg-gradient-primary-dark px-4 py-2">
                <span className="text-white font-semibold text-sm">سجل الاختبار</span>
              </div>
              <div className="p-4 max-h-60 overflow-y-auto">
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap text-right">
                  {debugOutput.join('\n')}
                </pre>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}