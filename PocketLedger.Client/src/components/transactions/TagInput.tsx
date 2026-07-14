import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '../../api/tags.api';
import { cn } from '../../lib/utils';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TagInputProps {
  value: number[];
  onChange: (tagIds: number[]) => void;
  label?: string;
}

const TAG_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export default function TagInput({ value, onChange, label }: TagInputProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getAll(),
  });

  const allTags = tagsData?.data || [];
  const selectedTags = allTags.filter((t) => value.includes(t.id));
  const filtered = allTags.filter(
    (t) => !value.includes(t.id) && t.name.toLowerCase().includes(search.toLowerCase())
  );

  const createTagMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) => tagsApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      onChange([...value, res.data.id]);
      setNewTagName('');
      setNewTagColor('#6366f1');
      setShowCreate(false);
      toast.success('Tag created');
    },
    onError: () => toast.error('Failed to create tag'),
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const removeTag = (tagId: number) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const addTag = (tagId: number) => {
    onChange([...value, tagId]);
    setSearch('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="w-full relative">
      {label && <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>}

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }}
          >
            {tag.name}
            <button type="button" onClick={() => removeTag(tag.id)} className="hover:opacity-70">
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Search / Add */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search or add tags..."
          className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {isOpen && (
          <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border bg-card shadow-lg max-h-48 overflow-y-auto">
            {filtered.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted text-left"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </button>
            ))}

            {search.trim() && !filtered.some((t) => t.name.toLowerCase() === search.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => { setNewTagName(search.trim()); setShowCreate(true); setIsOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted text-left text-primary"
              >
                <PlusIcon className="h-4 w-4" />
                Create "{search.trim()}"
              </button>
            )}

            {filtered.length === 0 && !search.trim() && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No tags yet. Type to create one.</p>
            )}
          </div>
        )}
      </div>

      {/* Create Tag Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="rounded-xl bg-card p-5 shadow-xl w-full max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Create Tag</h3>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Color</p>
              <div className="flex gap-2">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewTagColor(c)}
                    className={cn('w-7 h-7 rounded-full transition-transform', newTagColor === c && 'ring-2 ring-offset-2 ring-primary scale-110')}
                    style={{ backgroundColor: c }}
                  >
                    {newTagColor === c && <span className="flex items-center justify-center text-white text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-input rounded-xl text-sm font-medium hover:bg-muted">Cancel</button>
              <button
                type="button"
                disabled={!newTagName.trim() || createTagMutation.isPending}
                onClick={() => createTagMutation.mutate({ name: newTagName.trim(), color: newTagColor })}
                className="flex-1 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {createTagMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
