import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { register as registerUser, clearError } from '../../features/auth/authSlice';
import { registerSchema, type RegisterInput } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { Card, CardContent } from '../../components/ui/Card';
import { BanknotesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const onSubmit = (data: RegisterInput) => { dispatch(registerUser(data)); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <BanknotesIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">Start managing your finances</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" error={errors.firstName?.message} {...register('firstName')} />
                <Input label="Last Name" placeholder="Doe" error={errors.lastName?.message} {...register('lastName')} />
              </div>
              <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
              <div>
                <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Create a password"
                  error={errors.password?.message} {...register('password')}
                  icon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground">
                    {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>} />
                <div className="mt-2"><PasswordStrengthMeter password={password} /></div>
              </div>
              <Input label="Confirm Password" type="password" placeholder="Confirm your password"
                error={errors.confirmPassword?.message} {...register('confirmPassword')} />
              <Button type="submit" className="w-full" loading={loading}>Create Account</Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
