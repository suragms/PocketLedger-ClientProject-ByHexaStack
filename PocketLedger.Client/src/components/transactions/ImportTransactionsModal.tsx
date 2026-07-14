import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../../api/transactions.api';
import { accountsApi } from '../../api/accounts.api';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { ImportResult } from '../../types';

interface ColumnMapping {
  dateColumn: number;
  descriptionColumn: number;
  amountColumn: number;
  typeColumn: number;
  categoryColumn?: number;
}

type Step = 'upload' | 'mapping' | 'preview' | 'results';

export default function ImportTransactionsModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [accountId, setAccountId] = useState<number>(0);
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateColumn: 0, descriptionColumn: 1, amountColumn: 2, typeColumn: 3,
  });
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const { data: accountsData } = useQuery({
    queryKey: ['accounts-dropdown'],
    queryFn: () => accountsApi.getAll({ page: 1, pageSize: 100 }),
  });
  const accounts = (accountsData?.data?.items || []).filter((a: any) => !a.isArchived);

  const importMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected');
      return transactionsApi.importFromCsv(file, accountId, {
        ...mapping,
        categoryColumn: mapping.categoryColumn,
        hasHeaderRow,
      });
    },
    onSuccess: (response) => {
      setResult(response.data);
      setStep('results');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Import failed');
    },
  });

  const parseFile = useCallback((f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length === 0) {
        toast.error('File is empty');
        return;
      }
      const parsed = lines.map((l) => {
        const fields: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < l.length; i++) {
          const c = l[i];
          if (c === '"') {
            if (inQuotes && i + 1 < l.length && l[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
          } else if (c === ',' && !inQuotes) { fields.push(current); current = ''; }
          else current += c;
        }
        fields.push(current);
        return fields;
      });

      if (hasHeaderRow) {
        setHeaders(parsed[0]);
        setPreviewRows(parsed.slice(1, 6));
      } else {
        setHeaders(parsed[0].map((_, i) => `Column ${i + 1}`));
        setPreviewRows(parsed.slice(0, 5));
      }
      setFile(f);
      setStep(parsed[0].length >= 4 ? 'mapping' : 'preview');
    };
    reader.readAsText(f);
  }, [hasHeaderRow]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv' || f.type === 'text/plain')) {
      parseFile(f);
    } else {
      toast.error('Please drop a CSV file');
    }
  }, [parseFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) parseFile(f);
  };

  const columnFields = ['Date', 'Description', 'Amount', 'Type', 'Category'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Import Transactions</h2>
            <p className="text-sm text-muted-foreground">
              {step === 'upload' && 'Select a CSV file to import'}
              {step === 'mapping' && 'Map CSV columns to transaction fields'}
              {step === 'preview' && 'Preview parsed data'}
              {step === 'results' && 'Import complete'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="p-5 space-y-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
              }`}
            >
              <DocumentArrowUpIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drag & drop a CSV file here</p>
              <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button type="button" size="sm" variant="outline">Choose File</Button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHeaderRow}
                  onChange={(e) => setHasHeaderRow(e.target.checked)}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-sm">First row contains column headers</span>
              </label>
              <Select
                label="Target Account"
                placeholder="Select account"
                options={accounts.map((a: any) => ({ value: a.id, label: a.name }))}
                value={accountId}
                onChange={(e) => setAccountId(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Step: Column Mapping */}
        {step === 'mapping' && (
          <div className="p-5 space-y-5">
            <div className="text-xs text-muted-foreground mb-2 bg-muted rounded-lg p-3">
              <p className="font-medium mb-1">CSV Headers detected:</p>
              <p>{headers.join('  →  ')}</p>
            </div>
            <div className="space-y-4">
              {columnFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1.5">{field}</label>
                  <select
                    value={
                      field === 'Date' ? mapping.dateColumn :
                      field === 'Description' ? mapping.descriptionColumn :
                      field === 'Amount' ? mapping.amountColumn :
                      field === 'Type' ? mapping.typeColumn :
                      mapping.categoryColumn ?? -1
                    }
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMapping((prev) => ({
                        ...prev,
                        dateColumn: field === 'Date' ? v : prev.dateColumn,
                        descriptionColumn: field === 'Description' ? v : prev.descriptionColumn,
                        amountColumn: field === 'Amount' ? v : prev.amountColumn,
                        typeColumn: field === 'Type' ? v : prev.typeColumn,
                        categoryColumn: field === 'Category' ? (v >= 0 ? v : undefined) : prev.categoryColumn,
                      }));
                    }}
                    className="w-full rounded-xl border border-input bg-muted/35 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary min-h-[44px] appearance-none"
                  >
                    <option value={-1} disabled>Select column...</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h} (Column {i + 1})</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Preview */}
            {previewRows.length > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left py-1 pr-2 font-medium">#</th>
                        <th className="text-left py-1 pr-2 font-medium">Date</th>
                        <th className="text-left py-1 pr-2 font-medium">Description</th>
                        <th className="text-right py-1 pr-2 font-medium">Amount</th>
                        <th className="text-left py-1 font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-1.5 pr-2 text-muted-foreground">{i + 1}</td>
                          <td className="py-1.5 pr-2">{row[mapping.dateColumn]}</td>
                          <td className="py-1.5 pr-2 truncate max-w-[140px]">{row[mapping.descriptionColumn]}</td>
                          <td className="py-1.5 pr-2 text-right">{row[mapping.amountColumn]}</td>
                          <td className="py-1.5">{row[mapping.typeColumn]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Results */}
        {step === 'results' && result && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 text-center">
                <CheckCircleIcon className="h-8 w-8 mx-auto mb-1 text-green-500" />
                <p className="text-2xl font-bold text-green-600">{result.importedCount}</p>
                <p className="text-xs text-muted-foreground">Imported</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
                <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-1 text-amber-500" />
                <p className="text-2xl font-bold text-amber-600">{result.skippedCount + result.errors.length}</p>
                <p className="text-xs text-muted-foreground">Skipped / Errors</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Errors:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <div key={i} className="text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                      Row {err.rowNumber}: {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-border">
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button
                loading={importMutation.isPending}
                onClick={() => importMutation.mutate()}
                disabled={!accountId}
              >
                Import {previewRows.length}+ Rows
              </Button>
            </>
          )}
          {step === 'results' && (
            <Button onClick={onClose}>Done</Button>
          )}
          {step === 'upload' && (
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          )}
        </div>
      </div>
    </div>
  );
}
