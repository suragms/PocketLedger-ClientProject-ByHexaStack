import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth.api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../lib/validators';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <BanknotesIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Forgot password?</h1>
          <p className="text-muted-foreground mt-2">Enter your email to receive a reset link</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center space-y-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                <h2 className="text-lg font-semibold">Check your email</h2>
                <p className="text-muted-foreground text-sm">
                  If an account exists with that email, we&apos;ve sent a password reset link.
                </p>
                <Link to="/login" className="inline-block">
                  <Button variant="outline">Back to Login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                <Button type="submit" className="w-full" loading={loading}>Send Reset Link</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Remember your password? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
