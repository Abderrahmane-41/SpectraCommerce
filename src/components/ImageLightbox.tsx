
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/utils/imageUtils';


interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageLightbox = ({ src, alt, isOpen, onClose }: ImageLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Close Button */}
        <motion.button
          className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-8 h-8" />
        </motion.button>

        {/* Zoom Controls */}
        <div className="absolute top-6 left-6 flex space-x-2 z-10">
          <motion.button
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
            onClick={handleZoomIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>
          <motion.button
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
            onClick={handleZoomOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>
          <motion.button
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors text-sm"
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset
          </motion.button>
        </div>

        {/* Image Container */}
        <motion.div
          className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
            }}
            drag={scale > 1}
            dragConstraints={{
              left: -200,
              right: 200,
              top: -200,
              bottom: 200
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onDrag={(_, info) => {
              setPosition({
                x: position.x + info.delta.x / scale,
                y: position.y + info.delta.y / scale
              });
            }}
            whileDrag={{ cursor: 'grabbing' }}
          />
        </motion.div>

        {/* Instructions */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/60 text-sm text-center">
          <p>انقر بالخارج للإغلاق • استخدم عناصر التحكم في التكبير والتصغير • اسحب للتحريك عند التكبير والتصغير</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;
