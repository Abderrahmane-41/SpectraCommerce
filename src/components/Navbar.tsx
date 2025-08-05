import { motion } from 'framer-motion';
import { Link ,useLocation} from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import React, { useState, useEffect} from 'react';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { Menu,  Info, FileText, Shield ,Home} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileMenu from '@/components/MobileMenu';



interface NavbarProps {
  children?: React.ReactNode;
  isDashboard?: boolean;
}

const Navbar = ({ children, isDashboard = false }: NavbarProps) => {
  const { settings } = useStoreSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-effect"
      >
        <div className="w-full px-5 sm:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src={settings?.logo_url || '/favicon.ico'} 
              alt="Store Logo" 
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full" 
            />
            <motion.div 
              className="text-lg sm:text-xl md:text-2xl font-bold gradient-text" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              {settings?.store_name || 'اسم المتجر'}
            </motion.div>
          </Link>

          {/* Desktop Nav Links - Only show on store pages, not dashboard */}
          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-6 mr-6">
              <Link 
                to="/" 
                className={cn(
                  "flex items-center space-x-1 text-sm font-medium transition-colors",
                  location.pathname === "/" 
                    ? "text-foreground font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية </span>
              </Link>
               <Link 
                to="/about" 
                className={cn(
                  "flex items-center space-x-1 text-sm font-medium transition-colors",
                  location.pathname === "/about" 
                    ? "text-foreground font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Info className="w-4 h-4" />
                <span>من نحن</span>
              </Link>
              <Link 
                to="/terms" 
                className={cn(
                  "flex items-center space-x-1 text-sm font-medium transition-colors",
                  location.pathname === "/terms" 
                    ? "text-foreground font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="w-4 h-4" />
                <span>شروط الاستخدام</span>
              </Link>
              <Link 
                to="/privacy" 
                className={cn(
                  "flex items-center space-x-1 text-sm font-medium transition-colors",
                  location.pathname === "/privacy" 
                    ? "text-foreground font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Shield className="w-4 h-4" />
                <span>سياسة الخصوصية</span>
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {children}
            
            {/* Mobile Menu Button - Only show on store pages, not dashboard */}
            {!isDashboard && (
              <motion.button
                className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                whileTap={{ scale: 0.9 }}
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      
      {/* Use the unified MobileMenu component */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        menuType="store"
        storeName={settings?.store_name}
      />
    </>
  );
};

export default Navbar;