
import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { optimizeCloudinaryUrl } from '@/utils/imageUtils';


interface ImageGalleryPaginationProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  productName?: string;
}

const ImageGalleryPagination = ({ 
  images, 
  currentIndex, 
  onIndexChange, 
  productName = "المنتج"
}: ImageGalleryPaginationProps) => {
  // Use Embla for the thumbnails
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  // Synchronize thumbnail carousel with main carousel
  useEffect(() => {
    if (!emblaThumbsApi) return;
    emblaThumbsApi.scrollTo(currentIndex);
  }, [currentIndex, emblaThumbsApi]);

  return (
    <div className="mt-4">
      <div className="overflow-hidden" ref={emblaThumbsRef}>
      <div className="flex gap-2 py-2">
        {images.map((image, index) => (
          <div 
            key={`thumb-${index}`} 
            className={`relative p-[2px] flex-0 min-w-16 cursor-pointer`}
            onClick={() => onIndexChange(index)}
          >
            {/* Gradient border wrapper */}
            <div className={`absolute inset-0 rounded-md bg-gradient-primary dark:bg-gradient-primary-dark ${currentIndex === index ? 'opacity-100' : 'opacity-40'}`}></div>
            
            {/* Thumbnail content */}
            <div 
              className={`
                relative z-10 w-16 h-16 rounded-md overflow-hidden bg-background
                ${currentIndex === index ? 'ring-2 ring-primary' : 'opacity-70'}
                transition-all duration-200
              `}
            >
              <img 
                src={optimizeCloudinaryUrl(image, 100)} 
                alt={`${productName} - صورة ${index + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default ImageGalleryPagination;
