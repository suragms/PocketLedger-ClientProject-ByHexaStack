import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PencilIcon, TrashIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../lib/utils';
import type { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: number) => void;
  viewMode?: 'table' | 'card';
}

export default function TransactionItem({ transaction, onDelete, viewMode = 'table' }: TransactionItemProps) {
  const isIncome = transaction.type === 0;
  const isExpense = transaction.type === 1;

  if (viewMode === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: transaction.categoryColor || (isIncome ? '#22c55e' : isExpense ? '#ef4444' : '#3b82f6') + '20' }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: transaction.categoryColor || (isIncome ? '#22c55e' : isExpense ? '#ef4444' : '#3b82f6') }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">
              {transaction.payee || transaction.note || 'Transaction'}
            </p>
            {transaction.receiptUrl && (
              <ReceiptPercentIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-muted-foreground truncate">{transaction.accountName}</span>
            {transaction.categoryName && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground truncate">{transaction.categoryName}</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className={`text-sm font-semibold ${isIncome ? 'text-green-600' : isExpense ? 'text-red-600' : 'text-blue-600'}`}>
            {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrency(transaction.amount, transaction.currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/transactions/${transaction.id}/edit`}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Table row view
  return (
    <tr className="group hover:bg-muted/30 transition-colors">
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: (transaction.categoryColor || (isIncome ? '#22c55e' : '#ef4444')) + '20' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: transaction.categoryColor || (isIncome ? '#22c55e' : '#ef4444') }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[200px]">
              {transaction.payee || transaction.note || 'Transaction'}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {transaction.note || transaction.payee || '—'}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className="text-sm text-muted-foreground">{transaction.accountName}</span>
      </td>
      <td className="py-3 px-3">
        {transaction.categoryName ? (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: transaction.categoryColor || '#6b7280' }}
            />
            {transaction.categoryName}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-3">
        <span className="text-sm text-muted-foreground">
          {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </td>
      <td className="py-3 px-3 text-right">
        <span className={`text-sm font-semibold ${isIncome ? 'text-green-600' : isExpense ? 'text-red-600' : 'text-blue-600'}`}>
          {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrency(transaction.amount, transaction.currency)}
        </span>
      </td>
      <td className="py-3 pr-4 pl-3">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {transaction.receiptUrl && (
            <ReceiptPercentIcon className="h-4 w-4 text-muted-foreground mr-1" />
          )}
          <Link
            to={`/transactions/${transaction.id}/edit`}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
