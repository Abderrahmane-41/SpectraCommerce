// src/components/GenericCarousel.tsx

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Make sure cn is imported from your utils
import Autoplay from 'embla-carousel-autoplay'; // Import Autoplay plugin


// Define the shape of your props
interface GenericCarouselProps<T> {
  items: T[];
  renderSlide: (item: T, index?: number) => React.ReactNode;
  // This new optional prop will control the slide width
  slideClassName?: string; 
  // Optional prop to enable/disable autoplay and customize delay
  autoplay?: boolean;
  autoplayDelay?: number;
}

const GenericCarousel = <T extends { id: string | number }>({ 
  items, 
  renderSlide, 
  // Set a default value for the new prop
  slideClassName = "w-3/4 sm:w-1/2 md:w-2/5 lg:w-1/3" ,
  autoplay = true, // Default to true for hero images
  autoplayDelay = 7000 // Default to 5 seconds
}: GenericCarouselProps<T>) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' },
    // Add Autoplay plugin if autoplay is enabled
    autoplay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })] : []);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [slideStyles, setSlideStyles] = useState<(React.CSSProperties | undefined)[]>([]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const styles = emblaApi.slideNodes().map((_slideNode, index) => {
      if (!emblaApi.slidesInView().includes(index)) return { opacity: 0.5, transform: 'scale(0.85)' };
      return { opacity: 1, transform: 'scale(1)' };
    });
    setSlideStyles(styles);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    onSelect();
    emblaApi.on('scroll', onScroll);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onScroll, onSelect]);

  return (
    <div className="w-full relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              // The cn utility now correctly combines the default classes with the prop
              className={cn(
                "flex-shrink-0 min-w-0 pl-4",
                slideClassName
              )}
              style={slideStyles[index]}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            >
            {typeof renderSlide === 'function' ? renderSlide(item, index) : null}

            </motion.div>
          ))}
        </div>
      </div>

      
      {!window.location.pathname.includes('/product') && (
        <div className="w-48 h-1 bg-muted rounded-full mx-auto mt-8 sm:mt-12">
          <div
            className="h-1 bg-gradient-primary dark:bg-gradient-primary-dark rounded-full"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}
      
    </div>
  );
};

export default GenericCarousel;