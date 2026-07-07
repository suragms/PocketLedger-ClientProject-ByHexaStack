import Button from './Button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage?: number;
  page?: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showEllipsis?: boolean;
}

export default function Pagination({ currentPage, page, totalPages, onPageChange, showEllipsis = true }: PaginationProps) {
  const currentPageNum = currentPage ?? page ?? 1;

  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (!showEllipsis || totalPages <= 7) {
    for (let i = 1; i <= Math.min(totalPages, 7); i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPageNum > 3) pages.push('...');
    for (let i = Math.max(2, currentPageNum - 1); i <= Math.min(totalPages - 1, currentPageNum + 1); i++) {
      pages.push(i);
    }
    if (currentPageNum < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPageNum - 1)}
        disabled={currentPageNum === 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
      </Button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-muted-foreground" aria-hidden="true">...</span>
        ) : (
          <Button
            key={p}
            variant={p === currentPageNum ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p)}
            aria-current={p === currentPageNum ? 'page' : undefined}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPageNum + 1)}
        disabled={currentPageNum === totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
