// src/components/HeroImageCard.tsx
import { optimizeCloudinaryUrl } from '@/utils/imageUtils';

interface HeroImageCardProps {
  imageUrl: string;
  index?: number;
}

const HeroImageCard = ({ imageUrl, index = 0 }: HeroImageCardProps) => {
  // Hero images should be high quality but optimized, using w_1200
  const optimizedImageUrl = optimizeCloudinaryUrl(imageUrl, 1200);
  
  return (
    <div className="relative p-[3px]">
      {/* Gradient border wrapper */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
      
      {/* Card content */}
      <div className="w-full h-56 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl relative z-10 bg-background">
        <img
          src={optimizedImageUrl}
          alt="Hero Background Image"
          className="w-full h-full object-contain"
          // First hero image should not be lazy loaded, others should
          loading={index === 0 ? "eager" : "lazy"}
        />
      </div>
    </div>
  );
};

export default HeroImageCard;