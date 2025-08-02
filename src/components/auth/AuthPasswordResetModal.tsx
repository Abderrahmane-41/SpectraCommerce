import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getPasswordResetUrl } from '@/utils/url';

interface AuthPasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthPasswordResetModal = ({ isOpen, onClose }: AuthPasswordResetModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Use signInWithPassword with a dummy password to check if email exists
      // This will fail but give us info about whether the email is registered
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy-password-for-check-only'
      });

      // If error message indicates invalid credentials, email exists but password is wrong
      if (error && error.message.includes('Invalid login credentials')) {
        return true;
      }

      // If error message indicates email not confirmed or user not found
      if (error && (
        error.message.includes('Email not confirmed') ||
        error.message.includes('User not found') ||
        error.message.includes('Invalid email')
      )) {
        return false;
      }

      // For any other error, we assume email doesn't exist
      return false;
    } catch (error: any) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('الرجاء إدخال عنوان بريدك الإلكتروني.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('الرجاء إدخال عنوان بريد إلكتروني صالح.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      // First check if email exists
      const emailExists = await checkEmailExists(email);
      
      if (!emailExists) {
        setError('هذا البريد الإلكتروني غير مسجل. الرجاء إدخال بريد إلكتروني صالح أو التسجيل لحساب جديد.');
        toast.error('البريد الإلكتروني غير مسجل');
        return;
      }

      // If email exists, send reset link
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetUrl(),
      });

      if (error) {
        throw error;
      }

      setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات.');
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور بنجاح!');
      
      // Clear the form
      setEmail('');
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError('تعذر إرسال رابط إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى لاحقًا.');
      toast.error('فشل إرسال رابط إعادة تعيين كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="p-[2px] rounded-lg bg-gradient-primary dark:bg-gradient-primary-dark">
          <div className="bg-background rounded-lg p-6">
            <DialogHeader>
              <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
              <DialogDescription>
                أدخل عنوان بريدك الإلكتروني المسجل لتلقي رابط إعادة تعيين كلمة المرور.
              </DialogDescription>
            </DialogHeader>

            {message && (
              <Alert>
                <AlertDescription className="text-green-600">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSendResetLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">عنوان البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني المسجل"
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPasswordResetModal;
