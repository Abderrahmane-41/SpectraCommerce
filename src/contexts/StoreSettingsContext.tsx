// src/contexts/StoreSettingsContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface StoreSettings {
  store_name: string;
  logo_url: string;
  hero_images: string[];
  social_media: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  phone_number: string;
  facebook_pixel_id: string; // Added
  google_sheet_api_url?: string | null;
  
theme_settings?: {
    backgroundMain: string;
    backgroundDark: string; // Added for dark mode
    primaryGradientStart: string;
    primaryGradientEnd: string;
  };
  saved_themes?: Array<{
    id: string;
    name: string;
    backgroundMain: string;
    backgroundDark: string; // Added for dark mode
    primaryGradientStart: string;
    primaryGradientEnd: string;
  }>;
}

interface StoreSettingsContextType {
  settings: StoreSettings | null;
  loading: boolean;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching store settings:', error);
      } else if (data) {
        // Correctly cast the social_media and ensure facebook_pixel_id is present
        const formattedSettings: StoreSettings = {
          ...data,
          social_media: data.social_media as {
            facebook?: string;
            instagram?: string;
            telegram?: string;
          },
          facebook_pixel_id: data.facebook_pixel_id || '', // Ensure it's a string, default to empty
          theme_settings: (typeof data.theme_settings === 'object' && data.theme_settings !== null) ? 
            {
              backgroundMain: (data.theme_settings as any)?.backgroundMain || '#f7f7f7',
              backgroundDark: (data.theme_settings as any)?.backgroundDark || '#121212',
              primaryGradientStart: (data.theme_settings as any)?.primaryGradientStart || '#8A2BE2',
              primaryGradientEnd: (data.theme_settings as any)?.primaryGradientEnd || '#4682B4'
            } : {
              backgroundMain: '#f7f7f7',
              backgroundDark: '#121212',
              primaryGradientStart: '#8A2BE2',
              primaryGradientEnd: '#4682B4'
            },
            saved_themes: Array.isArray(data.saved_themes) 
              ? data.saved_themes.map(theme => ({
                  id: (theme as any).id || '',
                  name: (theme as any).name || '',
                  backgroundMain: (theme as any).backgroundMain || '#f7f7f7',
                  backgroundDark: (theme as any).backgroundDark || '#121212',
                  primaryGradientStart: (theme as any).primaryGradientStart || '#8A2BE2',
                  primaryGradientEnd: (theme as any).primaryGradientEnd || '#4682B4'
                }))
              : []

        };
        setSettings(formattedSettings);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const { data, error } = await supabase
      .from('store_settings')
      .update(newSettings)
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      throw error;
    }
    // Also apply the type cast here after updating
    if (data) {
        const formattedSettings: StoreSettings = {
            ...data,
            social_media: data.social_media as {
                facebook?: string;
                instagram?: string;
                telegram?: string;
            },
            facebook_pixel_id: data.facebook_pixel_id || '', // Ensure it's a string, 
            // default to empty
            google_sheet_api_url: data.google_sheet_api_url || null,
            theme_settings: (typeof data.theme_settings === 'object' && data.theme_settings !== null) ? 
            {
              backgroundMain: (data.theme_settings as any)?.backgroundMain || '#f7f7f7',
              backgroundDark: (data.theme_settings as any)?.backgroundDark || '#121212',
              primaryGradientStart: (data.theme_settings as any)?.primaryGradientStart || '#8A2BE2',
              primaryGradientEnd: (data.theme_settings as any)?.primaryGradientEnd || '#4682B4'
            } : {
              backgroundMain: '#f7f7f7',
              backgroundDark: '#121212',
              primaryGradientStart: '#8A2BE2',
              primaryGradientEnd: '#4682B4'
            },
            saved_themes: Array.isArray(data.saved_themes) 
              ? data.saved_themes.map(theme => ({
                  id: (theme as any).id || '',
                  name: (theme as any).name || '',
                  backgroundMain: (theme as any).backgroundMain || '#f7f7f7',
                  backgroundDark: (theme as any).backgroundDark || '#121212',
                  primaryGradientStart: (theme as any).primaryGradientStart || '#8A2BE2',
                  primaryGradientEnd: (theme as any).primaryGradientEnd || '#4682B4'
                }))
              : []


        };
        setSettings(formattedSettings);
    }
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (context === undefined) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};