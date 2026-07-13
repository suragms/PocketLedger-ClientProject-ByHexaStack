import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi } from '../../api/goals.api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

interface Props {
  goalId: number;
  goalName: string;
  onClose: () => void;
}

export default function ContributeDialog({ goalId, goalName, onClose }: Props) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');

  const mutation = useMutation({
    mutationFn: () => goalsApi.contribute(goalId, Number(amount)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Contribution added');
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1">Contribute to Goal</h2>
        <p className="text-sm text-muted-foreground mb-4">{goalName}</p>
        <Input
          label="Amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 mt-6">
          <Button
            className="flex-1 min-h-[44px]"
            loading={mutation.isPending}
            disabled={!amount || Number(amount) <= 0}
            onClick={() => mutation.mutate()}
          >
            Add Contribution
          </Button>
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
