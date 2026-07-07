import { useMemo } from 'react';
import { cn } from '../../lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length >= 16) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score <= 5) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => getStrength(password), [password]);
  const percentage = Math.min((strength.score / 7) * 100, 100);

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Password strength</span>
        <span className={cn('text-xs font-medium',
          strength.label === 'Weak' && 'text-red-500',
          strength.label === 'Fair' && 'text-yellow-500',
          strength.label === 'Good' && 'text-blue-500',
          strength.label === 'Strong' && 'text-green-500',
        )}>{strength.label}</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-300', strength.color)}
          style={{ width: `${percentage}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <span className={password.length >= 8 ? 'text-green-500' : ''}>8+ characters</span>
        <span className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>Uppercase letter</span>
        <span className={/[a-z]/.test(password) ? 'text-green-500' : ''}>Lowercase letter</span>
        <span className={/[0-9]/.test(password) ? 'text-green-500' : ''}>Number</span>
        <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-500' : ''}>Special character</span>
      </div>
    </div>
  );
}
