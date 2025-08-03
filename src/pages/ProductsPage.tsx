import { motion } from 'framer-motion';
import HowToOrder from '../components/HowToOrder';

import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Search,Info, Percent } from 'lucide-react';
import { useProducts, useProductTypes } from '../hooks/useSupabaseStore';
import ProductCard from '../components/ProductCard';
import { useMemo, useState, useEffect ,useRef} from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const ProductsPage = () => {
    const { typeId = '' } = useParams();
    const navigate = useNavigate();
    const { products, loading: productsLoading } = useProducts(typeId);
    const { productTypes, loading: typesLoading } = useProductTypes();

    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [searchPrice, setSearchPrice] = useState('');
    const [searchColor, setSearchColor] = useState('');
    const [searchSize, setSearchSize] = useState('');
    const [searchDiscount, setSearchDiscount] = useState('');
    const [displayCount, setDisplayCount] = useState(0);
    const howToOrderRef = useRef<HTMLElement>(null);

    const productsForType = useMemo(() => {
        return products.filter(product => product.product_type_id === typeId);
    }, [products, typeId]);

    const filteredProducts = useMemo(() => {
        const lowerSearchTerm = productSearchTerm.toLowerCase().trim();
        const lowerSearchColor = searchColor.toLowerCase().trim();
        const lowerSearchSize = searchSize.toLowerCase().trim();
        const numericSearchPrice = parseFloat(searchPrice);
        const numericSearchDiscount = parseFloat(searchDiscount);

        return productsForType.filter(product => {
            const nameMatch = !lowerSearchTerm || product.name.toLowerCase().includes(lowerSearchTerm);
            const priceMatch = isNaN(numericSearchPrice) || product.base_price <= numericSearchPrice;
            const colorMatch = !lowerSearchColor || product.options.colors.some(c => c.name.toLowerCase().includes(lowerSearchColor));
            const sizeMatch = !lowerSearchSize || product.options.sizes.some(s => s.name.toLowerCase().includes(lowerSearchSize));
            
            const discountMatch = isNaN(numericSearchDiscount) || (
                product.price_before_discount && product.price_before_discount > product.base_price
                    ? (((product.price_before_discount - product.base_price) / product.price_before_discount) * 100) >= numericSearchDiscount
                    : false
            );

            return nameMatch && priceMatch && colorMatch && sizeMatch && discountMatch;
        });
    }, [productSearchTerm, searchPrice, searchColor, searchSize, searchDiscount, productsForType]);

    useEffect(() => {
        const initialDisplay = Math.ceil(filteredProducts.length );
        setDisplayCount(initialDisplay > 0 ? initialDisplay : Math.min(filteredProducts.length, 4));
    }, [filteredProducts]);

    
    const scrollToHowToOrder = () => {
    howToOrderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

    const currentProductType = productTypes.find(type => type.id === typeId);

    if (productsLoading || typesLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            <Navbar />
            
            <motion.div
                className="pt-12 md:pt-10 pb-12 md:pb-20 px-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="container mx-0 my-0 max-w-full">
                    <motion.div
                        className="mb-0 md:mb-8 mt-0 md:mt-4"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link to="/">
                            <div className="sticky top-12 backdrop-blur-sm border-background p-0 sm:p-10 z-40">
                                <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="text-sm">الرجوع</span>
                                </button>
                            </div>
                        </Link>
                    </motion.div>
                    
                    <div className="flex justify-center items-center gap-4 mb-8 md:mb-12">
                        <motion.h1
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text capitalize px-2 leading-tight"
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {currentProductType?.name || 'المنتجات'}
                        </motion.h1>
                        <Popover>
                            <PopoverTrigger asChild><Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button></PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <div className="space-y-2"><h4 className="font-medium leading-none">بحث متقدم</h4><p className="text-sm text-muted-foreground">ابحث عن منتجاتك بمعايير محددة.</p></div>
                                    <div className="grid gap-2">
                                        <Input placeholder="اسم المنتج..." value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} />
                                        <Input type="number" placeholder="السعر الأقصى..." value={searchPrice} onChange={(e) => setSearchPrice(e.target.value)} />
                                        
                                        <div className="relative">
                                            <Input type="number" placeholder="أدنى نسبة خصم..." value={searchDiscount} onChange={(e) => setSearchDiscount(e.target.value)} className="pl-8"/>
                                            <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {filteredProducts.slice(0, displayCount).map((product) => (<ProductCard key={product.id} product={product} typeId={product.product_type_id} />))}
                        </div>
                    ) : (
                        <div className="text-center py-12"><p className="text-base sm:text-lg md:text-xl text-muted-foreground">لم يتم العثور على منتجات تطابق بحثك.</p></div>
                    )}
                    
                </div>
            </motion.div>
            {/* How to Order Section */}
      <motion.section ref={howToOrderRef} className="py-0 sm:py-16 md:py-20 px-3 sm:px-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <div className="w-full max-w-7xl mx-auto">
          <motion.h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-8 sm:mb-12 gradient-text" initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>كيفية الطلب</motion.h2>
          <HowToOrder />
        </div>
      </motion.section>
      
      {/* Sticky Scroll Button */}
      <motion.button onClick={scrollToHowToOrder} className="fixed bottom-3 left-3 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2" aria-label="كيفية الطلب" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring' }}><Info className="w-6 h-6" /></motion.button>
        </div>
        
    );
};

export default ProductsPage;