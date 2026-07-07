import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts.api';
import { accountSchema } from '../../lib/validators';
import type { AccountInput } from '../../lib/validators';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { ACCOUNT_TYPES } from '../../lib/constants';
import toast from 'react-hot-toast';

export default function AccountFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: existingAccount } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.getById(Number(id)),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', type: 0, balance: 0, currency: 'USD', includeInBalance: true },
  });

  useEffect(() => {
    if (existingAccount?.data) {
      const a = existingAccount.data;
      reset({ name: a.name, description: a.description, type: a.type, balance: a.balance, currency: a.currency, color: a.color, includeInBalance: a.includeInBalance });
    }
  }, [existingAccount, reset]);

  const mutation = useMutation({
    mutationFn: (data: AccountInput) => isEdit ? accountsApi.update(Number(id), data) : accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(isEdit ? 'Account updated' : 'Account created');
      navigate('/accounts');
    },
  });

  const onSubmit = (data: AccountInput) => mutation.mutate(data);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{isEdit ? 'Edit Account' : 'New Account'}</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Account Name" placeholder="My Checking Account" error={errors.name?.message} {...register('name')} />
            <Input label="Description" placeholder="Optional description" {...register('description')} />
            <Select label="Account Type" options={ACCOUNT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              error={errors.type?.message} {...register('type', { valueAsNumber: true })} />
            <Input label="Initial Balance" type="number" step="0.01" error={errors.balance?.message}
              {...register('balance', { valueAsNumber: true })} />
            <div className="flex gap-4">
              <Button type="submit" loading={mutation.isPending}>{isEdit ? 'Update' : 'Create'} Account</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/accounts')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
