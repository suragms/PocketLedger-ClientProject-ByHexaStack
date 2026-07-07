import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login, clearError } from '../../features/auth/authSlice';
import { loginSchema, type LoginInput } from '../../lib/validators';
import { authApi } from '../../api/auth.api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PinInput from '../../components/auth/PinInput';
import { Card, CardContent } from '../../components/ui/Card';
import { BanknotesIcon, KeyIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  const [loginMode, setLoginMode] = useState<'password' | 'pin'>('password');
  const [pinEmail, setPinEmail] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pin, setPin] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const userStr = localStorage.getItem('user');
      let userObj = null;
      try {
        userObj = userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        userObj = null;
      }
      if (userObj?.roles?.includes('Admin')) {
        navigate('/urlAdmin26');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const onSubmitPassword = (data: LoginInput) => { dispatch(login(data)); };

  const handlePinLogin = async () => {
    if (pin.length !== 4 || !pinEmail) return;
    setPinLoading(true);
    try {
      const response = await authApi.loginWithPin({ email: pinEmail, pin });
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      window.location.href = response.user?.roles?.includes('Admin') ? '/urlAdmin26' : '/';
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'PIN login failed');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <BanknotesIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to PocketLedger</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setLoginMode('password')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${loginMode === 'password' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            <EnvelopeIcon className="h-4 w-4 inline mr-2" />Password
          </button>
          <button onClick={() => setLoginMode('pin')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${loginMode === 'pin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            <KeyIcon className="h-4 w-4 inline mr-2" />PIN
          </button>
        </div>

        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {loginMode === 'password' ? (
                <motion.form key="password" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                  <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                  <Input label="Password" type="password" placeholder="Enter your password" error={errors.password?.message} {...register('password')} />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-input" {...register('rememberMe')} />
                      <span className="text-sm text-muted-foreground">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <Button type="submit" className="w-full" loading={loading}>Sign in</Button>
                </motion.form>
              ) : (
                <motion.div key="pin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <Input label="Email" type="email" placeholder="your@email.com" value={pinEmail}
                    onChange={(e) => setPinEmail(e.target.value)} icon={<EnvelopeIcon className="h-4 w-4" />} />
                  <div>
                    <label className="block text-sm font-medium mb-2 text-center">Enter your 4-digit PIN</label>
                    <PinInput value={pin} onChange={setPin} />
                  </div>
                  <Button onClick={handlePinLogin} className="w-full" loading={pinLoading}
                    disabled={pin.length !== 4 || !pinEmail}>Sign in with PIN</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don&apos;t have an account? <Link to="/register" className="text-primary hover:underline font-medium">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
