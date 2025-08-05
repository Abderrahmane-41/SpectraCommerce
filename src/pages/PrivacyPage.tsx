import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Database, 
  Share2,
  UserCheck,
  Cookie,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-20 md:pt-20 pb-4 md:pb-8" >
        

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-2">
            سياسة الخصوصية
          </h1>
          <p className="text-lg text-muted-foreground">
            نحن نأخذ خصوصيتك على محمل الجد، ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمعنا لمعلوماتك واستخدامها وحمايتها.
          </p>
        </motion.div>

        {/* Privacy Policy Sections */}
        <div className="space-y-5">
          {/* Information We Collect */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Database className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> المعلومات التي نجمعها</h2>
              </div>
              <p className="text-foreground mb-4">
                لتقديم أفضل تجربة تسوق ممكنة، نقوم بجمع أنواع مختلفة من البيانات:
              </p>
              <ul className="space-y-4 pr-7">
                <li className="text-foreground">
                  <span className="font-semibold">معلومات شخصية:</span> الاسم، عنوان الشحن، رقم الهاتف، والبريد الإلكتروني التي تقدمها عند إتمام الطلب.
                </li>
                <li className="text-foreground">
                  <span className="font-semibold">بيانات التصفح:</span> الصفحات التي تزورها، المنتجات التي تتصفحها، والوقت الذي تقضيه في متجرنا.
                </li>
                <li className="text-foreground">
                  <span className="font-semibold">بيانات تقنية:</span> نستخدم أدوات تحليلية مثل فيسبوك بكسل وGoogle Analytics لفهم سلوك المستخدمين وتتبع أداء إعلاناتنا.
                </li>
              </ul>
            </div>
          </motion.div>

          {/* How We Use Your Data */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Shield className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> كيف نستخدم بياناتك</h2>
              </div>
              <p className="text-foreground mb-4">
                تُستخدم البيانات التي نجمعها للأغراض التالية:
              </p>
              <ul className="space-y-4 pr-7">
                <li className="text-foreground">
                  <span className="font-semibold">تنفيذ الطلبات:</span> معالجة طلباتك وشحنها وتوصيلها إليك.
                </li>
                <li className="text-foreground">
                  <span className="font-semibold">تحسين الخدمة:</span> تحليل أداء المتجر لفهم احتياجاتك وتحسين تجربة المستخدم.
                </li>
                <li className="text-foreground">
                  <span className="font-semibold">التسويق:</span> عرض إعلانات ومنتجات مخصصة تهمك على منصات مثل فيسبوك وإنستغرام.
                </li>
                <li className="text-foreground">
                  <span className="font-semibold">التواصل معك:</span> إرسال تحديثات حول طلبك أو الرد على استفساراتك.
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Data Sharing */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Share2 className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> مشاركة البيانات مع أطراف ثالثة</h2>
              </div>
              <p className="text-foreground mb-4">
                نحن لا نبيع بياناتك الشخصية أبدًا. لكننا نشاركها فقط عند الضرورة مع أطراف ثالثة موثوقة لإتمام خدماتنا، مثل:
              </p>
              <ul className="space-y-4 pr-7">
                <li className="text-foreground">
                  <span className="font-semibold">شركات الشحن:</span> لتوصيل طلباتك.
                </li>
                <li className="text-foreground">
                  <span className="font-semibold">بوابات الدفع:</span> لمعالجة عمليات الدفع بشكل آمن.
                </li>
              </ul>
              <p className="text-foreground mt-4">
                يتم إلزام هؤلاء الشركاء بالحفاظ على سرية معلوماتك.
              </p>
            </div>
          </motion.div>

          {/* Your Rights */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <UserCheck className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> حقوقك المتعلقة ببياناتك</h2>
              </div>
              <p className="text-foreground mb-4">
                لديك الحق الكامل في التحكم في بياناتك الشخصية. يمكنك في أي وقت:
              </p>
              <ul className="space-y-4 pr-7">
                <li className="text-foreground">
                  <span className="font-semibold">الوصول إلى بياناتك:</span> طلب نسخة من المعلومات التي نحتفظ بها عنك.
                </li>
                <li className="text-foreground">
                  <span className="font-semibold">تعديل بياناتك:</span> تصحيح أي معلومات غير دقيقة.
                </li>
                <li className="text-foreground">
                  <span className="font-semibold">حذف بياناتك:</span> طلب إزالة معلوماتك الشخصية من سجلاتنا.
                </li>
              </ul>
              <p className="text-foreground mt-4">
                لممارسة أي من هذه الحقوق، يرجى التواصل معنا عبر البريد الإلكتروني.
              </p>
            </div>
          </motion.div>

          {/* Cookies */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Cookie className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> ملفات تعريف الارتباط (Cookies)</h2>
              </div>
              <p className="text-foreground leading-relaxed">
                يستخدم موقعنا ملفات تعريف الارتباط لضمان عمل وظائف أساسية (مثل سلة التسوق) ولتحسين تجربتك من خلال جمع بيانات تحليلية. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.
              </p>
            </div>
          </motion.div>

          {/* Data Security */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative p-[0px] rounded-xl"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-primary dark:bg-gradient-primary-dark opacity-45"></div>
            <div className="relative glass-effect rounded-xl p-6 md:p-8">
              <div className="flex items-center mb-4">
                <Lock className="h-7 w-7 text-primary mr-3" />
                <h2 className="text-xl font-bold"> أمان البيانات</h2>
              </div>
              <p className="text-foreground leading-relaxed">
                نحن نستخدم إجراءات أمنية وتقنية لحماية بياناتك من الوصول غير المصرح به أو الاستخدام أو الفقدان.
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Last updated note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-sm text-muted-foreground text-center mt-8 mb-0"
        >
          آخر تحديث: {new Date().toLocaleDateString('ar-DZ')}
        </motion.p>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPage;