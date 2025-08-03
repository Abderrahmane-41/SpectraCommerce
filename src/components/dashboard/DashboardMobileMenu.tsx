// src/components/dashboard/DashboardMobileMenu.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, ShoppingCart, Package, Settings, Key, LogOut, Truck, Webhook } from 'lucide-react'; // Using Webhook instead of Pixel
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardMobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  onPasswordReset: () => void;
  setActiveTab: (tab: string) => void;
  activeTab: string;

}

const menuVariants = {
  hidden: {
    x: '100%',
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  visible: {
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring" as const,
      stiffness: 200,
      damping: 20
    },
  }),
};

const menuItems = [
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
    icon: Webhook, // New menu item using Webhook icon instead
    label: ' تتبع لبيكسل فيسبوك',
    tab: 'facebook-pixel',
    type: 'tab'
  },
  {
    icon: Settings,
    label: 'Google sheet ',
    tab: 'google-sheets',
    type: 'tab'
  },
]

const accountItems = [
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
]

const DashboardMobileMenu = ({ isOpen, setIsOpen, onLogout, onPasswordReset, setActiveTab, activeTab }: DashboardMobileMenuProps) => {
      const location = useLocation();

    const handleTabClick = (tab:string) => {
        setActiveTab(tab);
        setIsOpen(false);
    }
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            className="fixed top-0 right-0 h-full w-46 bg-background/95 backdrop-blur-lg shadow-2xl p-6 flex flex-col"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold gradient-text">Menu</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1">
              <ul className="space-y-2">
                {menuItems.map((item, i) => (
                  <motion.li key={item.label} variants={menuItemVariants} initial="hidden" animate="visible" custom={i}>
                    {item.type === 'link' ? (
                        <Link
                          to={item.path!}
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors",
                            location.pathname === item.path && "bg-primary/10 text-primary font-bold"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ) : (
                        <button
                          onClick={() => handleTabClick(item.tab!)}
                          className={cn(
                            "w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors",
                            activeTab === item.tab && "bg-primary/10 text-primary font-bold"
                          )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* ... (accountItems section remains the same) */}
            <div className="mt-auto">
                 <ul className="space-y-2">
                    {accountItems.map((item, i) => (
                        <motion.li key={item.label} variants={menuItemVariants} initial="hidden" animate="visible" custom={i + menuItems.length}>
                            <button onClick={item.action === 'onLogout' ? onLogout : onPasswordReset} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        </motion.li>
                    ))}
                 </ul>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardMobileMenu;