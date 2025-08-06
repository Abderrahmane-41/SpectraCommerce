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
            <CardTitle className="text-right gradient-text text-xl font-bold mb-0">
              تعليمات الإعداد<a 
                    href="https://drive.google.com/file/d/1f7HY0VmIHMX7VLU7ks4wX9ZcGDJCzAu6/view?usp=sharing&t=9" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                      شاهد الفيديو التوضيحي
                    </span>
                    
                  </a>
            </CardTitle>
          </CardHeader>
          <CardContent className="glass-effect rounded-lg">
            <ol className="space-y-4 text-right p-1" style={{ listStylePosition: 'inside' }}>
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  1
                </span>
                <span>قم بإنشاء جدول Google Sheet جديد.وقم بتسميته</span>
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
                <div className="mt-3 mr-0 ml-0">
                  <div className="glass-effect bg-card dark:bg-card border border-border rounded-lg overflow-hidden">
                    <div className="bg-gradient-primary dark:bg-gradient-primary-dark px-4 py-2">
                      <span className="text-white font-semibold text-sm">Google Apps Script Code</span>
                       <button 
    onClick={() => {
      const codeText = `// غير هذا الرابط إلى رابط جدول البيانات الخاص بك
const SHEET_URL = "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit";
const SHEET_NAME = "Sheet1"; // غير الإسم إذا كان مختلفاً

function doPost(e) {
    try {
        // Open the spreadsheet by URL
        const sheets = SpreadsheetApp.openByUrl(SHEET_URL);
        const sheet = sheets.getSheetByName(SHEET_NAME);
        
        if (!sheet) {
            return ContentService
                .createTextOutput(JSON.stringify({ "status": "error", "message": "Sheet not found: " + SHEET_NAME }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        let data;
        
        // Handle both e.parameter and e.postData.contents
        if (e.parameter && Object.keys(e.parameter).length > 0) {
            data = e.parameter;
        } else if (e.postData && e.postData.contents) {
            data = JSON.parse(e.postData.contents);
        } else {
            return ContentService
                .createTextOutput(JSON.stringify({ "status": "error", "message": "No data received" }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Function to fix phone number formatting (preserve leading 0 and + signs)
        function formatPhoneNumber(phone) {
            if (!phone) return 'غير محدد';
            const phoneStr = phone.toString();
            return "'" + phoneStr; // Add single quote prefix to force text treatment
        }

        // Function to fix mixed language text direction
        function fixMixedLanguageText(text) {
            if (!text) return 'غير محدد';
            return '\u202B' + text + '\u202C'; // Add Unicode RTL markers
        }

        // Check if headers exist, if not create them
        if (sheet.getRange("A1").getValue() === "") {
            const headers = [ 
                "التاريخ", "نوع المنتج", "اسم المنتج", "الكمية", 
                "المقاس", "اللون", "السعر الإجمالي", "اسم العميل", 
                "رقم الهاتف", "الولاية", "البلدية", "العنوان الكامل", "الحالة" 
            ];
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
            sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
            sheet.getRange(1, 1, 1, headers.length).setHorizontalAlignment('center');
        }
        
        // Create the row data with proper formatting
        const newRow = [
            data.created_at || new Date().toLocaleString('ar-DZ'),
            data.productTypeName || 'غير محدد',
            data.product_name || 'غير محدد',
            data.quantity || 1,
            data.size || 'لا يوجد',
            data.color || 'لا يوجد',
            data.total_price || '0 DZD',
            data.customer_name || 'غير محدد',
            formatPhoneNumber(data.customer_phone),
            data.wilaya || 'غير محدد',
            data.commune || 'غير محدد',
            fixMixedLanguageText(data.full_address),
            data.status || 'قيد الانتظار'
        ];
        
        // Add the row and apply proper formatting
        const lastRow = sheet.getLastRow() + 1;
        sheet.getRange(lastRow, 1, 1, newRow.length).setValues([newRow]);
        
        // Format specific columns to preserve data integrity
        const phoneCell = sheet.getRange(lastRow, 9);
        phoneCell.setNumberFormat('@'); // Text format for phone number
        
        const addressCell = sheet.getRange(lastRow, 12);
        addressCell.setNumberFormat('@'); // Text format for address
        addressCell.setHorizontalAlignment('right'); // Right align for Arabic
        
        // Set right-to-left text direction for Arabic content columns
        const arabicColumns = [1, 2, 3, 5, 6, 8, 10, 11, 12, 13];
        arabicColumns.forEach(col => {
            const cell = sheet.getRange(lastRow, col);
            cell.setHorizontalAlignment('right');
        });
        
        return ContentService
            .createTextOutput(JSON.stringify({ "status": "success", "message": "Data added successfully" }))
            .setMimeType(ContentService.MimeType.JSON);
            
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ 
                "status": "error", 
                "message": error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}`;

      // Create a temporary textarea element to handle copying
      const textarea = document.createElement('textarea');
      textarea.value = codeText;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      
      // For mobile devices, this special handling is needed
      if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        const range = document.createRange();
        range.selectNodeContents(textarea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textarea.setSelectionRange(0, textarea.value.length);
      } else {
        textarea.select();
      }
      
      // Execute copy command and handle result
      const button = document.activeElement as HTMLButtonElement;
      let originalText = button.innerHTML;
      
      try {
        document.execCommand('copy');
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span class="ml-1">تم النسخ!</span>
        `;
        button.classList.add('bg-green-500');
        button.classList.add('text-white');
        
        toast.success('تم نسخ الكود بنجاح');
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.classList.remove('bg-green-500');
          button.classList.remove('text-white');
        }, 2000);
      } catch (err) {
        toast.error('فشل نسخ الكود، حاول مرة أخرى');
      }
      
      document.body.removeChild(textarea);
    }}
    className="bg-background hover:bg-accent active:scale-95 transition-all duration-150 text-foreground text-xs py-1 px-2 rounded-md flex items-center shadow-sm hover:shadow-md"
    title="نسخ الكود"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
    <span className="ml-1">نسخ</span>
  </button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <pre className="text-xs font-mono text-foreground whitespace-pre-wrap" dir="ltr">
{`// غير هذا الرابط إلى رابط جدول البيانات الخاص بك
const SHEET_URL = "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit";
const SHEET_NAME = "Sheet1"; // غير الإسم إذا كان مختلفاً

function doPost(e) {
    try {
        // Open the spreadsheet by URL
        const sheets = SpreadsheetApp.openByUrl(SHEET_URL);
        const sheet = sheets.getSheetByName(SHEET_NAME);
        
        if (!sheet) {
            return ContentService
                .createTextOutput(JSON.stringify({ "status": "error", "message": "Sheet not found: " + SHEET_NAME }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        let data;
        
        // Handle both e.parameter and e.postData.contents
        if (e.parameter && Object.keys(e.parameter).length > 0) {
            data = e.parameter;
        } else if (e.postData && e.postData.contents) {
            data = JSON.parse(e.postData.contents);
        } else {
            return ContentService
                .createTextOutput(JSON.stringify({ "status": "error", "message": "No data received" }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Function to fix phone number formatting (preserve leading 0 and + signs)
        function formatPhoneNumber(phone) {
            if (!phone) return 'غير محدد';
            const phoneStr = phone.toString();
            return "'" + phoneStr; // Add single quote prefix to force text treatment
        }

        // Function to fix mixed language text direction
        function fixMixedLanguageText(text) {
            if (!text) return 'غير محدد';
            return '\u202B' + text + '\u202C'; // Add Unicode RTL markers
        }

        // Check if headers exist, if not create them
        if (sheet.getRange("A1").getValue() === "") {
            const headers = [ 
                "التاريخ", "نوع المنتج", "اسم المنتج", "الكمية", 
                "المقاس", "اللون", "السعر الإجمالي", "اسم العميل", 
                "رقم الهاتف", "الولاية", "البلدية", "العنوان الكامل", "الحالة" 
            ];
            sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
            sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
            sheet.getRange(1, 1, 1, headers.length).setHorizontalAlignment('center');
        }
        
        // Create the row data with proper formatting
        const newRow = [
            data.created_at || new Date().toLocaleString('ar-DZ'),
            data.productTypeName || 'غير محدد',
            data.product_name || 'غير محدد',
            data.quantity || 1,
            data.size || 'لا يوجد',
            data.color || 'لا يوجد',
            data.total_price || '0 DZD',
            data.customer_name || 'غير محدد',
            formatPhoneNumber(data.customer_phone),
            data.wilaya || 'غير محدد',
            data.commune || 'غير محدد',
            fixMixedLanguageText(data.full_address),
            data.status || 'قيد الانتظار'
        ];
        
        // Add the row and apply proper formatting
        const lastRow = sheet.getLastRow() + 1;
        sheet.getRange(lastRow, 1, 1, newRow.length).setValues([newRow]);
        
        // Format specific columns to preserve data integrity
        const phoneCell = sheet.getRange(lastRow, 9);
        phoneCell.setNumberFormat('@'); // Text format for phone number
        
        const addressCell = sheet.getRange(lastRow, 12);
        addressCell.setNumberFormat('@'); // Text format for address
        addressCell.setHorizontalAlignment('right'); // Right align for Arabic
        
        // Set right-to-left text direction for Arabic content columns
        const arabicColumns = [1, 2, 3, 5, 6, 8, 10, 11, 12, 13];
        arabicColumns.forEach(col => {
            const cell = sheet.getRange(lastRow, col);
            cell.setHorizontalAlignment('right');
        });
        
        return ContentService
            .createTextOutput(JSON.stringify({ "status": "success", "message": "Data added successfully" }))
            .setMimeType(ContentService.MimeType.JSON);
            
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ 
                "status": "error", 
                "message": error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
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
                    
                    const SHEET_NAME = "Sheet1" ;
                  </code>
                  {' '}وغيّر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    "Sheet1"  
                  </code>
                  {' '}  إلى الاسم الفعلي لصفحة الجدول .
                </span>
              </li>
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  6
                </span>
                <span>
                 ابحث عن السطر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    
                    const SHEET_URL= "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit";
                  </code>
                  {' '}وغيّر{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    "https://docs.google.com" ...
                  </code>
                  {' '} إلى الرابط الفعلي لصفحة الجدول .
                </span>
              </li>
              
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  7
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
                  8
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
                  9
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
                  10
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
                  11
                </span>
                <span>
                    إذا أتتك رسالة تحذيرية من غوغل بها{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Google hasn’t verified this app
The app is requesting access to sensitive info in your Google Account. Until the developer example_email@gmail.com verifies this app with Google, you shouldn't use it
                  </code>
                    انقر على{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Advanced
                  </code>
                  
                </span>
              </li>
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  12
                </span>
                <span>
                  ثم انقر على{' '}
                  <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                    Go to Untitled project (unsafe)
                  </code>
                  ثم أكمل التعليمات للسماح للكود بالعمل
                  
                </span>
              </li>
              <li className="leading-relaxed flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark text-white text-sm flex items-center justify-center ml-3 mt-0.5 flex-shrink-0">
                  13
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
                  14
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
                  15
                </span>
                <span>
                      إن لم يعمل الكود شاهد هذا الفيديو لتفهم أكثر{' '}
                  <a 
                    href="https://drive.google.com/file/d/1f7HY0VmIHMX7VLU7ks4wX9ZcGDJCzAu6/view?usp=sharing&t=9" 
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