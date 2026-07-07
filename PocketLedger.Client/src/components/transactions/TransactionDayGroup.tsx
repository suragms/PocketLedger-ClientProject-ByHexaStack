import { formatCurrency } from '../../lib/utils';
import TransactionItem from './TransactionItem';
import type { Transaction } from '../../types';

interface TransactionDayGroupProps {
  date: string;
  transactions: Transaction[];
  onDelete?: (id: number) => void;
  viewMode?: 'table' | 'card';
}

export default function TransactionDayGroup({ date, transactions, onDelete, viewMode = 'table' }: TransactionDayGroupProps) {
  const dayIncome = transactions.filter((t) => t.type === 0).reduce((sum, t) => sum + t.amount, 0);
  const dayExpense = transactions.filter((t) => t.type === 1).reduce((sum, t) => sum + t.amount, 0);
  const net = dayIncome - dayExpense;

  const dateObj = new Date(date + 'T00:00:00');
  const isToday = dateObj.toDateString() === new Date().toDateString();
  const isYesterday = dateObj.toDateString() === new Date(Date.now() - 86400000).toDateString();

  const dateLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  if (viewMode === 'card') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dateLabel}</span>
          <span className={`text-xs font-medium ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {net >= 0 ? '+' : ''}{formatCurrency(Math.abs(net))}
          </span>
        </div>
        <div className="space-y-2">
          {transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} onDelete={onDelete} viewMode="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 sticky top-0 z-10">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dateLabel}</span>
        <div className="flex items-center gap-3 text-xs">
          {dayIncome > 0 && <span className="text-green-600">+{formatCurrency(dayIncome)}</span>}
          {dayExpense > 0 && <span className="text-red-600">-{formatCurrency(dayExpense)}</span>}
          <span className={`font-medium ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {net >= 0 ? '+' : ''}{formatCurrency(Math.abs(net))}
          </span>
        </div>
      </div>
      <table className="w-full">
        <tbody className="divide-y divide-border/50">
          {transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} onDelete={onDelete} viewMode="table" />
          ))}
        </tbody>
      </table>
    </div>
  );
}
