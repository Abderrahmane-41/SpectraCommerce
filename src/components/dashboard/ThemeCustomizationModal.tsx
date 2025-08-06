import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Plus, Trash2, Check, Pencil } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_THEME = {
  backgroundMain: '#f7f7f7',
  backgroundDark: '#121212',
  primaryGradientStart: '#8A2BE2',
  primaryGradientEnd: '#4682B4',
};

// Update the PREDEFINED_THEMES object
const PREDEFINED_THEMES = {
  default: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#a2d81aff',
    primaryGradientEnd: '#36d1dcff',
  },
  ocean: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#1A6ED8',
    primaryGradientEnd: '#36D1DC',
  },
  forest: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#2E7D32',
    primaryGradientEnd: '#81C784',
  },
  charcoal: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#424242',
    primaryGradientEnd: '#9E9E9E',
  },
  // New themes
  sunset: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#FF8C00',
    primaryGradientEnd: '#FF5252',
  },
  lavender: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#7B1FA2',
    primaryGradientEnd: '#BA68C8',
  },
  emerald: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#004D40',
    primaryGradientEnd: '#26A69A',
  },
  ruby: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#B71C1C',
    primaryGradientEnd: '#EF5350',
  },
  golden: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#F57F17',
    primaryGradientEnd: '#FFD54F',
  },
  royal: {
    backgroundMain: '#f7f7f7',
    backgroundDark: '#121212',
    primaryGradientStart: '#1A237E',
    primaryGradientEnd: '#5C6BC0',
  },
};

interface ThemeCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizationModal = ({ isOpen, onClose }: ThemeCustomizationModalProps) => {
  const { settings, updateSettings } = useStoreSettings();
  const [theme, setTheme] = useState(settings?.theme_settings || DEFAULT_THEME);
  const [isSaving, setIsSaving] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<'background' | 'gradientStart' | 'gradientEnd' | 'backgroundDark' | null>(null);

  // Saved Themes State
  const [savedThemes, setSavedThemes] = useState<Array<{
    id: string;
    name: string;
    backgroundMain: string;
    backgroundDark: string;
    primaryGradientStart: string;
    primaryGradientEnd: string;
  }>>(settings?.saved_themes || []);
  
  const [newThemeName, setNewThemeName] = useState('');
  const [isNamingTheme, setIsNamingTheme] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [editingThemeName, setEditingThemeName] = useState('');
  
  // Create refs for the color pickers
  const backgroundPickerRef = useRef<HTMLDivElement>(null);
  const gradientStartPickerRef = useRef<HTMLDivElement>(null);
  const gradientEndPickerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const backgroundDarkPickerRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    if (settings?.saved_themes) {
      setSavedThemes(settings.saved_themes);
    }
  }, [settings?.saved_themes]);
  
  useEffect(() => {
    if (isNamingTheme && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isNamingTheme]);

// Enhance the applyTheme function
const applyTheme = (newTheme: typeof DEFAULT_THEME) => {
  setTheme(newTheme);
  
  // Apply CSS variables to document root
  const root = document.documentElement;
  root.style.setProperty('--background-main', newTheme.backgroundMain);
  root.style.setProperty('--background-dark', newTheme.backgroundDark);
  root.style.setProperty('--primary-gradient-start', newTheme.primaryGradientStart);
  root.style.setProperty('--primary-gradient-end', newTheme.primaryGradientEnd);
  
  // Create or update the style element with the new colors for immediate preview
  let styleEl = document.getElementById('theme-preview-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'theme-preview-style';
    document.head.appendChild(styleEl);
  }
  
  // More specific selectors and !important to ensure they take effect immediately
  styleEl.textContent = `
    /* Button gradient updates */
    .btn-gradient,
    .modal-content .btn-gradient,
    .preview-section .btn-gradient {
      background: linear-gradient(135deg, ${newTheme.primaryGradientStart}, ${newTheme.primaryGradientEnd}) !important;
      color: white !important;
    }
    
    /* Text gradient updates */
    .gradient-text,
    .modal-content .gradient-text,
    .preview-section .gradient-text {
      background: linear-gradient(135deg, ${newTheme.primaryGradientStart}, ${newTheme.primaryGradientEnd}) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    
    /* Background gradient updates */
    .bg-gradient-primary,
    .dark .bg-gradient-primary-dark,
    .modal-content .bg-gradient-primary,
    .preview-section .bg-gradient-primary {
      background: linear-gradient(135deg, ${newTheme.primaryGradientStart}, ${newTheme.primaryGradientEnd}) !important;
    }
    
    /* Direct updates to preview elements */
    #preview-gradient-btn {
      background: linear-gradient(135deg, ${newTheme.primaryGradientStart}, ${newTheme.primaryGradientEnd}) !important;
    }
    
    #preview-gradient-text {
      background: linear-gradient(135deg, ${newTheme.primaryGradientStart}, ${newTheme.primaryGradientEnd}) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    
    #preview-gradient-border {
      background: linear-gradient(135deg, ${newTheme.primaryGradientStart}, ${newTheme.primaryGradientEnd}) !important;
    }
  `;
  
  // Force a small layout recalculation to ensure styles are applied
  const forceUpdate = document.body.offsetHeight;
};

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
  if (activeColorPicker === 'background' && 
      backgroundPickerRef.current && 
      !backgroundPickerRef.current.contains(event.target as Node)) {
    setActiveColorPicker(null);
  } else if (activeColorPicker === 'backgroundDark' && 
      backgroundDarkPickerRef.current && 
      !backgroundDarkPickerRef.current.contains(event.target as Node)) {
    setActiveColorPicker(null);
  } else if (activeColorPicker === 'gradientStart' && 
            gradientStartPickerRef.current && 
            !gradientStartPickerRef.current.contains(event.target as Node)) {
    setActiveColorPicker(null);
  } else if (activeColorPicker === 'gradientEnd' && 
            gradientEndPickerRef.current && 
            !gradientEndPickerRef.current.contains(event.target as Node)) {
    setActiveColorPicker(null);
  }
};

    if (activeColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeColorPicker]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        theme_settings: theme,
        saved_themes: savedThemes
      });
      toast.success('تم تحديث لون المتجر بنجاح!');
      onClose();
    } catch (error) {
      toast.error('فشل تحديث لون المتجر.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    applyTheme(DEFAULT_THEME);
  };

  const handleThemeChange = (themeKey: keyof typeof PREDEFINED_THEMES) => {
    applyTheme(PREDEFINED_THEMES[themeKey]);
  };
  
  // Modify the handleSaveTheme function
const handleSaveTheme = async () => {
  if (newThemeName.trim() === '') {
    toast.error('الرجاء إدخال اسم للسمة');
    return;
  }
  
  const newTheme = {
    id: uuidv4(),
    name: newThemeName,
    backgroundMain: theme.backgroundMain,
    backgroundDark: theme.backgroundDark,
    primaryGradientStart: theme.primaryGradientStart,
    primaryGradientEnd: theme.primaryGradientEnd
  };
  
  const newSavedThemes = [...savedThemes, newTheme];
  
  setSavedThemes(newSavedThemes);
  setNewThemeName('');
  setIsNamingTheme(false);
  
  setIsSaving(true);
  try {
    // Update both saved_themes and theme_settings in a single operation
    await updateSettings({ 
      saved_themes: newSavedThemes,
      theme_settings: {
        backgroundMain: theme.backgroundMain,
        backgroundDark: theme.backgroundDark,
        primaryGradientStart: theme.primaryGradientStart,
        primaryGradientEnd: theme.primaryGradientEnd
      }
    });
    toast.success('تم حفظ السمة وتطبيقها بنجاح!');
  } catch (error) {
    toast.error('فشل حفظ السمة.');
    setSavedThemes(savedThemes); // Revert if failed
  } finally {
    setIsSaving(false);
  }
};
  
  const handleApplySavedTheme = (themeIndex: number) => {
    const savedTheme = savedThemes[themeIndex];
    applyTheme({
      backgroundMain: savedTheme.backgroundMain,
      backgroundDark: savedTheme.backgroundDark, // Keep dark background same as current
      primaryGradientStart: savedTheme.primaryGradientStart,
      primaryGradientEnd: savedTheme.primaryGradientEnd
    });
  };
  
  const handleDeleteSavedTheme = async (id: string) => {
    const newSavedThemes = savedThemes.filter(theme => theme.id !== id);
    setSavedThemes(newSavedThemes);
    
    try {
      await updateSettings({ saved_themes: newSavedThemes });
      toast.success('تم حذف السمة بنجاح!');
    } catch (error) {
      toast.error('فشل حذف السمة.');
      setSavedThemes(savedThemes); // Revert if failed
    }
  };
  
  const startEditingThemeName = (id: string, name: string) => {
    setEditingThemeId(id);
    setEditingThemeName(name);
  };
  
  const handleRenameTheme = async () => {
    if (!editingThemeId || editingThemeName.trim() === '') {
      return;
    }
    
    const newSavedThemes = savedThemes.map(theme => 
      theme.id === editingThemeId 
        ? { ...theme, name: editingThemeName } 
        : theme
    );
    
    setSavedThemes(newSavedThemes);
    setEditingThemeId(null);
    setEditingThemeName('');
    
    try {
      await updateSettings({ saved_themes: newSavedThemes });
      toast.success('تم تعديل اسم السمة بنجاح!');
    } catch (error) {
      toast.error('فشل تعديل اسم السمة.');
      setSavedThemes(savedThemes); // Revert if failed
    }
  };

  // Add this function below handleRenameTheme
const handleApplyToWebsite = async (themeIndex: number) => {
  const savedTheme = savedThemes[themeIndex];
  
  // Apply theme to preview
  applyTheme({
    backgroundMain: savedTheme.backgroundMain,
    backgroundDark: savedTheme.backgroundDark,
    primaryGradientStart: savedTheme.primaryGradientStart,
    primaryGradientEnd: savedTheme.primaryGradientEnd
  });
  
  // Save to database immediately
  setIsSaving(true);
  try {
    await updateSettings({
      theme_settings: {
        backgroundMain: savedTheme.backgroundMain,
        backgroundDark: savedTheme.backgroundDark,
        primaryGradientStart: savedTheme.primaryGradientStart,
        primaryGradientEnd: savedTheme.primaryGradientEnd
      }
    });
    toast.success('تم تطبيق السمة على الموقع بنجاح!');
  } catch (error) {
    toast.error('فشل تطبيق السمة على الموقع.');
  } finally {
    setIsSaving(false);
  }
};

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-background rounded-2xl p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">تخصيص ألوان المتجر</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Predefined Themes */}
            <div>
            <h4 className="text-lg font-semibold mb-3">السمات الجاهزة</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              <Button
                onClick={() => handleThemeChange('default')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.default.primaryGradientStart}, ${PREDEFINED_THEMES.default.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                أخضر حشيش
              </Button>
              <Button
                onClick={() => handleThemeChange('ocean')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.ocean.primaryGradientStart}, ${PREDEFINED_THEMES.ocean.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                أزرق محيطي
              </Button>
              <Button
                onClick={() => handleThemeChange('forest')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.forest.primaryGradientStart}, ${PREDEFINED_THEMES.forest.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                أخضر غابة
              </Button>
              <Button
                onClick={() => handleThemeChange('charcoal')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.charcoal.primaryGradientStart}, ${PREDEFINED_THEMES.charcoal.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                رمادي فحمي
              </Button>
              <Button
                onClick={() => handleThemeChange('sunset')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.sunset.primaryGradientStart}, ${PREDEFINED_THEMES.sunset.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                غروب الشمس
              </Button>
              <Button
                onClick={() => handleThemeChange('lavender')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.lavender.primaryGradientStart}, ${PREDEFINED_THEMES.lavender.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                خزامى
              </Button>
              <Button
                onClick={() => handleThemeChange('emerald')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.emerald.primaryGradientStart}, ${PREDEFINED_THEMES.emerald.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                زمرد
              </Button>
              <Button
                onClick={() => handleThemeChange('ruby')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.ruby.primaryGradientStart}, ${PREDEFINED_THEMES.ruby.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                ياقوت
              </Button>
              <Button
                onClick={() => handleThemeChange('golden')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.golden.primaryGradientStart}, ${PREDEFINED_THEMES.golden.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                ذهبي
              </Button>
              <Button
                onClick={() => handleThemeChange('royal')}
                className="w-full"
                variant="outline"
                style={{
                  background: `linear-gradient(135deg, ${PREDEFINED_THEMES.royal.primaryGradientStart}, ${PREDEFINED_THEMES.royal.primaryGradientEnd})`,
                  color: 'white'
                }}
              >
                ملكي
              </Button>
            </div>
          </div>

{/* Gradient Colors */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* Gradient Start Color */}
  <div>
    <h4 className="text-base font-semibold mb-2">لون التدرج - البداية</h4>
    <div 
      className="h-12 rounded-lg border border-border cursor-pointer mb-2"
      style={{ backgroundColor: theme.primaryGradientStart }}
      onClick={() => setActiveColorPicker('gradientStart')}
    ></div>
    {activeColorPicker === 'gradientStart' && (
      <div className="relative z-10" ref={gradientStartPickerRef}>
        <div className="absolute top-0 left-0 right-0">
          <HexColorPicker
            color={theme.primaryGradientStart}
            onChange={(color) => applyTheme({ ...theme, primaryGradientStart: color })}
          />
        </div>
      </div>
    )}
    <input
      type="text"
      value={theme.primaryGradientStart}
      onChange={(e) => applyTheme({ ...theme, primaryGradientStart: e.target.value })}
      className="w-full px-3 py-2 rounded-lg border border-border bg-background mt-2"
      placeholder="#8A2BE2"
    />
    <div className="grid grid-cols-5 gap-1 mt-2">
      {['#8A2BE2', '#4A90E2', '#2E7D32', '#D32F2F', '#424242'].map((color) => (
        <div
          key={color}
          className="h-6 rounded-md cursor-pointer border"
          style={{ backgroundColor: color }}
          onClick={() => applyTheme({ ...theme, primaryGradientStart: color })}
        ></div>
      ))}
    </div>
  </div>

  {/* Gradient End Color */}
  <div>
    <h4 className="text-base font-semibold mb-2">لون التدرج - النهاية</h4>
    <div 
      className="h-12 rounded-lg border border-border cursor-pointer mb-2"
      style={{ backgroundColor: theme.primaryGradientEnd }}
      onClick={() => setActiveColorPicker('gradientEnd')}
    ></div>
    {activeColorPicker === 'gradientEnd' && (
      <div className="relative z-10" ref={gradientEndPickerRef}>
        <div className="absolute top-0 left-0 right-0">
          <HexColorPicker
            color={theme.primaryGradientEnd}
            onChange={(color) => applyTheme({ ...theme, primaryGradientEnd: color })}
          />
        </div>
      </div>
    )}
    <input
      type="text"
      value={theme.primaryGradientEnd}
      onChange={(e) => applyTheme({ ...theme, primaryGradientEnd: e.target.value })}
      className="w-full px-3 py-2 rounded-lg border border-border bg-background mt-2"
      placeholder="#4682B4"
    />
    <div className="grid grid-cols-5 gap-1 mt-2">
      {['#4682B4', '#36D1DC', '#81C784', '#F57C00', '#9E9E9E'].map((color) => (
        <div
          key={color}
          className="h-6 rounded-md cursor-pointer border"
          style={{ backgroundColor: color }}
          onClick={() => applyTheme({ ...theme, primaryGradientEnd: color })}
        ></div>
      ))}
    </div>
  </div>
</div>
          

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* Light Mode Background */}
  <div>
    <h4 className="text-base font-semibold mb-2"> لون الخلفية الجانبية (الوضع الفاتح)</h4>
    <div 
      className="h-12 rounded-lg border border-border cursor-pointer mb-2"
      style={{ backgroundColor: theme.backgroundMain }}
      onClick={() => setActiveColorPicker('background')}
    ></div>
    {activeColorPicker === 'background' && (
      <div className="relative z-10" ref={backgroundPickerRef}>
        <div className="absolute top-0 left-0 right-0">
          <HexColorPicker
            color={theme.backgroundMain}
            onChange={(color) => applyTheme({ ...theme, backgroundMain: color })}
          />
        </div>
      </div>
    )}
    <input
      type="text"
      value={theme.backgroundMain}
      onChange={(e) => applyTheme({ ...theme, backgroundMain: e.target.value })}
      className="w-full px-3 py-2 rounded-lg border border-border bg-background mt-2"
      placeholder="#FFFFFF"
    />
    <div className="grid grid-cols-5 gap-1 mt-2">
      {['#FFFFFF', '#F5F5F5', '#FAFAFA', '#F0F0F0', '#E8E8E8'].map((color) => (
        <div
          key={color}
          className="h-6 rounded-md cursor-pointer border"
          style={{ backgroundColor: color }}
          onClick={() => applyTheme({ ...theme, backgroundMain: color })}
        ></div>
      ))}
    </div>
  </div>

  {/* Dark Mode Background */}
  <div>
    <h4 className="text-base font-semibold mb-2">لون الخلفية الجانبية (الوضع الداكن)</h4>
    <div 
      className="h-12 rounded-lg border border-border cursor-pointer mb-2"
      style={{ backgroundColor: theme.backgroundDark }}
      onClick={() => setActiveColorPicker('backgroundDark')}
    ></div>
    {activeColorPicker === 'backgroundDark' && (
      <div className="relative z-10" ref={backgroundDarkPickerRef}>
        <div className="absolute top-0 left-0 right-0">
          <HexColorPicker
            color={theme.backgroundDark}
            onChange={(color) => applyTheme({ ...theme, backgroundDark: color })}
          />
        </div>
      </div>
    )}
    <input
      type="text"
      value={theme.backgroundDark}
      onChange={(e) => applyTheme({ ...theme, backgroundDark: e.target.value })}
      className="w-full px-3 py-2 rounded-lg border border-border bg-background mt-2"
      placeholder="#121212"
    />
    <div className="grid grid-cols-5 gap-1 mt-2">
      {['#121212', '#1E1E1E', '#232323', '#292929', '#333333'].map((color) => (
        <div
          key={color}
          className="h-6 rounded-md cursor-pointer border"
          style={{ backgroundColor: color }}
          onClick={() => applyTheme({ ...theme, backgroundDark: color })}
        ></div>
      ))}
    </div>
  </div>
</div>


<div>

  <h4 className="text-lg font-semibold mb-3">معاينة مباشرة</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Light Mode Preview */}
    <div>
      <h5 className="text-sm font-medium mb-2">الوضع الفاتح</h5>
        <div className="p-6 rounded-lg border border-border preview-section" style={{ backgroundColor: theme.backgroundMain }}>
          <div className="flex flex-col gap-4 items-center">
            <button id="preview-gradient-btn" className="btn-gradient py-2 px-6 rounded-lg">
              زر بتدرج
            </button>
            <div id="preview-gradient-text" className="gradient-text text-xl font-bold">
              نص بتدرج
            </div>
            <div className="p-4 rounded-lg relative">
              <div id="preview-gradient-border" className="absolute inset-0 rounded-lg bg-gradient-primary"></div>
              <div className="relative bg-white p-4 rounded-lg z-10 m-[2px]">
                <p className='text-black'>محتوى البطاقة</p>
              </div>
            </div>
          </div>
        </div>
    </div>
    
    {/* Dark Mode Preview */}
    <div>
      <h5 className="text-sm font-medium mb-2">الوضع الداكن</h5>
      <div 
        className="p-6 rounded-lg border border-border"
        style={{ backgroundColor: theme.backgroundDark }}
      >
        <div className="flex flex-col gap-4 items-center">
          <button id="preview-gradient-btn" className="btn-gradient py-2 px-6 rounded-lg">
            زر بتدرج
          </button>
          <div className="gradient-text text-xl font-bold">
            نص بتدرج
          </div>
          <div className="p-4 rounded-lg relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-primary"></div>
            <div className="relative bg-gray-800 p-4 rounded-lg z-10 m-[2px]">
              <p className="text-white">محتوى البطاقة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Saved Themes */}
          <div>
            <h4 className="text-lg font-semibold mb-3">السمات المحفوظة</h4>
            <div className="mb-2">
              {savedThemes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {savedThemes.map((savedTheme, index) => (
                    <div 
                      key={savedTheme.id}
                      className="relative p-3 border border-border rounded-lg group"
                    >
                      {/* Theme Preview */}
                      <div 
                        className="cursor-pointer"
                        onClick={() => handleApplySavedTheme(index)}
                      >
                        {/* Theme Name */}
                        {editingThemeId === savedTheme.id ? (
                          <div className="flex mb-2 justify-between">
                            <Input
                              value={editingThemeName}
                              onChange={(e) => setEditingThemeName(e.target.value)}
                              className="text-sm h-7"
                              autoFocus
                            />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameTheme();
                              }}
                              className="ml-0 p-2 rounded hover:bg-muted"
                            >
                              <Check className="w-5 h-5 text-green-500" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center mb-2">
                            
                            <div className="flex flex-col w-full">
                              <span className="text-sm font-medium truncate w-full mb-1">{savedTheme.name}</span>
                              <div className="flex justify-between space-x-1 rtl:space-x-reverse">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyToWebsite(index);
                                  }}
                                  className="p-1 rounded hover:bg-muted text-blue-500" 
                                  title="تطبيق على الموقع"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14"></path>
                                    <path d="M12 5l7 7-7 7"></path>
                                  </svg>
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingThemeName(savedTheme.id, savedTheme.name);
                                  }}
                                  className="p-1 rounded hover:bg-muted"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSavedTheme(savedTheme.id);
                                  }}
                                  className="p-1 rounded hover:bg-muted text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Theme Preview Thumbnail */}
                        <div 
                          className="p-2 rounded-md"
                          style={{ backgroundColor: savedTheme.backgroundMain }}
                        >
                          <div className="flex flex-col gap-1 items-center">
                            {/* Mini button */}
                            <div 
                              className="h-5 w-10 rounded text-white flex items-center justify-center text-[8px]"
                              style={{
                                background: `linear-gradient(135deg, ${savedTheme.primaryGradientStart}, ${savedTheme.primaryGradientEnd})`
                              }}
                            >
                              زر
                            </div>
                            {/* Mini text */}
                            <div 
                              className="text-[8px] font-bold"
                              style={{
                                background: `linear-gradient(135deg, ${savedTheme.primaryGradientStart}, ${savedTheme.primaryGradientEnd})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                              }}
                            >
                              نص بتدرج
                            </div>
                            {/* Mini card */}
                            <div className="w-full h-3 rounded-sm" style={{
                              background: `linear-gradient(135deg, ${savedTheme.primaryGradientStart}, ${savedTheme.primaryGradientEnd})`
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm mb-3">لا توجد سمات محفوظة</p>
              )}
              
              {isNamingTheme ? (
                <div className="flex flex-col space-y-2">
                  <Input
                    ref={nameInputRef}
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    placeholder="أدخل اسم السمة"
                    className="text-sm"
                  />
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button 
                      size="sm" 
                      onClick={handleSaveTheme}
                      disabled={newThemeName.trim() === ''}
                      className="mr-2"
                    >
                      حفظ
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsNamingTheme(false);
                        setNewThemeName('');
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => setIsNamingTheme(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  حفظ السمة الحالية
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button onClick={handleReset} variant="outline" className="flex items-center p-2">
              <RotateCcw className="w-3.5 h-3.5 mr-0" />
              إعادة تعيين
            </Button>
            <div className="flex space-x-0.5 rtl:space-x-reverse justify-between">
              <Button onClick={onClose} variant="outline" disabled={isSaving} className='p-2'>
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="btn-gradient p-4">
                {isSaving ? '...جارٍ الحفظ' : 'حفظ التغييرات'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThemeCustomizationModal;