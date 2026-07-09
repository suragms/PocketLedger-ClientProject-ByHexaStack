import { useNavigate } from 'react-router-dom';
import AdaptiveSheet from '../ui/AdaptiveSheet';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickAddSheet({ isOpen, onClose }: Props) {
  const navigate = useNavigate();

  const handleSelect = (type: number) => {
    onClose();
    navigate(`/transactions/new?type=${type}`);
  };

  return (
    <AdaptiveSheet isOpen={isOpen} onClose={onClose} title="New Transaction" size="sm">
      <div className="space-y-3 mt-2">
        <button
          onClick={() => handleSelect(0)}
          className="flex w-full items-center gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted touch-target"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
            <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-base">Add Income</p>
            <p className="text-sm text-muted-foreground">Record money received</p>
          </div>
        </button>
        <button
          onClick={() => handleSelect(1)}
          className="flex w-full items-center gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:bg-muted touch-target"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
            <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-base">Add Expense</p>
            <p className="text-sm text-muted-foreground">Record money spent</p>
          </div>
        </button>
      </div>
    </AdaptiveSheet>
  );
}
