import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { reportsApi } from '../../api/reports.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/shared/EmptyState';
import MobileDateRangeSheet from '../../components/reports/MobileDateRangeSheet';
import type { DateRange } from '../../components/reports/MobileDateRangeSheet';
import { formatCurrency, formatPercent, cn } from '../../lib/utils';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  WalletIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function ChangeIndicator({ value, inverse, label, isRateDiff }: { value: number; inverse: boolean; label: string; isRateDiff?: boolean }) {
  const isGood = isRateDiff ? value >= 0 : inverse ? value <= 0 : value >= 0;
  const isNeutral = Math.abs(value) < 0.1;
  return (
    <div className="flex items-center justify-center gap-0.5 mt-1">
      {isNeutral ? (
        <span className="text-[10px] text-muted-foreground">— vs {label}</span>
      ) : (
        <>
          {isGood ? (
            <ArrowUpIcon className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownIcon className="h-3 w-3 text-red-500" />
          )}
          <span className={`text-[10px] ${isGood ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(value).toFixed(1)}% vs {label}
          </span>
        </>
      )}
    </div>
  );
}

interface TouchLegendProps {
  payload?: Array<{ value: string; color: string; type?: string }>;
  hiddenSeries: Record<string, boolean>;
  onToggle: (key: string) => void;
}

function TouchLegend({ payload, hiddenSeries, onToggle }: TouchLegendProps) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-3">
      {payload.map((entry) => (
        <button
          key={entry.value}
          onClick={() => onToggle(entry.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 min-h-[36px]',
            hiddenSeries[entry.value]
              ? 'bg-muted text-muted-foreground opacity-50'
              : 'bg-muted text-foreground active:scale-95'
          )}
          aria-label={`Toggle ${entry.value}`}
        >
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full shrink-0 transition-opacity',
              hiddenSeries[entry.value] && 'opacity-40'
            )}
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </button>
      ))}
    </div>
  );
}

const formatTooltip = (value: number) => formatCurrency(value);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFormatter = formatTooltip as any;

const PERIOD_TABS = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom', label: 'Custom' },
] as const;

export default function ReportsPage() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [activeTab, setActiveTab] = useState<string>('this_month');
  const [dateRangeSheetOpen, setDateRangeSheetOpen] = useState(false);

  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: formatLocalDate(startOfMonth(subMonths(new Date(), 3))),
    endDate: formatLocalDate(endOfMonth(new Date())),
    label: 'Last 3 Months',
  });

  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const toggleSeries = useCallback((key: string) => {
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (activeTab) {
      case 'this_month':
        return {
          period: 'monthly',
          startDate: formatLocalDate(startOfMonth(now)),
          endDate: formatLocalDate(endOfMonth(now)),
        };
      case 'last_month': {
        const lastMonth = subMonths(now, 1);
        return {
          period: 'monthly',
          startDate: formatLocalDate(startOfMonth(lastMonth)),
          endDate: formatLocalDate(endOfMonth(lastMonth)),
        };
      }
      case 'custom':
        return {
          period: 'custom',
          startDate: customRange.startDate,
          endDate: customRange.endDate,
        };
      default:
        return { period: 'monthly' };
    }
  }, [activeTab, customRange]);

  const { period, startDate, endDate } = getDateRange();

  const { data, isLoading } = useQuery({
    queryKey: ['reports', period, startDate, endDate],
    queryFn: () => reportsApi.getReport(period, startDate, endDate),
  });

  const csvMutation = useMutation({
    mutationFn: () => reportsApi.exportCsv(period, startDate, endDate),
    onSuccess: (blob) => downloadBlob(blob, `report_${period}.csv`),
    onError: () => toast.error('CSV export failed'),
  });

  const pdfMutation = useMutation({
    mutationFn: () => reportsApi.exportPdf(period, startDate, endDate),
    onSuccess: (blob) => downloadBlob(blob, `report_${period}.pdf`),
    onError: () => toast.error('PDF export failed'),
  });

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success(`Exported ${filename}`);
  };

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setCustomRange(range);
    setActiveTab('custom');
  }, []);

  const report = data?.data;

  const isEmpty = !isLoading && report && report.monthlyBreakdown.length === 0 && report.categoryBreakdown.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Analyze your financial data</p>
          </div>
        </div>

        {isMobile ? (
          <div className="inline-flex rounded-xl bg-muted p-0.5 w-full">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  if (tab.value === 'custom') {
                    setDateRangeSheetOpen(true);
                  } else {
                    setActiveTab(tab.value);
                  }
                }}
                className={cn(
                  'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]',
                  activeTab === tab.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                {PERIOD_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      if (tab.value === 'custom') {
                        setActiveTab(tab.value);
                      } else {
                        setActiveTab(tab.value);
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg border-2 transition-all text-center',
                      activeTab === tab.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                    )}
                  >
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
                {activeTab === 'custom' && (
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(customRange.startDate), 'MMM d')} – {format(new Date(customRange.endDate), 'MMM d, yyyy')}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setDateRangeSheetOpen(true)}>
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />Change
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <EmptyState
          icon={<ChartBarSquareIcon className="h-16 w-16" />}
          title="No data for this period"
          description="Try selecting a different time range or start tracking your income and expenses to see reports here."
          actionLabel="Select Different Period"
          onAction={() => setActiveTab('this_month')}
        />

        <MobileDateRangeSheet
          isOpen={dateRangeSheetOpen}
          onClose={() => setDateRangeSheetOpen(false)}
          value={customRange}
          onChange={handleDateRangeChange}
        />
      </motion.div>
    );
  }

  if (!report) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analyze your financial data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => csvMutation.mutate()} loading={csvMutation.isPending}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => pdfMutation.mutate()} loading={pdfMutation.isPending}>
            <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />PDF
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      {isMobile ? (
        <div className="inline-flex rounded-xl bg-muted p-0.5 w-full">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                if (tab.value === 'custom') {
                  setDateRangeSheetOpen(true);
                } else {
                  setActiveTab(tab.value);
                }
              }}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]',
                activeTab === tab.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    if (tab.value === 'custom') {
                      setActiveTab(tab.value);
                    } else {
                      setActiveTab(tab.value);
                    }
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg border-2 transition-all text-center',
                    activeTab === tab.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
              {activeTab === 'custom' && (
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(customRange.startDate), 'MMM d')} – {format(new Date(customRange.endDate), 'MMM d, yyyy')}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setDateRangeSheetOpen(true)}>
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />Change
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Income</p>
            <p className="text-sm md:text-lg font-bold text-green-600">{formatCurrency(report.totalIncome)}</p>
            {report.previousPeriod && (
              <ChangeIndicator value={report.previousPeriod.incomeChangePercent} inverse={false} label={report.previousPeriod.label} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-2">
              <BanknotesIcon className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Expenses</p>
            <p className="text-sm md:text-lg font-bold text-red-600">{formatCurrency(report.totalExpense)}</p>
            {report.previousPeriod && (
              <ChangeIndicator value={report.previousPeriod.expenseChangePercent} inverse={true} label={report.previousPeriod.label} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Net Income</p>
            <p className={`text-sm md:text-lg font-bold ${report.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(report.netIncome)}
            </p>
            {report.previousPeriod && (
              <ChangeIndicator value={report.previousPeriod.netChangePercent} inverse={false} label={report.previousPeriod.label} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
              <WalletIcon className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Savings Rate</p>
            <p className="text-sm md:text-lg font-bold text-purple-600">{formatPercent(report.savingsRate)}</p>
            {report.previousPeriod && (
              <ChangeIndicator value={report.previousPeriod.savingsRate - report.savingsRate} inverse={false} label={report.previousPeriod.label} isRateDiff />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {report.monthlyBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No data for this period</p>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
                <BarChart data={report.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={isMobile ? 10 : 11} tickLine={false} interval={isMobile ? 'preserveStartEnd' : 0} />
                  <YAxis fontSize={isMobile ? 10 : 11} tickLine={false} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} width={isMobile ? 35 : 40} />
                  <Tooltip formatter={tooltipFormatter} />
                  {!isMobile && <Legend />}
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} hide={hiddenSeries['Income']} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} hide={hiddenSeries['Expense']} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {isMobile && report.monthlyBreakdown.length > 0 && (
              <TouchLegend
                payload={[
                  { value: 'Income', color: '#22c55e' },
                  { value: 'Expense', color: '#ef4444' },
                ]}
                hiddenSeries={hiddenSeries}
                onToggle={toggleSeries}
              />
            )}
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {report.categoryBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No spending data</p>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
                <PieChart>
                  <Pie
                    data={report.categoryBreakdown}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={2}
                  >
                    {report.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={tooltipFormatter} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {isMobile && report.categoryBreakdown.length > 0 && (
              <TouchLegend
                payload={report.categoryBreakdown.map((c, i) => ({
                  value: c.categoryName,
                  color: c.color || COLORS[i % COLORS.length],
                }))}
                hiddenSeries={hiddenSeries}
                onToggle={toggleSeries}
              />
            )}
          </CardContent>
        </Card>

        {/* Savings Trend Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {report.monthlyBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
                <AreaChart data={report.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={isMobile ? 10 : 11} tickLine={false} interval={isMobile ? 'preserveStartEnd' : 0} />
                  <YAxis fontSize={isMobile ? 10 : 11} tickLine={false} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} width={isMobile ? 35 : 40} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Income" hide={hiddenSeries['Income']} />
                  <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Expense" hide={hiddenSeries['Expense']} />
                  {!isMobile && <Legend />}
                </AreaChart>
              </ResponsiveContainer>
            )}
            {isMobile && report.monthlyBreakdown.length > 0 && (
              <TouchLegend
                payload={[
                  { value: 'Income', color: '#22c55e' },
                  { value: 'Expense', color: '#ef4444' },
                ]}
                hiddenSeries={hiddenSeries}
                onToggle={toggleSeries}
              />
            )}
          </CardContent>
        </Card>

        {/* Wallet Analysis Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wallet Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {report.walletAnalysis.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No wallet data</p>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
                <RadarChart data={report.walletAnalysis}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="accountName" fontSize={isMobile ? 9 : 11} />
                  <PolarRadiusAxis fontSize={isMobile ? 9 : 10} />
                  <Radar name="Balance" dataKey="balance" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} hide={hiddenSeries['Balance']} />
                  <Radar name="Income" dataKey="totalIncome" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} hide={hiddenSeries['Income']} />
                  <Radar name="Expense" dataKey="totalExpense" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} hide={hiddenSeries['Expense']} />
                  {!isMobile && <Legend />}
                  <Tooltip formatter={tooltipFormatter} />
                </RadarChart>
              </ResponsiveContainer>
            )}
            {isMobile && report.walletAnalysis.length > 0 && (
              <TouchLegend
                payload={[
                  { value: 'Balance', color: '#6366f1' },
                  { value: 'Income', color: '#22c55e' },
                  { value: 'Expense', color: '#ef4444' },
                ]}
                hiddenSeries={hiddenSeries}
                onToggle={toggleSeries}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Analysis */}
      {report.budgetAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.budgetAnalysis.map((b) => {
                const progress = Math.min(b.percentUsed, 100);
                return (
                  <div key={b.budgetId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{b.name}</span>
                        {b.categoryName && (
                          <Badge variant="outline" className="text-[10px]">{b.categoryName}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{formatCurrency(b.spentAmount)} / {formatCurrency(b.budgetAmount)}</span>
                        <span className={`font-medium ${b.percentUsed > 100 ? 'text-red-600' : b.percentUsed > 80 ? 'text-amber-600' : 'text-green-600'}`}>
                          {formatPercent(b.percentUsed)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          b.percentUsed > 100 ? 'bg-red-500' : b.percentUsed > 80 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-3">
              {report.monthlyBreakdown.map((m) => (
                <div key={m.month} className="p-3 rounded-xl bg-muted/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{m.month}</span>
                    <span className={`text-sm font-semibold ${m.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(m.net)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-green-600">+{formatCurrency(m.income)}</span>
                    <span className="text-red-600">-{formatCurrency(m.expense)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Month</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Income</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Expense</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {report.monthlyBreakdown.map((m) => (
                    <tr key={m.month} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{m.month}</td>
                      <td className="py-3 px-4 text-right text-green-600">{formatCurrency(m.income)}</td>
                      <td className="py-3 px-4 text-right text-red-600">{formatCurrency(m.expense)}</td>
                      <td className={`py-3 px-4 text-right font-medium ${m.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(m.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.categoryBreakdown.map((c, i) => (
              <div key={c.categoryId} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: c.color || COLORS[i % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{c.categoryName}</span>
                    <span className="text-sm">{formatCurrency(c.amount)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${c.percentage}%`,
                        backgroundColor: c.color || COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{formatPercent(c.percentage)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Date Range Sheet */}
      <MobileDateRangeSheet
        isOpen={dateRangeSheetOpen}
        onClose={() => setDateRangeSheetOpen(false)}
        value={customRange}
        onChange={handleDateRangeChange}
      />
    </motion.div>
  );
}
