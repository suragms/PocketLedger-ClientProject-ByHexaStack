import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { XMarkIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface MobileDateRangeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const DRAG_THRESHOLD = 150;

const QUICK_PRESETS: { label: string; getRange: () => { start: Date; end: Date } }[] = [
  {
    label: 'This Week',
    getRange: () => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) }),
  },
  {
    label: 'Last Week',
    getRange: () => ({
      start: startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
      end: endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
    }),
  },
  {
    label: 'This Month',
    getRange: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }),
  },
  {
    label: 'Last Month',
    getRange: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }),
  },
  {
    label: 'Last 3 Months',
    getRange: () => ({ start: startOfMonth(subMonths(new Date(), 2)), end: endOfMonth(new Date()) }),
  },
  {
    label: 'This Quarter',
    getRange: () => ({ start: startOfQuarter(new Date()), end: endOfQuarter(new Date()) }),
  },
  {
    label: 'This Year',
    getRange: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }),
  },
];

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function MobileDateRangeSheet({
  isOpen,
  onClose,
  value,
  onChange,
}: MobileDateRangeSheetProps) {
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);

  useEffect(() => {
    if (isOpen) {
      setCustomStart(value.startDate);
      setCustomEnd(value.endDate);
      setMode('presets');
    }
  }, [isOpen, value.startDate, value.endDate]);

  const handlePresetSelect = useCallback(
    (preset: (typeof QUICK_PRESETS)[number]) => {
      const range = preset.getRange();
      const startStr = formatLocalDate(range.start);
      const endStr = formatLocalDate(range.end);
      onChange({ startDate: startStr, endDate: endStr, label: preset.label });
      onClose();
    },
    [onChange, onClose]
  );

  const handleCustomApply = useCallback(() => {
    if (customStart && customEnd) {
      onChange({ startDate: customStart, endDate: customEnd, label: 'Custom Range' });
      onClose();
    }
  }, [customStart, customEnd, onChange, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_THRESHOLD) onClose();
  };

  const isCustomValid = customStart && customEnd && customStart <= customEnd;

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
              <h2 className="text-lg font-semibold">Date Range</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="px-4 pb-3">
              <div className="inline-flex rounded-xl bg-muted p-0.5 w-full">
                <button
                  onClick={() => setMode('presets')}
                  className={cn(
                    'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]',
                    mode === 'presets'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Quick Select
                </button>
                <button
                  onClick={() => setMode('custom')}
                  className={cn(
                    'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]',
                    mode === 'custom'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Custom Range
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {mode === 'presets' ? (
                <div className="space-y-2">
                  {QUICK_PRESETS.map((preset) => {
                    const range = preset.getRange();
                    const startStr = formatLocalDate(range.start);
                    const endStr = formatLocalDate(range.end);
                    const isSelected = value.startDate === startStr && value.endDate === endStr;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => handlePresetSelect(preset)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150 min-h-[52px]',
                          isSelected
                            ? 'bg-primary/10 ring-2 ring-primary text-primary'
                            : 'bg-muted/50 hover:bg-muted active:scale-[0.98] text-foreground'
                        )}
                      >
                        <CalendarDaysIcon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{preset.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(range.start, 'MMM d')} – {format(range.end, 'MMM d, yyyy')}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                  {customStart && customEnd && customStart > customEnd && (
                    <p className="text-sm text-destructive">End date must be after start date</p>
                  )}
                </div>
              )}
            </div>

            {mode === 'custom' && (
              <div
                className="px-4 pt-3 pb-2 border-t"
                style={{ paddingBottom: 'max(var(--safe-area-bottom), 8px)' }}
              >
                <Button
                  className="w-full min-h-[48px]"
                  onClick={handleCustomApply}
                  disabled={!isCustomValid}
                >
                  Apply Date Range
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
