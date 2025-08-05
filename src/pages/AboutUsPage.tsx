import { motion } from 'framer-motion';
import { Heart, Check, Users, Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back button */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة إلى الرئيسية
          </Link>
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            من نحن
          </h1>
          <p className="text-lg text-foreground">
            مرحبًا بك، هنا حيث تلتقي الجودة بالثقة.
          </p>
        </motion.div>

        {/* Our Story */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4 relative p-[0px] rounded-xl"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
          <div className="relative glass-effect rounded-xl p-6 md:p-8">
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">قصتنا</h2>
            </div>
            <p className="text-foreground leading-relaxed text-justify">
              لم نكن مجرد متجر إلكتروني آخر. انطلقنا من شغف حقيقي ورغبة في سد فجوة لاحظناها في السوق. 
              أردنا إنشاء وجهة تسوق لا تقدم منتجات رائعة فحسب، بل تجربة إنسانية قائمة على الثقة والاهتمام.
            </p>
          </div>
        </motion.div>

        {/* Our Mission */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-4 relative p-[0px] rounded-xl"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
          <div className="relative glass-effect rounded-xl p-6 md:p-8">
            <div className="flex items-center mb-4">
              <Trophy className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">مهمتنا</h2>
            </div>
            <p className="text-foreground leading-relaxed text-justify">
              مهمتنا بسيطة: أن نكون خيارك الأول والأكثر موثوقية عند البحث عن المنتجات. 
              نحن نؤمن بأن كل عملية شراء هي بداية علاقة، ونسعى لجعل هذه العلاقة مبنية على الرضا التام.
            </p>
          </div>
        </motion.div>

        {/* Our Values */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8 relative p-[0px] rounded-xl"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
          <div className="relative glass-effect rounded-xl p-6 md:p-8">
            <div className="flex items-center mb-6">
              <Users className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">قيمنا</h2>
            </div>
            
            <ul className="space-y-6">
              <li className="flex">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <Check className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <h3 className="font-semibold mb-1">الجودة أولاً</h3>
                  <p className="text-muted-foreground text-sm">
                    نختار كل منتج بعناية فائقة لنضمن أنه يلبي معاييرنا العالية قبل أن يصل إليك.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <Check className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <h3 className="font-semibold mb-1">الشفافية المطلقة</h3>
                  <p className="text-muted-foreground text-sm">
                    أسعار واضحة، سياسات سهلة، وتواصل صريح. لا توجد مفاجآت غير سارة معنا.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <Check className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <h3 className="font-semibold mb-1">خدمة استثنائية</h3>
                  <p className="text-muted-foreground text-sm">
                    فريقنا هنا لمساعدتك في كل خطوة، من الإجابة على استفساراتك إلى ضمان وصول طلبك بأمان.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Conclusion */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mb-0"
        >
          <p className="text-lg font-medium mb-3">
            نحن أكثر من مجرد متجر، نحن مجتمع يجمعنا الشغف بالتميز.
          </p>
          <p className="text-muted-foreground ">
            شكرًا لكونك جزءًا من قصتنا. نحن هنا دائمًا لخدمتك.
          </p>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUsPage;