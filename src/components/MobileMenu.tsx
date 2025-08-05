import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, Home, ShoppingCart, Package, Settings, Key, LogOut, Truck, Webhook, Info, FileText, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface MenuItem {
  icon: any;
  label: string;
  path?: string;
  tab?: string;
  type: 'link' | 'tab' | 'action';
  action?: 'onLogout' | 'onPasswordReset';
}

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout?: () => void;
  onPasswordReset?: () => void;
  setActiveTab?: (tab: string) => void;
  activeTab?: string;
  menuType: 'dashboard' | 'store';
  storeName?: string;
}

// Explicitly typed variants to ensure consistency
const menuVariants: Variants = {
  hidden: {
    x: '100%',
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3
    },
  },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.4
    },
  },
};

const menuItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    transition: {
      duration: 0.15
    }
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 200,
      damping: 20,
      duration: 0.3
    },
  }),
};

// Updated active state animation with more precise CSS variable handling
const activeItemVariants: Variants = {
  initial: { 
    backgroundColor: "rgba(0, 0, 0, 0)", 
    color: "var(--foreground)",
    borderColor: 'rgba(0, 0, 0, 0)',
    boxShadow: "none",
    fontWeight: 400,
    transition: { 
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  active: { 
    backgroundColor: "var(--primary-10)",
    color: "var(--primary)",
    borderColor: "var(--primary-30)",
    boxShadow: "0 2px 8px var(--primary-15)",
    fontWeight: 700,
    transition: { 
      duration: 0.2,
      ease: "easeInOut" 
    }
  }
};

// Dashboard-specific menu items
const dashboardMenuItems: MenuItem[] = [
  {
    icon: Home,
    label: 'المتجر',
    path: '/',
    type: 'link'
  },
  {
    icon: ShoppingCart,
    label: 'الطلبات',
    tab: 'orders',
    type: 'tab'
  },
  {
    icon: Package,
    label: 'المنتجات',
    tab: 'products',
    type: 'tab'
  },
  {
    icon: Truck,
    label: 'الشحن',
    tab: 'shipping',
    type: 'tab'
  },
  {
    icon: Settings,
    label: 'إعدادات المتجر',
    tab: 'settings',
    type: 'tab'
  },
  {
    icon: Webhook,
    label: 'تتبع لبيكسل فيسبوك',
    tab: 'facebook-pixel',
    type: 'tab'
  },
  {
    icon: Settings,
    label: 'Google sheet',
    tab: 'google-sheets',
    type: 'tab'
  },
];

// Store-specific menu items
const storeMenuItems: MenuItem[] = [
  {
    icon: Home,
    label: 'الرئيسية',
    path: '/',
    type: 'link'
  },
  {
    icon: Info,
    label: 'من نحن',
    path: '/about',
    type: 'link'
  },
  {
    icon: FileText,
    label: 'شروط الاستخدام',
    path: '/terms',
    type: 'link'
  },
  {
    icon: Shield,
    label: 'سياسة الخصوصية',
    path: '/privacy',
    type: 'link'
  }
];

// Account menu items for dashboard
const accountItems: MenuItem[] = [
  {
    icon: Key,
    label: 'إعادة تعيين كلمة السر',
    action: 'onPasswordReset',
    type: 'action'
  },
  {
    icon: LogOut,
    label: 'تسجيل الخروج',
    action: 'onLogout',
    type: 'action'
  }
];

const MobileMenu = ({ 
  isOpen, 
  setIsOpen, 
  onLogout, 
  onPasswordReset, 
  setActiveTab, 
  activeTab,
  menuType,
  storeName
}: MobileMenuProps) => {
  const location = useLocation();

  // Define CSS variables for consistent animation
  useEffect(() => {
    // Define custom CSS variables for consistent animations
    const root = document.documentElement;
    root.style.setProperty('--primary-10', 'rgba(var(--primary), 0.1)');
    root.style.setProperty('--primary-15', 'rgba(var(--primary), 0.15)');
    root.style.setProperty('--primary-30', 'rgba(var(--primary), 0.3)');
    
    return () => {
      // Clean up
      root.style.removeProperty('--primary-10');
      root.style.removeProperty('--primary-15');
      root.style.removeProperty('--primary-30');
    };
  }, []);

  // Select which menu items to show based on the menu type
  const menuItems = menuType === 'dashboard' ? dashboardMenuItems : storeMenuItems;
  
  // For dashboard, we need to handle tab switching
  const handleTabClick = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            className="fixed top-0 right-0 h-full w-64 bg-background/95 backdrop-blur-lg shadow-2xl p-6 flex flex-col"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold gradient-text">القائمة</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 -mr-2 hover:bg-muted/50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1">
              <ul className="space-y-3">
                {menuItems.map((item, i) => (
                  <motion.li 
                    key={item.label} 
                    variants={menuItemVariants} 
                    initial="hidden" 
                    animate="visible" 
                    custom={i}
                    className="overflow-hidden"
                  >
                    {item.type === 'link' ? (
                      <motion.div 
                        className="rounded-lg border overflow-hidden"
                        initial="initial"
                        animate={location.pathname === item.path ? "active" : "initial"}
                        variants={activeItemVariants}
                        layout
                      >
                        <Link
                          to={item.path!}
                          className="flex items-center gap-4 p-3 w-full"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="rounded-lg border overflow-hidden"
                        initial="initial"
                        animate={activeTab === item.tab ? "active" : "initial"}
                        variants={activeItemVariants}
                        layout
                      >
                        <button
                          onClick={() => handleTabClick(item.tab!)}
                          className="w-full flex items-center gap-4 p-3"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      </motion.div>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Only show account items for dashboard */}
            {menuType === 'dashboard' && onLogout && onPasswordReset && (
              <div className="mt-auto pt-6 border-t border-border">
                <ul className="space-y-3">
                  {accountItems.map((item, i) => (
                    <motion.li 
                      key={item.label} 
                      variants={menuItemVariants} 
                      initial="hidden" 
                      animate="visible" 
                      custom={i + menuItems.length}
                    >
                      <motion.div className="rounded-lg border overflow-hidden">
                        <button 
                          onClick={item.action === 'onLogout' ? onLogout : onPasswordReset} 
                          className="w-full flex items-center gap-4 p-3"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      </motion.div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Store name at the bottom of the menu */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-center text-sm text-muted-foreground">
                <p className="gradient-text font-medium">{storeName || 'متجر الكتروني'}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;