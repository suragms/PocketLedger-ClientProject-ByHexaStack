import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function AdminReportsPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard-reports'],
    queryFn: () => adminApi.getDashboard(),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics-reports'],
    queryFn: () => adminApi.getAnalytics('monthly'),
  });

  const handleExport = async () => {
    try {
      const result = await adminApi.exportData('all');
      if (result.data) {
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = result.data.fileName;
        link.click();
        toast.success('Report exported!');
      }
    } catch {
      toast.error('Export failed');
    }
  };

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

  const stats = dashboardData?.data;
  const analytics = analyticsData?.data;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button onClick={handleExport}>
          <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />Export All Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{stats?.totalTransactions || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Growth Rate</p>
            <p className="text-2xl font-bold">{analytics?.userGrowth.growthRate || 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Daily Activity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.dailyStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} name="Users" />
                <Bar dataKey="transactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>System Distribution</CardTitle></CardHeader>
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
                  cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                >
                  {[0, 1, 2, 3, 4].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
