import { motion } from 'framer-motion';
import { MousePointerClick, Phone, Truck } from 'lucide-react';

const steps = [
  {
    icon: MousePointerClick,
    title: "الطلب عبر الموقع",
    description: "يمكنك إرسال الطلب عبر اختيار المنتج وملء استمارة الطلب."
  },
  {
    icon: Phone,
    title: "التأكيد عبر الهاتف",
    description: "يتم التواصل معك عبر الهاتف للتحقق من الطلبية وموعد الاستلام."
  },
  {
    icon: Truck,
    title: "استلام الطرد",
    description: "يتم استلام الطلبية من عامل التوصيل إما عند باب المنزل أو أقرب مكتب توصيل."
  }
];

const HowToOrder = () => {
  return (
    <div className="w-full max-w-4xl mx-auto glass-effect p-6 sm:p-8 rounded-2xl my-auto relative">
      {/* Gradient border - outer div */}
      <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-primary dark:bg-gradient-primary-dark">
        {/* Inner transparent div to create border effect */}
        <div className="absolute inset-0 rounded-2xl bg-background/80 dark:bg-background/80"></div>
      </div>
      
      {/* Content - positioned on top of the border */}
      <div className="relative z-10 space-y-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="flex items-start sm:items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-icon-bg flex items-center justify-center text-white shadow-lg">
              <step.icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground mb-1">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground font-semibold">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HowToOrder;