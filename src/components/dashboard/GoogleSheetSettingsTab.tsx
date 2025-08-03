import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useStoreSettings } from "@/contexts/StoreSettingsContext"; // ✅ CORRECT IMPORT
import { GoogleSheetsDebug } from '@/components/dashboard/GoogleSheetsDebug';


export function GoogleSheetSettingsTab() {
  const { settings: storeSettings, updateSettings: updateStoreSettings, loading } = useStoreSettings();
  const [googleSheetApiUrl, setGoogleSheetApiUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (storeSettings) {
      setGoogleSheetApiUrl(storeSettings.google_sheet_api_url || '');
    }
  }, [storeSettings]);

  const isValidGoogleSheetsUrl = (url: string) => {
    if (!url) return true; // Allow empty URL
  const pattern = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec(\?.*)?$/;
    return pattern.test(url);
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
      toast.success('تم حفظ إعدادات Google Sheets بنجاح!');
    } catch (error) {
      console.error('Error saving Google Sheets settings:', error);
      toast.error('فشل في حفظ الإعدادات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets</CardTitle>
          <CardDescription>
            قم بمزامنة الطلبات الجديدة مباشرة إلى جدول Google Sheet . اتبع التعليمات أدناه للحصول على رابط تطبيق الويب الخاص بك.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gsheet-url">Web App URL</Label>
            <Input
              id="gsheet-url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={googleSheetApiUrl}
              onChange={(e) => setGoogleSheetApiUrl(e.target.value)}
              className={googleSheetApiUrl && !isValidGoogleSheetsUrl(googleSheetApiUrl) ? 'border-red-500' : ''}
            />
            {googleSheetApiUrl && !isValidGoogleSheetsUrl(googleSheetApiUrl) && (
              <p className="text-sm text-red-500">
                يرجى إدخال رابط صالح لتطبيق Google Apps Script
              </p>
            )}
          </div>
          <Button 
            onClick={onSave} 
            disabled={loading || isSaving || (googleSheetApiUrl && !isValidGoogleSheetsUrl(googleSheetApiUrl))}
          >
              {isSaving ? '...جاري الحفظ' : 'حفظ التغييرات'}
          </Button>
        </CardContent>
      </Card>

      <GoogleSheetsDebug />

      {/* Instructions card */}
      <Card>
        <CardHeader>
          <CardTitle>تعليمات الإعداد</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm border rounded-md bg-muted/40">
          <ol className="space-y-2 list-decimal list-inside">
            <li>إنشاء جدول بيانات Google جديد.</li>
            <li>في القائمة، انتقل إلى <strong>الإضافات &gt; Apps Script</strong>.</li>
            <li>احذف أي كود موجود من ملف `Code.gs`.</li>
            <li>انسخ البرنامج النصي بالكامل المقدم من قبل المسؤول الخاص بك والصقه في المحرر.
                <div className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                    <pre className="text-xs">
                {`// غير هذا الرابط إلى رابط جدول البيانات الخاص بك
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1iv8FUGJICbnynrZcQBzV5HdiQ024btQQMoNqjLJUUY4/edit?gid=0#gid=0";
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
            </li>
            <li className="leading-relaxed">
              في أعلى الكود، ابحث عن السطر <code className="bg-gray-200 px-1 rounded">const SHEET_NAME = "Sheet1";</code> وغيّر <code className="bg-gray-200 px-1 rounded">"Sheet1"</code> إلى الاسم الفعلي لصفحة الجدول إذا كان مختلفاً.
            </li>
            <li className="leading-relaxed">
              انقر على زر <strong>Deploy</strong>، ثم اختر <strong>New deployment</strong>.
            </li>
            <li className="leading-relaxed">
              في "Execute as"، اختر <strong>Me</strong>.
            </li>
            <li className="leading-relaxed">
              في "Who has access"، اختر <strong>Anyone</strong>.
            </li>
            <li className="leading-relaxed">
              انقر على <strong>Deploy</strong>، ثم انقر على <strong>Authorize access</strong> واتبع التعليمات للسماح للكود بالعمل.
            </li>
            <li className="leading-relaxed">
              بعد النشر، انسخ <strong>Web app URL</strong> المُولد والصقه في حقل الإدخال أعلاه.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}