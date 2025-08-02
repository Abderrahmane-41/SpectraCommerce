import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import React from 'react';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';


interface NavbarProps {
    children?: React.ReactNode;
}

const Navbar = ({children}: NavbarProps) => {
   const { settings } = useStoreSettings();

  return <motion.nav initial={{
    y: -100
  }} animate={{
    y: 0
  }} className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="w-full px-5 sm:px-2 py-1 sm:py-3 md:py-4 flex items-center justify-between ">
        
        
        

        <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
         <img src={settings?.logo_url || '/favicon.ico'} alt="Store Logo" className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full" />
          <motion.div className="text-lg sm:text-xl md:text-2xl font-bold gradient-text" whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
           {settings?.store_name || 'اسم المتجر'}
          </motion.div>
          
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4 px-0  mx-0 sm:mr-2">
          
            
            <ThemeToggle />
            {children}
        </div>
        
      </div>
    </motion.nav>;
};
export default Navbar;