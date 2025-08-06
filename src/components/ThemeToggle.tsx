import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const { settings } = useStoreSettings();
  
  // Get background colors from settings or use defaults
  const lightBackground = settings?.theme_settings?.backgroundMain || '#f7f7f7';
  const darkBackground = settings?.theme_settings?.backgroundDark || '#121212';
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      
      // Apply dark background color
      document.documentElement.style.setProperty('--background-main', darkBackground);
    } else {
      // Apply light background color
      document.documentElement.style.setProperty('--background-main', lightBackground);
    }
  }, [darkBackground, lightBackground]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      
      // Apply dark background color
      document.documentElement.style.setProperty('--background-main', darkBackground);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      
      // Apply light background color
      document.documentElement.style.setProperty('--background-main', lightBackground);
    }
  };

  // Set the thumb (circle) color based on current theme mode
  const thumbStyle = {
    backgroundColor: isDark ? darkBackground : lightBackground,
    border: isDark ? '1px solid #ffffff33' : '1px solid #00000022'
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-0 h-0 sm:w-12 sm:h-7 md:w-14 md:h-8 rounded-full bg-gradient-primary dark:bg-gradient-primary-dark p-0.5 sm:p-1 shadow-lg my-0.05 flex items-center"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full shadow-md flex items-center justify-center"
        style={thumbStyle}
        animate={{ x: isDark ? (window.innerWidth < 640 ? 8 : window.innerWidth < 768 ? 20 : 24) : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
          ) : (
            <Sun className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-orange-500" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;