import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD', locale?: string): string {
  return new Intl.NumberFormat(locale || navigator.language, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, locale?: string): string {
  return new Date(date).toLocaleDateString(locale || navigator.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date, locale?: string): string {
  return new Date(date).toLocaleDateString(locale || navigator.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatCompactNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale || navigator.language, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}
