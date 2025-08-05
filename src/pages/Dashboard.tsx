// src/pages/Dashboard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, ShoppingCart, Package, Settings as SettingsIcon, Truck, BarChart } from 'lucide-react'; // Using BarChart instead of Pixel
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import OrdersTab from '../components/dashboard/OrdersTab';
import ProductsTab from '../components/dashboard/ProductsTab';
import ShippingTab from '../components/dashboard/ShippingTab';
import PasswordResetModal from '../components/dashboard/PasswordResetModal';
import SettingsTab from '../components/dashboard/SettingsTab';
import FacebookPixelSettingsTab from '../components/dashboard/FacebookPixelSettingsTab'; // Import new component
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import MobileMenu from '@/components/MobileMenu';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import { GoogleSheetSettingsTab } from "@/components/dashboard/GoogleSheetSettingsTab"; // 1. Import




const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { settings, loading } = useStoreSettings();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/auth');
    } catch (error) {
      toast.error('خطأ في تسجيل الخروج');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
  <title>{settings?.store_name ? `لوحة تحكم ${settings.store_name}` : 'لوحة التحكم'}</title>
  {settings?.logo_url && (
    <>
      {/* Modern browsers - multiple formats */}
      <link rel="icon" type="image/png" sizes="32x32" href={settings.logo_url} />
      <link rel="icon" type="image/png" sizes="16x16" href={settings.logo_url} />
      <link rel="icon" type="image/jpeg" href={settings.logo_url} />

      {/* iOS support */}
      <link rel="apple-touch-icon" href={settings.logo_url} />

      {/* Force favicon refresh with timestamp */}
      <link rel="shortcut icon" href={`${settings.logo_url}?v=${Date.now()}`} />
    </>
  )}
</Helmet>
      <Navbar isDashboard={true}>
        <motion.button
          onClick={() => setIsMenuOpen(true)}
          className="p-1.5 sm:p-2 rounded-lg glass-effect hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Open menu"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      </Navbar>

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6 md:space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-2">
                  لوحة التحكم
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  إدارة أعمالك التجارية الإلكترونية من مكان واحد
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="hidden sm:grid w-full grid-cols-6"> {/* Changed to grid-cols-5 */}
                <TabsTrigger value="orders" className="flex items-center space-x-1 sm:space-x-2">
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">الطلبات</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center space-x-1 sm:space-x-2">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">المنتجات</span>
                </TabsTrigger>
                <TabsTrigger value="shipping" className="flex items-center space-x-1 sm:space-x-2">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">الشحن</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-1 sm:space-x-2">
                 <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                 <span className="text-xs sm:text-sm">إعدادات المتجر</span>
                </TabsTrigger>
                <TabsTrigger value="facebook-pixel" className="flex items-center space-x-1 sm:space-x-2"> {/* New tab */}
                 <BarChart className="w-3 h-3 sm:w-4 sm:h-4" />
                 <span className="text-xs sm:text-sm">تتبع لبيكسل فيسبوك</span>
                </TabsTrigger>
                <TabsTrigger value="google-sheets" className="flex items-center space-x-1 sm:space-x-2">
                 <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                 <span className="text-xs sm:text-sm">Google sheet </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4 sm:mt-6">
                <OrdersTab />
              </TabsContent>

              <TabsContent value="products" className="mt-4 sm:mt-6">
                <ProductsTab />
              </TabsContent>

              <TabsContent value="shipping" className="mt-4 sm:mt-6">
                <ShippingTab />
              </TabsContent>
              <TabsContent value="settings" className="mt-4 sm:mt-6">
                <SettingsTab />
              </TabsContent>
              <TabsContent value="facebook-pixel" className="mt-4 sm:mt-6"> {/* New content */}
                <FacebookPixelSettingsTab />
              </TabsContent>

              <TabsContent value="google-sheets" className="mt-4 sm:mt-6"> 
                <GoogleSheetSettingsTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <PasswordResetModal
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
      />

      <MobileMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        onLogout={handleLogout}
        onPasswordReset={() => {
          setIsMenuOpen(false);
          setIsPasswordResetOpen(true);
        }}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        menuType="dashboard"
        storeName={settings?.store_name}

      />
    </div>
  );
};

export default Dashboard;