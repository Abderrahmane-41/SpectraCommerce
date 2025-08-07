import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordResetModal = ({ isOpen, onClose }: PasswordResetModalProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendResetLink = async () => {
    if (!user?.email) {
      setError('لم يتم العثور على بريد إلكتروني للمستخدم.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) throw error;

      setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني!');
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين.');
      toast.error('فشل إرسال رابط إعادة تعيين كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
          <DialogDescription>
            سيتم إرسال رابط إعادة تعيين كلمة المرور إلى عنوان بريدك الإلكتروني المسجل: {user?.email}
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

        <div className="flex gap-2">
          <Button onClick={handleSendResetLink} disabled={isLoading} className="flex-1">
            {isLoading ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className='text-foreground placeholder:text-muted-foreground'>
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetModal;
