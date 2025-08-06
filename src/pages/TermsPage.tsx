import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Book, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  RefreshCw, 
  Copyright,
  Lock,
  Edit,
  Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-20 md:pt-20 pb-4 md:pb-8">
        

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-2">
            شروط  الاستخدام
          </h1>
          <p className="text-lg text-muted-foreground">
             !مرحبًا بك 
          </p>
        </motion.div>

        {/* Terms sections */}
        <div className="space-y-5">
          {/* Definitions */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Book className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> تعريفات</h2>
              </div>
              <ul className="space-y-4 pr-7">
                <li className="text-foreground">
                  <span className="font-semibold">"المتجر" أو "نحن":</span> يشير إلى المالك لهذا الموقع.
                </li>
                <li className="text-foreground">
                  <span className="font-semibold">"المستخدم" أو "أنت":</span> يشير إلى أي شخص يستخدم هذا الموقع أو يقوم بعملية شراء من خلاله.
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Acceptance */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <ShieldCheck className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> قبول الشروط</h2>
              </div>
              <p className="text-foreground leading-relaxed">
                باستخدامك لهذا الموقع، فإنك تقر بأنك قرأت وفهمت ووافقت على الالتزام الكامل بهذه الشروط والأحكام. إذا كنت لا توافق عليها، يرجى عدم استخدام الموقع.
              </p>
            </div>
          </motion.div>

          {/* Products and Prices */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <DollarSign className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> المنتجات والأسعار</h2>
              </div>
              <ul className="space-y-4 pr-7">
                <li className="text-foreground">
                  نبذل قصارى جهدنا لعرض معلومات دقيقة عن المنتجات، ولكن لا نضمن خلوها من الأخطاء المطبعية.
                </li>
                <li className="text-foreground">
                  جميع الأسعار قابلة للتغيير دون إشعار مسبق.
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Payment Policy */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <CreditCard className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> سياسة الدفع</h2>
              </div>
              <ul className="space-y-4 pr-7">
                <li className="text-foreground">
                  يتم الدفع عند الاستلام أو عبر وسائل الدفع المحددة في صفحة الدفع.
                </li>
                <li className="text-foreground">
                  يجب أن تكون المعلومات التي تقدمها دقيقة وكاملة عند تنفيذ الطلب لضمان عدم حدوث أي تأخير.
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Shipping and Delivery */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Truck className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> الشحن والتوصيل</h2>
              </div>
              <ul className="space-y-4 pr-7">
                <li className="text-foreground">
                  نقوم بالشحن إلى جميع المناطق المحددة في صفحة التوصيل.
                </li>
                <li className="text-foreground">
                  مدة التوصيل هي مدة تقديرية وقد تتأثر بعوامل خارجة عن إرادتنا.
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Return Policy */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <RefreshCw className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> سياسة الإرجاع والاستبدال</h2>
              </div>
              <div className="space-y-4">
                <p className="text-foreground">
                  <span className="font-semibold">المدة:</span>        يُسمح بطلب إرجاع أو استبدال المنتجات خلال 7 أيام من تاريخ استلام الطلب.

                </p>
                <p className="text-foreground">
                  <span className="font-semibold"> :الشروط</span>  <ul className="space-y-2 pr-7">
                  <li className="text-foreground">
                    يجب أن يكون المنتج في حالته الأصلية، غير مستخدم، وفي تغليفه الأصلي.
                  </li>
                  <li className="text-foreground">
                    يجب إرفاق فاتورة الشراء الأصلية.
                  </li>
                </ul>
                </p>
                
              </div>
            </div>
          </motion.div>

          {/* Intellectual Property */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Copyright className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> حقوق الملكية الفكرية</h2>
              </div>
              <p className="text-foreground leading-relaxed">
                جميع المحتويات على هذا الموقع - بما في ذلك النصوص، الصور، الشعارات، والتصاميم - هي ملك حصري ومحمية بموجب قوانين حقوق النشر.
              </p>
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Lock className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> الخصوصية</h2>
              </div>
              <p className="text-foreground leading-relaxed">
                نلتزم بحماية خصوصيتك. لمزيد من التفاصيل حول كيفية تعاملنا مع بياناتك، يرجى مراجعة 
                <Link to="/privacy" className="text-primary hover:underline mr-1 ml-1">
                  سياسة الخصوصية
                </Link>
                الخاصة بنا.
              </p>
            </div>
          </motion.div>

          {/* Terms Modifications */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Edit className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> التعديلات على الشروط</h2>
              </div>
              <p className="text-foreground leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. تسري التعديلات فور نشرها على هذه الصفحة.
              </p>
            </div>
          </motion.div>

          {/* Applicable Law */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Scale className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> القانون الواجب التطبيق</h2>
              </div>
              <p className="text-foreground leading-relaxed">
                تخضع هذه الشروط وتُفسَّر وفقًا للقوانين المعمول بها في الجزائر.
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Last updated note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-sm text-muted-foreground text-center mt-8 mb-0"
        >
          آخر تحديث: {new Date().toLocaleDateString('ar-DZ')}
        </motion.p>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsPage;

// Fix missing import
function DollarSign(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="2" x2="12" y2="22"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}