import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('monthly');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => adminApi.getAnalytics(period),
  });

  const analytics = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {['weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{analytics?.userGrowth.totalUsers || 0}</p>
            <p className="text-xs text-green-500 mt-1">+{analytics?.userGrowth.growthRate || 0}% growth</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold">{analytics?.userGrowth.activeUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Accounts</p>
            <p className="text-2xl font-bold">{analytics?.systemHealth.totalAccounts || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">System Uptime</p>
            <p className="text-2xl font-bold">{analytics?.systemHealth.uptime || 99.9}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.userGrowth.monthlyGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Transaction Volume</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.transactionAnalytics.monthlyVolume || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{analytics?.systemHealth.totalAccounts || 0}</p>
              <p className="text-sm text-muted-foreground">Accounts</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{analytics?.systemHealth.totalCategories || 0}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{analytics?.systemHealth.totalBudgets || 0}</p>
              <p className="text-sm text-muted-foreground">Budgets</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{analytics?.systemHealth.activeNotifications || 0}</p>
              <p className="text-sm text-muted-foreground">Notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
