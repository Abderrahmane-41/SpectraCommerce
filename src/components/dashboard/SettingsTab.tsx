import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Facebook, Instagram, Send ,Palette} from 'lucide-react';
import { Button } from '../ui/button';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import StoreSettingsModal from './StoreSettingsModal';
import ThemeCustomizationModal from './ThemeCustomizationModal';


const SettingsTab = () => {
  const { settings, loading } = useStoreSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Section with Gradient Border */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative p-[3px]"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
        <div className="relative z-10 bg-card dark:bg-card rounded-xl border-0 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">
              إعدادات المتجر
            </h2>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="btn-gradient"
            >
              <SettingsIcon className="w-4 h-4 ml-2" />
              تعديل الإعدادات
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Theme Settings Section - NEW */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative p-[3px]"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
                  <div className="relative z-10 bg-card dark:bg-card rounded-xl border-0 p-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl sm:text-3xl font-bold gradient-text">
                        ألوان المتجر
                      </h2>
                      <Button 
                        onClick={() => setIsThemeModalOpen(true)}
                        className="btn-gradient"
                      >
                        <Palette className="w-4 h-4 ml-2" />
                        تخصيص الألوان
                      </Button>
                    </div>
                    
                    {/* Preview of current theme */}
                    <div className="mt-4 p-4 rounded-lg border border-border">
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border border-border" style={{
                            backgroundColor: settings?.theme_settings?.backgroundMain || '#f7f7f7'
                          }}></div>
                          <span className="text-sm">الخلفية</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-6 rounded-md" style={{
                            background: `linear-gradient(135deg, ${settings?.theme_settings?.primaryGradientStart || '#8A2BE2'}, ${settings?.theme_settings?.primaryGradientEnd || '#4682B4'})`
                          }}></div>
                          <span className="text-sm">التدرج</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

      {/* Main Settings Display Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative p-[3px]"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
        <div className="relative z-10 bg-card dark:bg-card rounded-xl border-0 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Name */}
            <div className="glass-effect p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 gradient-text">اسم المتجر</h3>
              <p className="text-muted-foreground">{settings?.store_name || 'غير محدد'}</p>
            </div>

            {/* Phone Number */}
            <div className="glass-effect p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 gradient-text">رقم الهاتف</h3>
              <p className="text-muted-foreground">{settings?.phone_number || 'غير محدد'}</p>
            </div>

            {/* Store Logo */}
            <div className="glass-effect p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 gradient-text">شعار المتجر</h3>
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  className="h-16 w-16 rounded-lg bg-muted p-1 border border-border" 
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">لا يوجد شعار</span>
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="glass-effect p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 gradient-text">حسابات التواصل</h3>
              <div className="flex flex-col space-y-2">
                {settings?.social_media?.facebook && (
                  <a 
                    href={settings.social_media.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:text-blue-600 hover:underline flex items-center space-x-2 transition-colors"
                  >
                    <Facebook className="w-4 h-4" /> 
                    <span>Facebook</span>
                  </a>
                )}
                {settings?.social_media?.instagram && (
                  <a 
                    href={settings.social_media.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-pink-500 hover:text-pink-600 hover:underline flex items-center space-x-2 transition-colors"
                  >
                    <Instagram className="w-4 h-4" /> 
                    <span>Instagram</span>
                  </a>
                )}
                {settings?.social_media?.telegram && (
                  <a 
                    href={settings.social_media.telegram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sky-500 hover:text-sky-600 hover:underline flex items-center space-x-2 transition-colors"
                  >
                    <Send className="w-4 h-4" /> 
                    <span>Telegram</span>
                  </a>
                )}
                {(!settings?.social_media?.facebook && !settings?.social_media?.instagram && !settings?.social_media?.telegram) && (
                  <p className="text-muted-foreground">لا توجد حسابات تواصل اجتماعي محددة.</p>
                )}
              </div>
            </div>

            

            {/* Hero Images */}
            <div className="md:col-span-2 glass-effect p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 gradient-text">صور الواجهة</h3>
              {settings?.hero_images && settings.hero_images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {settings.hero_images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Hero ${index + 1}`} 
                        className="h-24 w-24 object-cover rounded-lg border border-border hover:shadow-lg transition-shadow" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد صور واجهة محددة.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <StoreSettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <ThemeCustomizationModal 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)} 
      />
    </div>
  );
};

export default SettingsTab;