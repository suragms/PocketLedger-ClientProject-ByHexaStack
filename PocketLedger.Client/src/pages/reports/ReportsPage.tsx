import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { reportsApi } from '../../api/reports.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { REPORT_PERIODS } from '../../lib/constants';
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
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

const formatTooltip = (value: number) => formatCurrency(value);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFormatter = formatTooltip as any;

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 12);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const startDate = period === 'custom' ? customStart : undefined;
  const endDate = period === 'custom' ? customEnd : undefined;

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

  const report = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
        </div>
      </div>
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
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {REPORT_PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg border-2 transition-all text-center ${
                  period === p.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                <span className="text-sm font-medium">{p.label}</span>
                <span className="text-[10px]">{p.description}</span>
              </button>
            ))}
            {period === 'custom' && (
              <div className="flex items-center gap-2 ml-4">
                <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-40 h-9" />
                <span className="text-muted-foreground">to</span>
                <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-40 h-9" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Income</p>
            <p className="text-sm md:text-lg font-bold text-green-600">{formatCurrency(report.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-2">
              <BanknotesIcon className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Expenses</p>
            <p className="text-sm md:text-lg font-bold text-red-600">{formatCurrency(report.totalExpense)}</p>
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
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
              <WalletIcon className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Savings Rate</p>
            <p className="text-sm md:text-lg font-bold text-purple-600">{formatPercent(report.savingsRate)}</p>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} />
                  <YAxis fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.categoryBreakdown}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
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
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={report.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} />
                  <YAxis fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Income" />
                  <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Expense" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={report.walletAnalysis}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="accountName" fontSize={11} />
                  <PolarRadiusAxis fontSize={10} />
                  <Radar name="Balance" dataKey="balance" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Radar name="Income" dataKey="totalIncome" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  <Radar name="Expense" dataKey="totalExpense" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                  <Legend />
                  <Tooltip formatter={tooltipFormatter} />
                </RadarChart>
              </ResponsiveContainer>
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
    </motion.div>
  );
}
