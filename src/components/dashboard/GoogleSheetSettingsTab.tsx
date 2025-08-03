import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useStoreSettings } from "@/contexts/StoreSettingsContext";
import { GoogleSheetsDebug } from '@/components/dashboard/GoogleSheetsDebug';
import { motion } from "framer-motion";

export function GoogleSheetSettingsTab() {
  const { settings: storeSettings, updateSettings: updateStoreSettings, loading } = useStoreSettings();
  const [googleSheetApiUrl, setGoogleSheetApiUrl] = useState('');
  const [initialUrl, setInitialUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (storeSettings) {
      const url = storeSettings.google_sheet_api_url || '';
      setGoogleSheetApiUrl(url);
      setInitialUrl(url);
    }
  }, [storeSettings]);

  const isValidGoogleSheetsUrl = (url: string) => {
    if (!url) return true; // Allow empty URL
    const pattern = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec(\?.*)?$/;
    return pattern.test(url);
  };

  // Check if URL has changed and is valid
  const hasValidChanges = () => {
    return googleSheetApiUrl !== initialUrl && 
           googleSheetApiUrl.trim() !== '' && 
           isValidGoogleSheetsUrl(googleSheetApiUrl);
  };

  const onSave = async () => {
    if (!storeSettings) {
      toast.error('لم يتم تحميل الإعدادات');
      return;
    }

    if (googleSheetApiUrl && !isValidGoogleSheetsUrl(googleSheetApiUrl)) {
      toast.error('يرجى إدخال رابط صالح لتطبيق Google Apps Script');
      return;
    }

    setIsSaving(true);
    try {
      await updateStoreSettings({
        google_sheet_api_url: googleSheetApiUrl,
      });
      setInitialUrl(googleSheetApiUrl); // Update initial URL after successful save
      toast.success('تم حفظ إعدادات Google Sheets بنجاح!');
    } catch (error) {
      console.error('Error saving Google Sheets settings:', error);
      toast.error('فشل في حفظ الإعدادات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

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
            <CardTitle className="text-right gradient-text text-xl sm:text-2xl font-bold">
              تكامل Google Sheets
            </CardTitle>
            <CardDescription className="text-right text-foreground font-medium">
              قم بمزامنة الطلبات الجديدة مباشرة إلى جدول Google Sheet. اتبع التعليمات أدناه للحصول على رابط تطبيق الويب الخاص بك.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gsheet-url" className="text-right block font-semibold">
                رابط تطبيق الويب
              </Label>
              <Input
                id="gsheet-url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={googleSheetApiUrl}
                onChange={(e) => setGoogleSheetApiUrl(e.target.value)}
                className={`text-left ${
                  googleSheetApiUrl && !isValidGoogleSheetsUrl(googleSheetApiUrl) 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-border focus:border-primary'
                } glass-effect`}
                dir="ltr"
              />
              {googleSheetApiUrl && !isValidGoogleSheetsUrl(googleSheetApiUrl) && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 text-right"
                >
                  يرجى إدخال رابط صالح لتطبيق Google Apps Script
                </motion.p>
              )}
            </div>
            <div className="flex justify-start">
              <Button 
                onClick={onSave} 
                disabled={loading || isSaving || !hasValidChanges()}
                className={`transition-all duration-300 ${
                  hasValidChanges() 
                    ? 'btn-gradient opacity-100 scale-100 shadow-lg hover:shadow-xl' 
                    : 'bg-muted text-muted-foreground opacity-50 scale-95 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>جاري الحفظ...</span>
                  </div>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Debug Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GoogleSheetsDebug />
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
              تعليمات الإعداد
            </CardTitle>
          </CardHeader>
          <CardContent className="glass-effect rounded-lg">
            <ol className="space-y-4 text-right" style={{ listStylePosition: 'inside' }}>
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  1
                </span>
                <span>قم بإنشاء جدول Google Sheet جديد.</span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  2
                </span>
                <span>
                  في القائمة، انتقل إلى{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Extensions &gt; Apps Script
                  </code>
                </span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  3
                </span>
                <span>
                  احذف أي كود موجود من ملف{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Code.gs
                  </code>
                </span>
              </li>
              
              <li className="leading-relaxed">
                <div className="flex items-start">
                  <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                    4
                  </span>
                  <span>انسخ الكود الكامل أدناه والصقه في المحرر:</span>
                </div>
                <div className="mt-3 mr-9">
                  <div className="glass-effect bg-card dark:bg-card border border-border rounded-lg overflow-hidden">
                    <div className="bg-gradient-primary dark:bg-gradient-primary-dark px-4 py-2">
                      <span className="text-white font-semibold text-sm">Google Apps Script Code</span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <pre className="text-xs font-mono text-foreground whitespace-pre-wrap" dir="ltr">
{`// غير هذا الرابط إلى رابط جدول البيانات الخاص بك
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1OqEx7aDweDeZecJ8nLFZDB3tfAFTLxoFli8D3iahMXI/edit?gid=0#gid=0";
const SHEET_NAME = "Sheet1"; // غير الإسم إذا كان مختلفاً

function doPost(e) {
    console.log('doPost function called');
    
    try {
        // Open the spreadsheet by URL
        const sheets = SpreadsheetApp.openByUrl(SHEET_URL);
        const sheet = sheets.getSheetByName(SHEET_NAME);
        
        if (!sheet) {
            console.error('Sheet not found:', SHEET_NAME);
            return ContentService
                .createTextOutput(JSON.stringify({ "status": "error", "message": "Sheet not found: " + SHEET_NAME }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        let data;
        
        // Handle both e.parameter and e.postData.contents
        if (e.parameter && Object.keys(e.parameter).length > 0) {
            data = e.parameter;
            console.log('Using e.parameter:', data);
        } else if (e.postData && e.postData.contents) {
            data = JSON.parse(e.postData.contents);
            console.log('Using e.postData.contents:', data);
        } else {
            console.error('No data received');
            return ContentService
                .createTextOutput(JSON.stringify({ "status": "error", "message": "No data received" }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Check if headers exist, if not create them
        if (sheet.getRange("A1").getValue() === "") {
            console.log('Adding headers...');
            const headers = [ 
                "Date", "Product Type", "Product Name", "Quantity", 
                "Size", "Color", "Total Price", "Customer Name", 
                "Customer Phone", "Wilaya", "Commune", "Full Address", "Status" 
            ];
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
            sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
        }
        
        // Add the new row
        const newRow = [
            data.created_at || new Date().toLocaleString('fr-FR'),
            data.productTypeName || 'N/A',
            data.product_name || 'N/A',
            data.quantity || 'N/A',
            data.size || 'N/A',
            data.color || 'N/A',
            data.total_price || 'N/A',
            data.customer_name || 'N/A',
            data.customer_phone || 'N/A',
            data.wilaya || 'N/A',
            data.commune || 'N/A',
            data.full_address || 'N/A',
            data.status || 'N/A'
        ];
        
        console.log('Adding row:', newRow);
        sheet.appendRow(newRow);
        
        console.log('Row added successfully');
        return ContentService
            .createTextOutput(JSON.stringify({ "status": "success", "message": "Data added successfully" }))
            .setMimeType(ContentService.MimeType.JSON);
            
    } catch (error) {
        console.error('Error in doPost:', error.toString());
        return ContentService
            .createTextOutput(JSON.stringify({ 
                "status": "error", 
                "message": error.toString(),
                "stack": error.stack || 'No stack trace available'
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Test function
function testFunction() {
    const testData = {
        created_at: new Date().toLocaleString('fr-FR'),
        productTypeName: 'Test Type',
        product_name: 'Test Product',
        quantity: 1,
        size: 'M',
        color: 'Blue',
        total_price: '100 DZD',
        customer_name: 'Test Customer',
        customer_phone: '+213123456789',
        wilaya: 'Algiers',
        commune: 'Bab Ezzouar',
        full_address: 'Test Address',
        status: 'En attente'
    };
    
    const mockEvent = {
        postData: {
            contents: JSON.stringify(testData)
        }
    };
    
    return doPost(mockEvent);
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  5
                </span>
                <span>
                  في أعلى الكود، ابحث عن السطر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                  const SHEET_URL = "https://docs.google.com/spreadsheets/...";
                    const SHEET_NAME = "Sheet1";
                  </code>
                  {' '}وغيّر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    "Sheet1" و "https://docs.google.com/spreadsheets/..."
                  </code>
                  {' '}  إلى الاسم الفعلي لصفحة الجدول و الرابط الخاص بصفحة الجدول .
                </span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  6
                </span>
                <span>
                  انقر على زر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Deploy
                  </code>
                  ، ثم اختر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    New deployment
                  </code>
                  ، ثم اختر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Select Type
                  </code>
                  ، ثم اختر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Web app
                  </code>
                </span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  7
                </span>
                <span>
                  في{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Execute as
                  </code>
                  ، اختر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Me
                  </code>
                </span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  8
                </span>
                <span>
                  في{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Who has access
                  </code>
                  ، اختر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Anyone
                  </code>
                </span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  9
                </span>
                <span>
                  انقر على{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Deploy
                  </code>
                  ، ثم انقر على{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Authorize access
                  </code>
                  {' '}واتبع التعليمات للسماح للكود بالعمل.
                </span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  10
                </span>
                <span>
                  بعد النشر، انسخ{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Web app URL
                  </code>
                  {' '}المُولد والصقه في حقل الإدخال أعلاه.
                  ، ثم انقر على{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Done
                  </code>
                </span>
              </li>
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  11
                </span>
                <span>
                    إختبر الإتصال عبر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    اختبار Google Sheets
                  </code>
                  {' '} أعلاه 
                  ، ثم تفقد صفحة الجدول الخاصة بك  {' '}
                  
                </span>
              </li>
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  12
                </span>
                <span>
                      إن لم يعمل الكود شاهد هذا الفيديو لتفهم أكثر{' '}
                  <a 
                    href="https://drive.google.com/file/your-video-link-here/view" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                      شاهد الفيديو التوضيحي
                    </span>
                    
                  </a>
                  
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}