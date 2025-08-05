import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings, loading: settingsLoading } = useStoreSettings();
  

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Logo & Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center md:items-start"
          >
            <Link to="/" className="flex items-center">
              <h2 className="text-2xl font-bold gradient-text">{settings?.store_name || 'متجر الكتروني '} </h2>
            </Link>
            <p className="text-muted-foreground mt-2 text-sm text-center md:text-right">
              نقدم تجربة تسوق فريدة ومنتجات عالية الجودة
            </p>
          </motion.div>
          
          {/* Column 2: Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center "
          >
            <h3 className="font-semibold text-lg mb-2 gradient-text">روابط سريعة</h3>
            <div className="flex flex-col space-y-0 items-center ">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                الرئيسية
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                من نحن
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                شروط الاستخدام
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                سياسة الخصوصية
              </Link>
            </div>
          </motion.div>
          
          {/* Column 3: Social Media */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center md:items-end"
          >
            <h3 className="font-semibold text-lg mb-2 gradient-text">تواصل معنا</h3>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted hover:bg-primary/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-border mt-4 pt-4 pb-5 mb-5 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear}  <p className='gradient-text'>{settings?.store_name || 'متجر الكتروني '}</p> جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;