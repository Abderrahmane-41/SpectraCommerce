// src/components/ProductCard.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import { Product ,useProductTypes} from '@/hooks/useSupabaseStore'; // Import the Product type


interface ProductCardProps {
  typeId: string;
  product: Product; // Use the imported Product type
}

const ProductCard = ({ typeId, product }: ProductCardProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { productTypes } = useProductTypes(); // Use the hook to get all product types


  const mainImageUrl = product.images?.[0] || '/placeholder.svg';
  const productType = productTypes.find(type => type.id === typeId);
  const productTypeName = productType?.name || '';
  
  // Create a truncated description (limit to 50 characters)
  let truncatedDescription = '';
  if (product.description) {
    truncatedDescription = product.description.length > 40
      ? `${product.description.substring(0, 40)}...`
      : product.description;
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLightboxOpen(true);
  };

  // Calculate discount percentage
  const discountPercent = 
    product.price_before_discount && product.price_before_discount > product.base_price
      ? Math.round(((product.price_before_discount - product.base_price) / product.price_before_discount) * 100)
      : 0;

  return (
    <>
      <div className="relative p-[3px]">
        {/* Gradient border wrapper */}
        <div className="absolute -inset-0 rounded-xl md:rounded-2xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
        
        {/* Card content */}
        <div className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg md:shadow-xl w-full bg-background">
          <Link to={`/products/${typeId}/${product.id}`} className="block h-full w-full">
            <div className="relative h-60 sm:h-96 w-full overflow-hidden">
              <img
                src={mainImageUrl}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* Product Type Badge (NEW) */}
              {productTypeName && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 bg-black/60 text-white text-xs font-bold rounded-full">
                  {productTypeName}
                </div>
              )}
            
            {/* View Icon Button */}
            <button
              onClick={handleViewClick}
              className="absolute top-3 right-3 z-10 p-3 bg-black/40 text-white rounded-full transition-colors duration-300 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="View image in full screen"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* NEW: Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                -{discountPercent}%
              </div>
            )}

            <div className="absolute bottom-2 md:bottom-6 left-4 md:left-6 right-4 md:right-6 text-white">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 leading-tight">
                {product.name}
              </h3>
                <p className="text-base sm:text-lg font-bold text-green-500">
                {product.base_price} DA
                </p>
              {/* Product Description Preview (NEW) */}
                {truncatedDescription && (
                <p className="text-xs sm:text-sm text-gray-200 mt-0 line-clamp-3 overflow-hidden whitespace-pre-wrap">
                    {truncatedDescription}
                  </p>
                )}
            </div>
          </div>
        </Link>
      </div>
      </div>


      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        src={mainImageUrl}
        alt={product.name}
      />
    </>
  );
};

export default ProductCard;