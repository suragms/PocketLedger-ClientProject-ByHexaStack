import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth.api';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { BanknotesIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const userId = searchParams.get('userId') || '';
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!userId || !token) { setStatus('error'); return; }
    authApi.verifyEmail({ userId, token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [userId, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <BanknotesIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Email Verification</h1>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <Spinner size="lg" />
                <p className="text-muted-foreground">Verifying your email...</p>
              </div>
            )}
            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
                <h2 className="text-lg font-semibold">Email Verified!</h2>
                <p className="text-muted-foreground text-sm">Your email has been verified successfully.</p>
                <Link to="/login"><Button>Sign In</Button></Link>
              </div>
            )}
            {status === 'error' && (
              <div className="space-y-4">
                <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
                <h2 className="text-lg font-semibold">Verification Failed</h2>
                <p className="text-muted-foreground text-sm">This verification link is invalid or has expired.</p>
                <Link to="/login"><Button variant="outline">Back to Login</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
