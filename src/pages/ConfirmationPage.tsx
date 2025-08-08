import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import StarRating from '../components/StarRating';
import { useReviews } from '../hooks/useProductData';
import { toast } from 'sonner';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';


const ConfirmationPage = () => {
  const location = useLocation();
  const {
    fromProductType,
    fromProductTypeId,
    productId,
    productName,
    productImage,
    orderValue, // Passed from ProductPage
    orderCurrency, // Passed from ProductPage
    orderContentIds, // Passed from ProductPage
    orderNumItems // Passed from ProductPage
  } = location.state || {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { settings } = useStoreSettings();


  const { reviews, addReview } = useReviews(productId || '');

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
  // Track Purchase event when confirmation page loads
  if (window.fbq && settings?.facebook_pixel_id && productId) {
    // We need to pass basic purchase information
    window.fbq('track', 'Purchase', {
      content_ids: [productId],
      content_name: productName,
      value: orderValue || 0, // Use default value if not provided
      currency: 'DZD',
      num_items: orderNumItems || 1 // Use default if not provided
    });
  }
}, [productId, productName, orderValue, orderNumItems, settings?.facebook_pixel_id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit review called with rating:', rating);

    if (rating === 0) {
      toast.error('يرجى اختيار تقييم');
      return;
    }

    setIsSubmittingReview(true);

    try {
      await addReview({
        product_id: productId,
        rating: rating,
        comment: comment,
        reviewer_name: reviewerName || 'مجهول'
      });

      setReviewSubmitted(true);
      setRating(0);
      setComment('');
      setReviewerName('');
      toast.success('تم إرسال التقييم بنجاح!');

       if (window.fbq && settings?.facebook_pixel_id) {
          window.fbq('trackCustom', 'Review', {
           product_id: productId,
           rating: rating,
           comment_length: comment.length,
           reviewer_name_provided: !!reviewerName
         });
       }

    } catch (error) {
      toast.error('فشل في إرسال التقييم');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRatingChange = (newRating: number) => {
    console.log('Rating changed to:', newRating);
    setRating(newRating);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
      <motion.div
        className="w-full max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Success Icon */}
        <motion.div
          className="relative mt-10 sm:mt-12   mb-6 sm:mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-primary dark:bg-gradient-primary-dark rounded-full opacity-20 animate-pulse-ring"></div>
            <div className="w-full h-full bg-gradient-primary dark:bg-gradient-primary-dark rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4 sm:mb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          شكراً لك! تم تقديم طلبك.
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          تم تقديم طلبك بنجاح وسيتم شحنه قريباً. ستتلقى مكالمة تأكيد خلال 24 ساعة.
        </motion.p>

        {/* Order Details */}
        <motion.div
          className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 gradient-text">ما الخطوة التالية؟</h3>
          <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
            <li className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-gradient-primary dark:bg-gradient-primary-dark rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
              <span>سيتصل بك فريقنا خلال 24 ساعة لتأكيد تفاصيل طلبك</span>
            </li>
            <li className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-gradient-primary dark:bg-gradient-primary-dark rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
              <span>سيتم تجهيز طلبك وشحنه خلال 2-3 أيام عمل</span>
            </li>
            <li className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-2 h-2 bg-gradient-primary dark:bg-gradient-primary-dark rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
              <span>ستتلقى معلومات التتبع بمجرد شحن طلبك</span>
            </li>
          </ul>
        </motion.div>

        {/* Reviews Section */}
        {productId && (
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {/* Leave a Review Section */}
            {!reviewSubmitted && (
              <motion.div
                className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 gradient-text">
                  كيف تقيّم منتجك الجديد؟
                </h3>

                {productImage && (
                  <motion.div
                    className="mb-4 sm:mb-6"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-lg mx-auto shadow-lg"
                    />
                    <p className="text-sm sm:text-base md:text-lg font-medium mt-2 sm:mt-3 text-foreground">{productName}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-3 sm:space-y-4">
                  <div>

                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-primary/50 outline-none text-sm sm:text-base"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2">تقييمك</label>
                    <div className="flex justify-center">
                      <StarRating
                        rating={rating}
                        onRatingChange={handleRatingChange}
                        size="lg"
                        readonly={false}
                      />
                    </div>
                  </div>
                  <div>

                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-primary/50 outline-none text-sm sm:text-base"
                      rows={3}
                      placeholder="شارك تجربتك مع هذا المنتج..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={rating === 0 || isSubmittingReview}
                    className="btn-gradient px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: rating === 0 ? 1 : 1.05 }}
                    whileTap={{ scale: rating === 0 ? 1 : 0.95 }}
                  >
                    {isSubmittingReview ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>جاري الإرسال...</span>
                      </div>
                    ) : (
                      'إرسال التقييم'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Review Success Message */}
            {reviewSubmitted && (
              <motion.div
                className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-green-500/10 border-green-500/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">
                  شكراً على تقييمك! يساعد ذلك العملاء الآخرين على اتخاذ قرارات مستنيرة.
                </p>
              </motion.div>
            )}


          </div>
        )}

        {/* Continue Shopping Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: reviewSubmitted ? 0.7 : 1.2 }}
        >
          <Link to={`/products/${fromProductTypeId || fromProductType || 't-shirts'}`}>
            <motion.button
              className="btn-gradient flex items-center space-x-2 sm:space-x-3 mx-auto px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base md:text-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>مواصلة التسوق</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Additional Navigation */}
        <motion.div
          className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reviewSubmitted ? 0.9 : 1.4 }}
        >
          <Link to="/">
            <motion.span
              className="text-sm sm:text-base text-muted-foreground hover:gradient-text transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              العودة إلى الصفحة الرئيسية
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ConfirmationPage;