import { useEffect } from 'react';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';

const ThemeInjector = () => {
  const { settings } = useStoreSettings();

  useEffect(() => {
    if (!settings?.theme_settings) return;
    
    const root = document.documentElement;
    const { backgroundMain, backgroundDark, primaryGradientStart, primaryGradientEnd } = settings.theme_settings;
    
    // Set CSS variables
    if (backgroundMain) {
      root.style.setProperty('--background-main', backgroundMain);
    }
    if (backgroundDark) {
      root.style.setProperty('--background-dark', backgroundDark);
    }
    if (primaryGradientStart) {
      root.style.setProperty('--primary-gradient-start', primaryGradientStart);
    }
    if (primaryGradientEnd) {
      root.style.setProperty('--primary-gradient-end', primaryGradientEnd);
    }
    
    // Update Tailwind's gradient styles
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'dynamic-theme-styles');
    styleEl.textContent = `


      body {
        background-color: ${backgroundMain};
      }
      
      .dark body {
        background-color: ${backgroundDark};
      }
      
      .bg-gradient-primary, 
      .dark .bg-gradient-primary-dark {
        background: linear-gradient(135deg, ${primaryGradientStart || '#8A2BE2'}, ${primaryGradientEnd || '#4682B4'});
      }
      
      .gradient-text {
        background: linear-gradient(135deg, ${primaryGradientStart || '#8A2BE2'}, ${primaryGradientEnd || '#4682B4'});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .btn-gradient {
        background: linear-gradient(135deg, ${primaryGradientStart || '#8A2BE2'}, ${primaryGradientEnd || '#4682B4'}) !important;
      }
      
      .theme-toggle-bg {
        background: linear-gradient(135deg, ${primaryGradientStart || '#8A2BE2'}, ${primaryGradientEnd || '#4682B4'});
      }
      
      .gradient-icon-bg {
        background: linear-gradient(135deg, ${primaryGradientStart || '#8A2BE2'}, ${primaryGradientEnd || '#4682B4'});
      }
    `;
    
    // Replace existing style tag or add new one
    const existingStyle = document.getElementById('dynamic-theme-styles');
    if (existingStyle) {
      existingStyle.replaceWith(styleEl);
    } else {
      document.head.appendChild(styleEl);
    }
    
    return () => {
      // Cleanup on unmount
      document.getElementById('dynamic-theme-styles')?.remove();
    };
  }, [settings?.theme_settings]);

  return null; // This component doesn't render anything
};

export default ThemeInjector;