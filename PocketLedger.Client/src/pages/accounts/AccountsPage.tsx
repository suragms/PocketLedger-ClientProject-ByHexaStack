import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { accountsApi } from '../../api/accounts.api';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import { formatCurrency } from '../../lib/utils';
import { ACCOUNT_TYPES } from '../../lib/constants';
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['accounts', page, debouncedSearch],
    queryFn: () => accountsApi.getAll({ page, pageSize: 10, search: debouncedSearch }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account deleted');
    },
  });

  const accounts = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Link to="/accounts/new">
          <Button><PlusIcon className="h-4 w-4 mr-2" />Add Account</Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input placeholder="Search accounts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={<MagnifyingGlassIcon className="h-4 w-4" />} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState title="No accounts found" description="Create your first account to get started" actionLabel="Add Account" onAction={() => {}} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: account.color || '#6366f1' }}>
                      <span className="text-white font-bold">{account.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">{ACCOUNT_TYPES.find((t) => t.value === account.type)?.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/accounts/${account.id}/edit`} className="p-1.5 rounded-lg hover:bg-muted">
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button onClick={() => { if (confirm('Delete this account?')) deleteMutation.mutate(account.id); }}
                      className="p-1.5 rounded-lg hover:bg-muted text-destructive">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${account.balance >= 0 ? '' : 'text-destructive'}`}>
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </motion.div>
  );
}
