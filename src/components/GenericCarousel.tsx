import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import arrow icons

// Define the shape of your props
interface GenericCarouselProps<T> {
  items: T[];
  renderSlide: (item: T, index?: number) => React.ReactNode;
  slideClassName?: string; 
  autoplay?: boolean;
  autoplayDelay?: number;
}

const GenericCarousel = <T extends { id: string | number }>({ 
  items, 
  renderSlide, 
  slideClassName = "w-3/4 sm:w-1/2 md:w-2/5 lg:w-1/3" ,
  autoplay = true,
  autoplayDelay = 10000
}: GenericCarouselProps<T>) => {
  // Reverted to the original options, removing speed and dragFree overrides
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' },
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
    const styles = emblaApi.slideNodes().map(() => {
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
    // All wheel event logic has been removed.
  }, [emblaApi, onScroll, onSelect]);

  return (
    <div className="w-full relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
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

      {/* Left Arrow Button */}
      <button
        aria-label="Previous slide"
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute top-1/2 -translate-y-1/2 left-2 z-10 p-2 bg-background/60 text-foreground rounded-full shadow-lg transition-opacity duration-300 hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Right Arrow Button */}
      <button
        aria-label="Next slide"
        onClick={() => emblaApi?.scrollNext()}
        className="absolute top-1/2 -translate-y-1/2 right-2 z-10 p-2 bg-background/60 text-foreground rounded-full shadow-lg transition-opacity duration-300 hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      
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