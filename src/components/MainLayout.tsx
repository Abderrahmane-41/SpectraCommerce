// src/components/MainLayout.tsx
// src/components/MainLayout.tsx

import { Phone } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet

// Define custom window interface for Facebook Pixel
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { settings } = useStoreSettings();

  useEffect(() => {
    if (settings?.store_name) {
      document.title = settings.store_name;
    }
  }, [settings]);

  // Inject Facebook Pixel base code
  // Update the Facebook Pixel implementation section

  // Inject Facebook Pixel base code
  useEffect(() => {
    if (!settings?.facebook_pixel_id || settings.facebook_pixel_id.trim() === '') {
      return; // Exit early if pixel ID is not set
    }
    
    const pixelId = settings.facebook_pixel_id.trim();
    
    try {
      // Check if fbq is already defined
      if (typeof window !== 'undefined' && window.fbq) {
        // If fbq exists, just track the page view without reinitializing
        window.fbq('track', 'PageView');
        return;
      }

      // Initialize Facebook Pixel only if it doesn't exist yet
      window.fbq = function(...args) {
        return window.fbq.callMethod ? window.fbq.callMethod(...args) : window.fbq.queue.push(args);
      };
      
      // Initialize queue if it doesn't exist
      if (!window._fbq) window._fbq = window.fbq;
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];
      
      // Create and inject the script element
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.id = 'facebook-pixel-script';
      document.head.appendChild(script);
      
      // Initialize with pixel ID and track page view
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    } catch (error) {
      // Silently handle any errors to prevent breaking navigation
      console.error('Facebook Pixel error:', error);
    }
    
    // Clean up function
    return () => {
      // Nothing to clean up for FB Pixel
    };
  }, [settings?.facebook_pixel_id]);


  return (
    <div className="min-h-screen w-full flex flex-col ">
        <Helmet>
        {/* Dynamic Favicon based on store logo */}
              <title>{settings?.store_name || 'متجر الكتروني'}</title>
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
              
              {/* Meta tags for SEO */}
              <meta property="og:title" content={settings?.store_name || 'متجر الكتروني'} />
              <meta property="og:image" content={settings?.logo_url || '/favicon-32x32.png'} />
              <meta name="twitter:image" content={settings?.logo_url || '/favicon-32x32.png'} />
      </Helmet>
      <Navbar />
      <main className="flex-grow ">
        {children}
      </main>
      <Footer />

      {/* Sticky WhatsApp Button */}
      <a
       href={`tel:${settings?.phone_number || ''}`}
        className="fixed bottom-3 right-3 z-50 p-3 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        aria-label="Contact us via phone"
      >
        <Phone className="w-6 h-6 text-white" />
      </a>
    </div>
  );
};

export default MainLayout;