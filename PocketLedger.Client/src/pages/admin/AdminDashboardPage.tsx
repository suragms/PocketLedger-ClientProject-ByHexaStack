import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../app/hooks';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { UsersIcon, ArrowPathIcon, BanknotesIcon, FolderIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function AdminDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'text-blue-500' },
    { label: 'Active Users', value: stats?.activeUsers || 0, icon: UsersIcon, color: 'text-green-500' },
    { label: 'Transactions', value: stats?.totalTransactions || 0, icon: ArrowPathIcon, color: 'text-purple-500' },
    { label: 'Wallets', value: stats?.totalWallets || 0, icon: BanknotesIcon, color: 'text-orange-500' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: FolderIcon, color: 'text-pink-500' },
    { label: 'Budgets', value: stats?.totalBudgets || 0, icon: ChartBarIcon, color: 'text-cyan-500' },
    { label: 'Audit Logs', value: stats?.auditLogCount || 0, icon: ShieldCheckIcon, color: 'text-amber-500' },
    { label: 'New Today', value: stats?.newUsersToday || 0, icon: UsersIcon, color: 'text-emerald-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.firstName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
                  </div>
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.dailyStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Users', value: stats?.totalUsers || 0 },
                    { name: 'Transactions', value: stats?.totalTransactions || 0 },
                    { name: 'Categories', value: stats?.totalCategories || 0 },
                    { name: 'Wallets', value: stats?.totalWallets || 0 },
                    { name: 'Budgets', value: stats?.totalBudgets || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                >
                  {[0, 1, 2, 3, 4].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(stats?.topUsers || []).map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                <p className="text-sm text-muted-foreground">{u.transactionCount} transactions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
