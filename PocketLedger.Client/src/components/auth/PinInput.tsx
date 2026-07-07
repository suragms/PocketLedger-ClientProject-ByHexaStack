import { useState, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
}

export default function PinInput({ length = 4, value, onChange, error, disabled, label = 'PIN' }: PinInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback((index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    const newValue = value.split('');
    newValue[index] = digit;
    const result = newValue.join('').slice(0, length);
    onChange(result);
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [value, length, onChange]);

  const handleKeyDown = useCallback((index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [value]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  }, [length, onChange]);

  return (
    <div className="space-y-1">
      <label className="sr-only" id={`pin-label`}>{label}</label>
      <div className="flex gap-2 justify-center" role="group" aria-labelledby="pin-label">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={!!error}
            className={cn(
              'w-12 h-12 text-center text-lg font-mono rounded-lg border bg-transparent',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-destructive' : focused ? 'border-primary' : 'border-input'
            )}
          />
        ))}
      </div>
      {error && <p className="text-sm text-destructive text-center" role="alert">{error}</p>}
    </div>
  );
}
