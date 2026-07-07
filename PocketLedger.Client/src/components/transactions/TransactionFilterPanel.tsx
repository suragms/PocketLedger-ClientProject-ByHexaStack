import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FunnelIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { categoriesApi } from '../../api/categories.api';
import { accountsApi } from '../../api/accounts.api';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { TRANSACTION_TYPES, SORT_OPTIONS } from '../../lib/constants';
import type { TransactionFilters } from '../../types';

interface TransactionFilterPanelProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClear: () => void;
}

export default function TransactionFilterPanel({ filters, onFiltersChange, onClear }: TransactionFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: accountsData } = useQuery({
    queryKey: ['accounts-dropdown'],
    queryFn: () => accountsApi.getAll({ page: 1, pageSize: 100 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: () => categoriesApi.getAll(),
  });

  const accounts = accountsData?.data?.items || [];
  const categories = categoriesData?.data || [];

  const activeFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.type !== undefined,
    filters.accountId,
    filters.categoryId,
    filters.minAmount,
    filters.maxAmount,
    filters.search,
    filters.sortBy,
  ].filter(Boolean).length;

  const updateFilter = (key: keyof TransactionFilters, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const sortValue = filters.sortBy
    ? `${filters.sortBy}_${filters.sortOrder || 'desc'}`
    : '';

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            isExpanded || activeFilterCount > 0
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border hover:bg-muted'
          }`}
        >
          <FunnelIcon className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="outline" className="ml-1 px-1.5 py-0 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Quick Type Filters */}
        <div className="flex gap-1">
          <button
            onClick={() => updateFilter('type', undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filters.type === undefined ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            All
          </button>
          {TRANSACTION_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => updateFilter('type', filters.type === t.value ? undefined : t.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.type === t.value
                  ? t.value === 0 ? 'bg-green-600 text-white' : t.value === 1 ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto">
          <Select
            options={[{ value: '', label: 'Sort by...' }, ...SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label }))]}
            value={sortValue}
            onChange={(e) => {
              const opt = SORT_OPTIONS.find((s) => s.value === e.target.value);
              if (opt) {
                onFiltersChange({ ...filters, sortBy: opt.sortBy, sortOrder: opt.sortOrder });
              } else {
                onFiltersChange({ ...filters, sortBy: undefined, sortOrder: undefined });
              }
            }}
            className="w-48 h-9 text-xs"
          />
        </div>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
            <XMarkIcon className="h-3.5 w-3.5 mr-1" />Clear
          </Button>
        )}
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="p-4 rounded-xl border bg-card grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => updateFilter('startDate', e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => updateFilter('endDate', e.target.value)}
          />
          <Select
            label="Account"
            placeholder="All accounts"
            options={accounts.map((a: any) => ({ value: a.id, label: a.name }))}
            value={filters.accountId || ''}
            onChange={(e) => updateFilter('accountId', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Select
            label="Category"
            placeholder="All categories"
            options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
            value={filters.categoryId || ''}
            onChange={(e) => updateFilter('categoryId', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            label="Min Amount"
            type="number"
            placeholder="0.00"
            value={filters.minAmount || ''}
            onChange={(e) => updateFilter('minAmount', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            label="Max Amount"
            type="number"
            placeholder="999999.99"
            value={filters.maxAmount || ''}
            onChange={(e) => updateFilter('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      )}

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && !isExpanded && (
        <div className="flex flex-wrap gap-1.5">
          {filters.startDate && (
            <Badge variant="outline" className="text-[10px]">
              From: {filters.startDate}
              <button onClick={() => updateFilter('startDate', undefined)} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="outline" className="text-[10px]">
              To: {filters.endDate}
              <button onClick={() => updateFilter('endDate', undefined)} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {filters.type !== undefined && (
            <Badge variant="outline" className="text-[10px]">
              {TRANSACTION_TYPES.find((t) => t.value === filters.type)?.label}
              <button onClick={() => updateFilter('type', undefined)} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {filters.accountId && (
            <Badge variant="outline" className="text-[10px]">
              {accounts.find((a: any) => a.id === filters.accountId)?.name || 'Account'}
              <button onClick={() => updateFilter('accountId', undefined)} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {filters.categoryId && (
            <Badge variant="outline" className="text-[10px]">
              {categories.find((c: any) => c.id === filters.categoryId)?.name || 'Category'}
              <button onClick={() => updateFilter('categoryId', undefined)} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {(filters.minAmount || filters.maxAmount) && (
            <Badge variant="outline" className="text-[10px]">
              ${filters.minAmount || 0} - ${filters.maxAmount || '∞'}
              <button onClick={() => { updateFilter('minAmount', undefined); updateFilter('maxAmount', undefined); }} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
