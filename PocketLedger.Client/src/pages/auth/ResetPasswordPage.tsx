import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth.api';
import { resetPasswordSchema, type ResetPasswordInput } from '../../lib/validators';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    try {
      await authApi.resetPassword({ email, token, newPassword: data.password });
      setSuccess(true);
      toast.success('Password reset successful!');
    } catch {
      toast.error('Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Invalid Reset Link</h2>
            <p className="text-muted-foreground mb-4">This password reset link is invalid or has expired.</p>
            <Link to="/forgot-password"><Button>Request New Link</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <BanknotesIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="text-muted-foreground mt-2">Enter your new password</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {success ? (
              <div className="text-center space-y-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                <h2 className="text-lg font-semibold">Password reset!</h2>
                <p className="text-muted-foreground text-sm">Your password has been reset successfully.</p>
                <Button onClick={() => navigate('/login')}>Sign In</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Email" type="email" value={email} readOnly />
                <div>
                  <Input label="New Password" type="password" placeholder="Enter new password"
                    error={errors.password?.message} {...register('password')} />
                  <div className="mt-2"><PasswordStrengthMeter password={password} /></div>
                </div>
                <Input label="Confirm Password" type="password" placeholder="Confirm new password"
                  error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                <Button type="submit" className="w-full" loading={loading}>Reset Password</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
