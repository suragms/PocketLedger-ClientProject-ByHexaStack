import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { categoriesApi } from '../../api/categories.api';
import { accountsApi } from '../../api/accounts.api';
import { tagsApi } from '../../api/tags.api';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { TRANSACTION_TYPES, SORT_OPTIONS } from '../../lib/constants';
import type { TransactionFilters } from '../../types';
import type { Category, Account, Tag } from '../../types';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClear: () => void;
}

const DRAG_THRESHOLD = 150;

export default function MobileFilterSheet({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClear,
}: MobileFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  useEffect(() => {
    if (isOpen) setLocalFilters(filters);
  }, [isOpen, filters]);

  const { data: accountsData } = useQuery({
    queryKey: ['accounts-dropdown'],
    queryFn: () => accountsApi.getAll({ page: 1, pageSize: 100 }),
    enabled: isOpen,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: () => categoriesApi.getAll(),
    enabled: isOpen,
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getAll(),
    enabled: isOpen,
  });

  const accounts = accountsData?.data?.items ?? [];
  const categories = categoriesData?.data ?? [];
  const tags = tagsData?.data ?? [];

  const updateFilter = useCallback(
    (key: keyof TransactionFilters, value: string | number | undefined) => {
      setLocalFilters((prev) => ({ ...prev, [key]: value || undefined }));
    },
    []
  );

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_THRESHOLD) onClose();
  };

  const sortValue = localFilters.sortBy
    ? `${localFilters.sortBy}_${localFilters.sortOrder || 'desc'}`
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-2xl bg-card shadow-xl"
            style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top, 0px))' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="flex items-center justify-between px-4 pb-3">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close filters"
              >
                <XMarkIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Type</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateFilter('type', undefined)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                      localFilters.type === undefined
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    All
                  </button>
                  {TRANSACTION_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() =>
                        updateFilter('type', localFilters.type === t.value ? undefined : t.value)
                      }
                      className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                        localFilters.type === t.value
                          ? t.value === 0
                            ? 'bg-green-600 text-white shadow-sm'
                            : t.value === 1
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-blue-600 text-white shadow-sm'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                />
              </div>

              <Select
                label="Account"
                placeholder="All accounts"
                options={accounts.map((a: Account) => ({ value: a.id, label: a.name }))}
                value={localFilters.accountId || ''}
                onChange={(e) =>
                  updateFilter('accountId', e.target.value ? Number(e.target.value) : undefined)
                }
              />

              <Select
                label="Category"
                placeholder="All categories"
                options={categories.map((c: Category) => ({ value: c.id, label: c.name }))}
                value={localFilters.categoryId || ''}
                onChange={(e) =>
                  updateFilter('categoryId', e.target.value ? Number(e.target.value) : undefined)
                }
              />

              <Select
                label="Tag"
                placeholder="All tags"
                options={tags.map((t: Tag) => ({ value: t.id, label: t.name }))}
                value={localFilters.tagId || ''}
                onChange={(e) =>
                  updateFilter('tagId', e.target.value ? Number(e.target.value) : undefined)
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Amount"
                  type="number"
                  placeholder="0.00"
                  value={localFilters.minAmount || ''}
                  onChange={(e) =>
                    updateFilter('minAmount', e.target.value ? Number(e.target.value) : undefined)
                  }
                />
                <Input
                  label="Max Amount"
                  type="number"
                  placeholder="999999.99"
                  value={localFilters.maxAmount || ''}
                  onChange={(e) =>
                    updateFilter('maxAmount', e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>

              <Select
                label="Sort By"
                options={[
                  { value: '', label: 'Sort by...' },
                  ...SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
                ]}
                value={sortValue}
                onChange={(e) => {
                  const opt = SORT_OPTIONS.find((s) => s.value === e.target.value);
                  if (opt) {
                    updateFilter('sortBy', opt.sortBy);
                    updateFilter('sortOrder', opt.sortOrder);
                  } else {
                    updateFilter('sortBy', undefined);
                    updateFilter('sortOrder', undefined);
                  }
                }}
              />
            </div>

            <div
              className="px-4 pt-3 pb-2 border-t flex gap-3"
              style={{ paddingBottom: 'max(var(--safe-area-bottom), 8px)' }}
            >
              <Button variant="outline" className="flex-1" onClick={handleClear}>
                Clear All
              </Button>
              <Button className="flex-1" onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
