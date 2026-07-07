interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
  options: { value: string; label: string }[];
  filters: { label: string; value: string }[];
}

export default function FilterBar({ activeFilter, onFilterChange, options }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onFilterChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeFilter === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
