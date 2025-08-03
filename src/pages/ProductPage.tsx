import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useProductById, useReviews, useOrders, Product } from '../hooks/useProductData';
import { useShippingData } from '../hooks/useShippingData';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import ImageGalleryPagination from '../components/ImageGalleryPagination';
import ImageLightbox from '../components/ImageLightbox';
import Navbar from '../components/Navbar';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import useEmblaCarousel from 'embla-carousel-react';
import { getClientIp } from '../hooks/useProductData.ts';
import OrderSuccessModal from '../components/OrderSuccessModal';
import { Button } from '../components/ui/button';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useSupabaseStore';


// Update the ImageSlide component near the top of the file
const ImageSlide = ({ imageUrl, alt, onImageClick }: { imageUrl: string, alt: string, onImageClick: () => void }) => (
    <div className="relative p-[2px]">
        {/* Gradient border wrapper */}
        <div className="absolute inset-0 rounded-lg bg-gradient-primary dark:bg-gradient-primary-dark"></div>

        {/* Image content */}
        <div className="aspect-square bg-background rounded-lg overflow-hidden relative cursor-zoom-in z-10" onClick={onImageClick}>
            <img
                src={imageUrl}
                alt={alt}
                className="w-full h-full object-contain"
            />
        </div>
    </div>
);

// src/pages/ProductPage.tsx (add this section)

// Official list of all 58 Algerian Wilayas in order
const ALGERIAN_WILAYAS_ORDERED_58 = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa',
    'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa',
    'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel',
    'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara',
    'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj',
    'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naâma',
    'Ain Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun',
    'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès', 'In Salah',
    'In Guezzam', 'Touggourt', 'Djanet', 'El M\'ghair', 'El Meniaa'
  ];


// Helper Component for Product Header, now receives dynamic price
const ProductHeader = ({ product, reviewsCount,averageRating, dynamicPrice }: { product: Product;reviewsCount: number; averageRating: number; dynamicPrice: number; }) => (
  <div>
    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
    <p className="text-xl text-green-500 sm:text-2xl md:text-3xl font-bold mb-3">
       {dynamicPrice} DA
    </p>
    {product.price_before_discount && product.price_before_discount > product.base_price && (
        <p className="text-lg sm:text-xl text-red-500 line-through">
          {product.price_before_discount} DA
        </p>
      )}

      <div className="flex items-center space-x-0 mb-4">
                <StarRating rating={averageRating} readonly size="md" />
                <span className="text-sm font-medium ml-1">{averageRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">(تقييم{reviewsCount !== 1 ? 'ات' : ''}{reviewsCount} )</span>
              </div>

              <p className="text-lg font-bold mb-2">وصف المنتج</p>
              <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap"  >
                {product.description}
              </p>
    
    
  </div>
);



const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const [shipToHome, setShipToHome] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const OrderRef = useRef<HTMLElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newOrderDetails, setNewOrderDetails] = useState(null);
  const [upsaleDisplayCount, setUpsaleDisplayCount] = useState(0);
  const { products } = useProducts('');
  const { product, loading } = useProductById(productId || '');
  const [dynamicProductPrice, setDynamicProductPrice] = useState(product?.base_price || 0);

  const { shippingData, loading: shippingLoading, error: shippingError } = useShippingData();
  const { addOrder } = useOrders();
  const { reviews, loading: reviewsLoading } = useReviews(productId || '');
    const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const isOutOfStock = product && product.max_quantity !== null && product.max_quantity <= (product.min_quantity || 1);


  // Effect to update the dynamic price when options change
  useEffect(() => {
    

    if (product) {
        let currentPrice = product.base_price;

        const selectedSize = product.options?.sizes?.find(s => s.name === size);
        if (selectedSize) {
            currentPrice += selectedSize.priceModifier;
        }

        const selectedColor = product.options?.colors?.find(c => c.name === color);
        if (selectedColor) {
            currentPrice += selectedColor.priceModifier;
        }

        setDynamicProductPrice(currentPrice);
    }
  }, [size, color, product]);

  // REMOVED explicit ViewContent Event tracking
  // useEffect(() => {
  //   if (product && (window as any).fbq) {
  //     (window as any).fbq('track', 'ViewContent', {
  //       content_name: product.name,
  //       content_category: product.product_type_id,
  //       content_ids: [product.id],
  //       value: product.base_price,
  //       currency: 'DZD'
  //     });
  //   }
  // }, [product]);

  const scrollToOrder = () => {
    OrderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateAlgerianPhone = (phone: string): boolean => {
    const algerianPhoneRegex = /^(05|06|07)\d{8}$/;
    return algerianPhoneRegex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneValue = e.target.value;
    setCustomerPhone(phoneValue);

    if (phoneValue.trim() === '') {
      setPhoneError(null);
    } else if (!validateAlgerianPhone(phoneValue)) {
      setPhoneError('يجب أن يبدأ رقم الهاتف بـ 05 أو 06 أو 07 ويتكون من 10 أرقام');
    } else {
      setPhoneError(null);
    }
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentImageIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (product && product.min_quantity) {
      setQuantity(product.min_quantity);
    }
  }, [product]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const upsaleProducts = useMemo(() => {
  if (!product) return [];
  
  // Get products from the same type, excluding current product
  return products.filter(p => 
    p.product_type_id === product.product_type_id && 
    p.id !== product.id
  );
}, [products, product]);

  // Add useEffect for upsale display count (add after existing useEffects)
useEffect(() => {
  const initialDisplay = Math.ceil(upsaleProducts.length * 0.40);
  setUpsaleDisplayCount(initialDisplay > 0 ? initialDisplay : Math.min(upsaleProducts.length, 4));
}, [upsaleProducts]);

// Add handler function for show more button (add after existing handlers)
const handleUpsaleShowMore = () => {
  const increment = Math.ceil(upsaleProducts.length * 0.40);
  setUpsaleDisplayCount(prevCount => Math.min(prevCount + increment, upsaleProducts.length));
};

const shouldShowUpsaleMoreButton = upsaleDisplayCount < upsaleProducts.length;

  

   // Update quantity functions with limits
  const incrementQuantity = () => {
    if (product?.max_quantity === null) {
      setQuantity(q => q + 1);
    } else {
      setQuantity(q => Math.min(q + 1, product.max_quantity!));
    }
  };


  const handleSingleClick = (action: 'increment' | 'decrement') => {
  if (action === 'increment') {
    incrementQuantity();
  } else {
    decrementQuantity();
  }
};
 

  // Hold-to-click functionality
 const startHold = (action: 'increment' | 'decrement') => {
  setIsHolding(true);
  
  // Start repeating after 500ms delay (don't call action immediately)
  holdTimeoutRef.current = setTimeout(() => {
    holdIntervalRef.current = setInterval(() => {
      if (action === 'increment') {
        incrementQuantity();
      } else {
        decrementQuantity();
      }
    }, 100); // Repeat every 100ms for fast increment
  }, 500);
};


  const stopHold = () => {
  setIsHolding(false);
  if (holdTimeoutRef.current) {
    clearTimeout(holdTimeoutRef.current);
    holdTimeoutRef.current = null;
  }
  if (holdIntervalRef.current) {
    clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = null;
  }
};

  const decrementQuantity = () => {
    setQuantity(q => Math.max(q - 1, product?.min_quantity || 1));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSize(e.target.value);
  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => setColor(e.target.value);

  const calculateShippingCost = () => {
    if (!wilaya || !shippingData.shippingPrices[wilaya]) return 0;

    if (shipToHome) {
        return shippingData.shippingHomePrices[wilaya] || 0;
    }
    return shippingData.shippingPrices[wilaya];
  };

  

  const calculateTotalPrice = () => {
    if (!product) return 0;
    const productsPrice = calculatePriceForQuantity(quantity);
    const shippingCost = calculateShippingCost();
    return productsPrice + shippingCost;
};

  const calculatePriceForQuantity = (qty: number) => {
    if (!product) return 0;

    const basePrice = dynamicProductPrice;
    const offers = product.quantity_offers || [];

    // Find the best offer for the current quantity
    const bestOffer = offers
        .filter(offer => qty >= offer.quantity)
        .sort((a, b) => b.quantity - a.quantity)[0];

    if (bestOffer) {
        const numOfferSets = Math.floor(qty / bestOffer.quantity);
        const remainingQty = qty % bestOffer.quantity;
        return numOfferSets * bestOffer.price + remainingQty * basePrice;
    }

    return qty * basePrice;
};

  const handleInitiateCheckout = () => {
    // REMOVED explicit InitiateCheckout Event tracking
    // The seller can define this event themselves using Facebook's Event Setup Tool.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return toast.error('الرجاء إدخال الاسم الكامل');
    if (!customerPhone.trim()) return toast.error('الرجاء إدخال رقم الهاتف');
    if (!validateAlgerianPhone(customerPhone)) return toast.error('رقم الهاتف غير صحيح، يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام');
    if (!wilaya.trim()) return toast.error('الرجاء اختيار الولاية');
    if (shipToHome && !commune.trim()) return toast.error('الرجاء اختيار البلدية للتوصيل المنزلي');

    const hasSizeOptions = product?.options?.sizes && product.options.sizes.length > 0;
    const hasColorOptions = product?.options?.colors && product.options.colors.length > 0;

    if (hasSizeOptions && !size) return toast.error('الرجاء اختيار المقاس');
    if (hasColorOptions && !color) return toast.error('الرجاء اختيار اللون');

    if (!product) return toast.error('تفاصيل المنتج غير متوفرة');

    setIsPlacingOrder(true);
    try {
      const ipAddress = await getClientIp();

      const orderData = {
        product_id: product.id,
        product_name: product.name,
        ip_address: ipAddress,
        size: product.options?.sizes?.length > 0 ? size : 'لا يوجد',
        color: product.options?.colors?.length > 0 ? color : 'لا يوجد',
        quantity,
        base_price: dynamicProductPrice, // Use the dynamic price
        total_price: calculateTotalPrice(),
        customer_name: customerName,
        customer_phone: customerPhone,
        wilaya,
        commune: shipToHome ? commune : ' استلام من المكتب',
        full_address: shipToHome ? `${commune}, ${wilaya}` : `${wilaya} إستلام من `,
        status: 'pending' as const,
      };
      const newOrder = await addOrder(orderData);
      if (newOrder) {
        setNewOrderDetails(newOrder);
        setIsSuccessModalOpen(true);
      } else {
        toast.error('فشل في تقديم الطلب');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      if (error instanceof Error && error.message === 'duplicate_order') {
      toast.error('لقد قمت بطلب هذا المنتج مسبقاً خلال الـ 6 ساعات الماضية');
    } else {
      toast.error('حدث خطأ أثناء تقديم الطلب');
    }
  } finally {
    setIsPlacingOrder(false);
  }
  };

  const handleConfirmAndRedirect = () => {
    setIsSuccessModalOpen(false);
    if (product) {
        navigate('/confirmation', {
            state: {
              fromProductType: product.product_type_id,
              fromProductTypeId: product.product_type_id,
              productId: product.id,
              productName: product.name,
              productImage: product.images?.[0] || product.image_url,
              // REMOVED pixel tracking data from state as it's not needed for ConfirmationPage's fbq call.
            },
        });
    }
  };

const orderedAvailableWilayas = ALGERIAN_WILAYAS_ORDERED_58.filter(wilayaName =>
  Object.keys(shippingData.shippingPrices).includes(wilayaName)
);  const availableCommunes = wilaya ? shippingData.communes[wilaya] || [] : [];

  if (loading || shippingLoading || reviewsLoading) return <LoadingSpinner />;

  if (shippingError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4">
        <Navbar />
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold mb-4">خطأ في تحميل بيانات الشحن</h2>
          <p className="text-muted-foreground mb-4">{shippingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-gradient px-4 py-2 rounded-lg text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4">
        <Navbar />
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold mb-4">المنتج غير موجود</h2>
            <button
            onClick={() => navigate('/')}
            className="btn-gradient px-4 py-2 rounded-lg text-sm"
            >
            العودة للصفحة الرئيسية
            </button>
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="sticky top-12 backdrop-blur-sm border-background p-0 sm:p-10 z-40">
        <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">الرجوع</span>
        </button>
      </div>

      <main className="max-w-7xl mx-auto my-0 px-2 sm:px-0 py-6 sm:py-10">
        <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text capitalize px-2 py-3 my-2 leading-tight"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                تفاصيل المنتج
            </motion.h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {product.images?.map((image, index) => (
                  <div key={`main-image-${index}`} className="flex-0 flex-grow-0 shrink-0 w-full">
                    <ImageSlide
                      imageUrl={image}
                      alt={product.name}
                      onImageClick={() => setIsLightboxOpen(true)}
                    />
                  </div>
                ))}
              </div>
            </div>
            {product.images && product.images.length > 1 && (
              <ImageGalleryPagination
                images={product.images}
                currentIndex={currentImageIndex}
                onIndexChange={(index) => emblaApi?.scrollTo(index)}
                productName={product.name}
              />
            )}
          </motion.div>
          </motion.div>
            <motion.div className="space-y-6 lg:order-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>

            <ProductHeader product={product} reviewsCount={reviews.length} averageRating={averageRating} dynamicPrice={dynamicProductPrice} />


            {product.quantity_offers && product.quantity_offers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">عروض خاصة</h3>
              <div className="space-y-2">
                {product.quantity_offers.sort((a, b) => a.quantity - b.quantity).map((offer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">
                      {offer.price} DA
                    </p>
                    <p className="font-semibold text-green-700 dark:text-green-300">
                      اشتري {offer.quantity} قطع
                    </p>
                    
                  </div>
                ))}
              </div>
            </div>
          )}

            

            <div className="relative p-[0px] w-full">
              <div className="absolute inset-0 rounded-lg bg-gradient-primary dark:bg-gradient-primary-dark opacity-30"></div>
              <form onSubmit={handleSubmit} className="w-full space-y-4 p-4 glass-effect rounded-lg relative z-10">
                <motion.section ref={OrderRef}>
                  <h3 className="text-lg font-bold">قدم طلبك</h3>
                </motion.section>
                  <div className="space-y-3" onChange={handleInitiateCheckout}> {/* Trigger InitiateCheckout here */}
                      <div>

                        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="أدخل اسمك الكامل" required />
                      </div>
                      <div>

                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={handlePhoneChange}
                          className={`w-full px-3 py-2 rounded-lg border ${phoneError ? 'border-red-500' : 'border-border'} bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm`}
                          placeholder="رقم الهاتف مثال: 0599123456"
                          required
                        />
                        {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                      </div>
                      <div>
                      <select value={wilaya} onChange={(e) => { setWilaya(e.target.value); setCommune(''); }} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required>
          <option value="">اختر الولاية</option>
          {orderedAvailableWilayas.map((wilayaName, index) => ( // <--- Updated line: use orderedAvailableWilayas and get index
            <option key={wilayaName} value={wilayaName}>
              {`${index + 1} - ${wilayaName} (${shippingData.shippingPrices[wilayaName]} DA)`}
            </option>
          ))}
        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="shipToHome" checked={shipToHome} onCheckedChange={(checked) => { setShipToHome(checked as boolean); if (!checked) setCommune(''); }} />
                        <label htmlFor="shipToHome" className="text-xs font-medium">التوصيل إلى المنزل </label>
                      </div>
                      {shipToHome && (
                        <div>

                          <select value={commune} onChange={(e) => setCommune(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required disabled={!wilaya}>
                            <option value="">اختر البلدية</option>
                            {availableCommunes.map((communeName) => (
                              <option key={communeName} value={communeName}>{communeName}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {product.options?.sizes && product.options.sizes.length > 0 && (
                        <div>

                          <select value={size} onChange={handleSizeChange} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required={product.options.sizes.length > 0}>
                            <option value="">اختر المقاس</option>
                            {product.options.sizes.map((s, index) => (
                              <option key={index} value={s.name}>{s.name} {s.priceModifier !== 0 ? `(${s.priceModifier > 0 ? '+' : ''}${s.priceModifier} دج)` : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {product.options?.colors && product.options.colors.length > 0 && (
                        <div>

                          <select value={color} onChange={handleColorChange} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required={product.options.colors.length > 0}>
                            <option value="">اختر اللون</option>
                            {product.options.colors.map((c, index) => (
                              <option key={index} value={c.name}>{c.name} {c.priceModifier !== 0 ? `(${c.priceModifier > 0 ? '+' : ''}${c.priceModifier} دج)` : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div>
              <label className="block text-xs font-bold mb-1">
                الكمية
                {product?.max_quantity !== null && (
                  <span className="text-muted-foreground ml-2">
                    (متبقي: {product.max_quantity})
                  </span>
                )}
                {product?.max_quantity === null && (
                  <span className="text-green-600 ml-2 text-xs">
                    (غير محدود)
                  </span>
                )}
              </label>
              <div className="w-full">
                <div className="flex items-center justify-between w-full border border-border rounded-lg overflow-hidden h-12">
                  <button
                    type="button"
                    onClick={() => handleSingleClick('decrement')}
                    onMouseDown={() => startHold('decrement')}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() => startHold('decrement')}
                    onTouchEnd={stopHold}
                    className="flex-1 h-full flex items-center justify-center hover:bg-muted font-bold text-lg transition-colors disabled:opacity-50"
                    disabled={quantity <= (product?.min_quantity || 1) || isOutOfStock}
                  >
                    -
                  </button>
                  <span className="flex-1 font-bold text-base h-full flex items-center justify-center border-x border-border">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSingleClick('increment')}
                    onMouseDown={() => startHold('increment')}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() => startHold('increment')}
                    onTouchEnd={stopHold}
                    className="flex-1 h-full flex items-center justify-center hover:bg-muted font-bold text-lg transition-colors disabled:opacity-50"
                    disabled={product?.max_quantity !== null && quantity >= product.max_quantity}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Show current quantity info */}
              <div className="text-xs text-muted-foreground mt-1">
                {product?.min_quantity && product.min_quantity > 1 && (
                  <span>الحد الأدنى: {product.min_quantity} • </span>
                )}
                {product?.max_quantity !== null && (
                  <span>الحد الأقصى: {product.max_quantity}</span>
                )}
                {product?.max_quantity === null && (
                  <span>كمية غير محدودة</span>
                )}
              </div>
              </div>

              {/* Show out of stock message */}
                {isOutOfStock && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                    <p className="text-red-600 font-semibold">المنتج غير متوفر حالياً</p>
                  </div>
                )}

                    {product && wilaya && (
                      <div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
                        <h4 className="font-semibold"> :تفاصيل السعر</h4>
                        <div className="flex justify-between text-xs">
                          <span>دج {calculatePriceForQuantity(quantity)} </span>
                          <span>  :(x{quantity})سعر المنتج </span>

                        </div>
                        <div className="flex justify-between text-xs">
                          <span> دج{calculateShippingCost()} </span>
                          <span> :{shipToHome ? ' (توصيل منزلي)' : ''}الشحن</span>

                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>{calculateTotalPrice()} دج</span>
                          <span> :المجموع</span>

                        </div>
                      </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPlacingOrder || isOutOfStock}
                        className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 transition-all ${
                          isOutOfStock 
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50' 
                            : 'btn-gradient disabled:opacity-50'
                        }`}
                      >
                        {isOutOfStock ? (
                          <>
                            <span>غير متوفر</span>
                          </>
                        ) : isPlacingOrder ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>جاري تقديم الطلب...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>تقديم الطلب</span>
                          </>
                        )}
                      </button>

                </form>
                </div>
          </motion.div>
        </div>
        <motion.button
          onClick={scrollToOrder}
          className="fixed bottom-4 left-0 right-0 mx-auto z-50 p-2 btn-gradient rounded-full shadow bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-0 w-38 max-w-[120px]"
          aria-label="كيفية الطلب"
          initial={{ scale: 0 }}
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -10, 0]
          }}
          transition={{
            delay: 1,
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <ShoppingCart className="w-5 h-5 m-1" />
          <span className="font-medium">اطلب الآن</span>
        </motion.button>

           {/* Fix the description content display section */}
        <div className="mt-8 lg:mt-12">
          <h3 className="text-xl font-bold mb-4">تفاصيل المنتج</h3>
          
          {product.description_content && Array.isArray(product.description_content) && product.description_content.length > 0 && (
            <div className="space-y-4">
              {product.description_content.map((block: any, index: number) => {
                if (block.type === 'text' && block.content && block.content.trim()) {
                  return (
                    <div key={index} className="prose prose-sm max-w-none">
                      <p className="text-base text-foreground font-semibold leading-relaxed whitespace-pre-wrap">
                        {block.content}
                      </p>
                    </div>
                  );
                }
                if (block.type === 'image' && block.content) {
                  return (
                    <div key={index} className="my-4">
                      <div className="flex justify-end">
                        <img 
                          src={block.content} 
                          alt={`تفاصيل المنتج ${index + 1}`} 
                          className="w-full h-70 sm:w-3/4 lg:w-1/2 rounded-lg shadow-md object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <motion.div className="mt-8 lg:mt-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 className="text-xl font-bold mb-4">تقييمات العملاء</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
              <div key={review.id} className="relative p-[0px]">
                <div className="absolute inset-0 rounded-lg bg-gradient-primary dark:bg-gradient-primary-dark opacity-30"></div>

                <div className="p-2 glass-effect rounded-lg relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div className="flex flex-wrap items-center mb-1 sm:mb-0">
                      <span className="font-semibold mr-2 break-words max-w-[80%]">{review.reviewer_name || 'مجهول'}</span>
                      <div className="star-rating-compact -space-x-2">
                        <StarRating rating={review.rating} readonly size="sm" />
                      </div>
                    </div>
                    <span className="text-xs text-foreground ">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-foreground text-sm ">{review.comment}</p>
                </div>
              </div>
            ))}
            </div>
          </motion.div>
        )}

        {upsaleProducts.length > 0 && (
            <motion.section 
              className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 mt-2" 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              transition={{ duration: 0.8 }} 
              viewport={{ once: true }}
            >
              <div className="w-full max-w-7xl mx-auto">
                <motion.h2 
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-8 md:mb-12 gradient-text" 
                  initial={{ y: 30, opacity: 0 }} 
                  whileInView={{ y: 0, opacity: 1 }} 
                  transition={{ duration: 0.6 }} 
                  viewport={{ once: true }}
                >
                  منتجات مشابهة
                </motion.h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {upsaleProducts.slice(0, upsaleDisplayCount).map((product) => (
                    <ProductCard key={product.id} product={product} typeId={product.product_type_id} />
                  ))}
                </div>
                
                {shouldShowUpsaleMoreButton && (
                  <div className="text-center mt-8 md:mt-12">
                    <Button onClick={handleUpsaleShowMore} className="btn-gradient">
                      عرض المزيد
                    </Button>
                  </div>
                )}
              </div>
            </motion.section>
          )}

      </main>

      <ImageLightbox
        src={product.images?.[currentImageIndex] || '/placeholder.svg'}
        alt={product.name}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleConfirmAndRedirect}
        orderDetails={newOrderDetails}
      />
    </div>
  );
};

export default ProductPage;