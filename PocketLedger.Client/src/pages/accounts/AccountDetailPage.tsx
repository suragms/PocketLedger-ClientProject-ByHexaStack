import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';
import { ACCOUNT_TYPES } from '../../lib/constants';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AccountDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.getById(Number(id)),
    enabled: !!id,
  });

  const account = data?.data;

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!account) return <p className="text-muted-foreground">Account not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/accounts" className="p-2 rounded-lg hover:bg-muted"><ArrowLeftIcon className="h-5 w-5" /></Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{account.name}</h1>
          <p className="text-muted-foreground">{ACCOUNT_TYPES.find((t) => t.value === account.type)?.label}</p>
        </div>
        <Link to={`/accounts/${account.id}/edit`}>
          <Button variant="outline"><PencilIcon className="h-4 w-4 mr-2" />Edit</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <p className={`text-4xl font-bold ${account.balance >= 0 ? '' : 'text-destructive'}`}>
              {formatCurrency(account.balance, account.currency)}
            </p>
          </div>
        </CardContent>
      </Card>

      {account.description && (
        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent><p>{account.description}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
