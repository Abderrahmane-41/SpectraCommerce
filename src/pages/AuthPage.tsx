
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';
import AuthPasswordResetModal from '@/components/auth/AuthPasswordResetModal';
import { supabase } from '@/integrations/supabase/client';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [searchParams] = useSearchParams();
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Check if this is a password reset flow
  const isPasswordReset = searchParams.get('type') === 'recovery';

  useEffect(() => {
    if (user && !isPasswordReset) {
      navigate('/dashboard');
    }
  }, [user, navigate, isPasswordReset]);

  useEffect(() => {
    const handlePasswordReset = async () => {
      if (isPasswordReset) {
        // Get the current session to check if we have valid recovery session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !currentSession) {
          toast.error('Password reset link has expired. Please request a new one.');
          navigate('/auth');
          return;
        }

        // Check if this is actually a recovery session
        const accessToken = currentSession.access_token;
        if (!accessToken) {
          toast.error('جلسة إعادة تعيين كلمة المرور غير صالحة. يُرجى طلب رابط إعادة تعيين جديد.');
          navigate('/auth');
          return;
        }

        toast.success('الرجاء إدخال كلمة المرور الجديدة أدناه');
      }
    };

    handlePasswordReset();
  }, [isPasswordReset, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast.success('تم تسجيل الدخول بنجاح!');
      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Verify we have a valid session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession) {
        throw new Error('انتهت صلاحية جلسة إعادة تعيين كلمة المرور. يُرجى طلب رابط إعادة تعيين جديد.');
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success('تم تحديث كلمة المرور بنجاح!');

      // Clear the form
      setPassword('');
      setConfirmPassword('');
      
      // Sign out the user to clear the recovery session
      await supabase.auth.signOut();
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 1500);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // If session expired, redirect to main auth page
      if (error instanceof Error && (errorMessage.includes('session') || errorMessage.includes('expired'))) {
        if (error.message.includes('session') || error.message.includes('expired')) {
          setTimeout(() => {
            navigate('/auth');
          }, 2000);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative p-[3px]">
          {/* Gradient border wrapper */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-primary dark:bg-gradient-primary-dark"></div>
          
          {/* Card content */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl relative z-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isPasswordReset ? 'إعادة تعيين كلمة المرور' : 'مرحبا بك مجددا'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {isPasswordReset 
                  ? 'أدخل كلمة المرور الجديدة أدناه' 
                  : 'تسجيل الدخول إلى حسابك'
                }
              </p>
            </motion.div>
          </div>

          <form onSubmit={isPasswordReset ? handlePasswordReset : handleSubmit} className="space-y-6">
            {!isPasswordReset && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="كلمة المرور">
                {isPasswordReset ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12"
                  placeholder={isPasswordReset ? 'أدخل كلمة المرور الجديدة' : 'أدخل كلمة المرور الخاصة بك'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {isPasswordReset && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-12"
                    placeholder="أكد كلمة المرور الجديدة"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  'تحميل...'
                ) : isPasswordReset ? (
                  'تغيير كلمة المرور'
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {!isPasswordReset && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button
                type="button"
                onClick={() => setIsPasswordResetOpen(true)}
                className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center gap-2 mx-auto"
              >
                <KeyRound className="w-4 h-4" />
                نسيت كلمة السر؟
              </button>
            </motion.div>
          )}
        </div>
        </div>
      </motion.div>

      <AuthPasswordResetModal
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
      />
    </div>
  );
};

export default AuthPage;
