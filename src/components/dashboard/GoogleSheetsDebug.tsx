import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';

export function GoogleSheetsDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [debugOutput, setDebugOutput] = useState<string[]>([]);
  const { settings } = useStoreSettings();

  const addDebugLog = (message: string) => {
    setDebugOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGoogleSheetsConnection = async () => {
    if (!settings?.google_sheet_api_url) {
      toast.error('لم يتم تعيين رابط Google Sheets');
      return;
    }

    setIsLoading(true);
    setDebugOutput([]);
    addDebugLog('🧪 بدء اختبار الاتصال بـ Google Sheets...');

    const testPayload = {
      created_at: new Date().toLocaleString('fr-FR'),
      productTypeName: 'نوع تجريبي',
      product_name: 'منتج تجريبي',
      quantity: 1,
      size: 'M',
      color: 'أزرق',
      total_price: '1000 DZD',
      customer_name: 'عميل تجريبي',
      customer_phone: '+213123456789',
      wilaya: 'الجزائر',
      commune: 'باب الزوار',
      full_address: 'عنوان تجريبي',
      status: 'En attente'
    };

    addDebugLog('📤 إرسال البيانات التجريبية...');
    addDebugLog(`🔗 الرابط: ${settings.google_sheet_api_url}`);
    addDebugLog(`📋 البيانات: ${JSON.stringify(testPayload, null, 2)}`);

    try {
      // First try with CORS to see the actual response
      const response = await fetch(settings.google_sheet_api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      addDebugLog(`📡 استجابة الخادم: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      addDebugLog(`📋 محتوى الاستجابة: ${responseText}`);

      if (response.ok) {
        addDebugLog('✅ تم الاختبار بنجاح!');
        toast.success('تم اختبار الاتصال بنجاح!');
      } else {
        addDebugLog('❌ فشل الاختبار');
        toast.error('فشل اختبار الاتصال');
      }

    } catch (error) {
      addDebugLog(`❌ خطأ في الشبكة: ${error}`);
      
      // Try with no-cors mode
      try {
        addDebugLog('🔄 محاولة مع وضع no-cors...');
        await fetch(settings.google_sheet_api_url, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testPayload)
        });
        addDebugLog('📡 تم إرسال الطلب (no-cors mode) - تحقق من جدول Google Sheets');
        toast.success('تم إرسال الطلب - تحقق من Google Sheets');
      } catch (noCorsError) {
        addDebugLog(`❌ فشل حتى مع no-cors: ${noCorsError}`);
        toast.error('فشل الاتصال تماماً');
      }
    }

    setIsLoading(false);
  };

  const clearDebugOutput = () => {
    setDebugOutput([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>اختبار Google Sheets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testGoogleSheetsConnection} disabled={isLoading}>
            {isLoading ? 'جاري الاختبار...' : 'اختبار الاتصال'}
          </Button>
          <Button variant="outline" onClick={clearDebugOutput}>
            مسح السجل
          </Button>
        </div>
        
        {debugOutput.length > 0 && (
          <div className="bg-gray-100 p-3 rounded-md text-xs max-h-60 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-right" dir="rtl">
              {debugOutput.join('\n')}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}