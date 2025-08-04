// src/components/MainLayout.tsx
// src/components/MainLayout.tsx

import { Phone } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async'; // Import Helmet

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
  useEffect(() => {
    if (settings?.facebook_pixel_id) {
      const pixelId = settings.facebook_pixel_id;

      // Check if the script already exists to prevent re-injection
      if (document.getElementById('facebook-pixel-script')) {
        // If it exists and pixelId has changed, reinitialize or reload
        if ((window as any).fbq) {
          (window as any).fbq('init', pixelId);
          (window as any).fbq('track', 'PageView');
        }
        return;
      }

      // Standard Facebook Pixel Base Code
      void (function (f: any, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        t.id = 'facebook-pixel-script'; // Add an ID to easily check its existence
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );

      (window as any).fbq('init', pixelId);
      (window as any).fbq('track', 'PageView');
    }
  }, [settings?.facebook_pixel_id]);


  return (
    <div className="min-h-screen w-full flex flex-col">
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
      <main className="flex-grow">
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