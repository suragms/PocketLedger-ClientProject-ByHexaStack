import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../../api/transactions.api';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { PhotoIcon, CameraIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Transaction } from '../../types';

interface ReceiptUploadProps {
  transaction: Transaction;
  onUpdate?: (transaction: Transaction) => void;
}

export default function ReceiptUpload({ transaction, onUpdate }: ReceiptUploadProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const currentUrl = objectUrlRef.current;
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, []);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => transactionsApi.uploadReceipt(transaction.id, file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Receipt uploaded');
      onUpdate?.(response.data);
    },
    onError: () => toast.error('Failed to upload receipt'),
  });

  const removeMutation = useMutation({
    mutationFn: () => transactionsApi.removeReceipt(transaction.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Receipt removed');
      onUpdate?.(response.data);
    },
    onError: () => toast.error('Failed to remove receipt'),
  });

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, and HEIC files are allowed');
      return;
    }
    uploadMutation.mutate(file);
  }, [uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleCameraCapture = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  }, [handleFileSelect]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Receipt</label>

      {transaction.receiptUrl ? (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border">
            <img
              src={transaction.receiptThumbnailUrl || transaction.receiptUrl}
              alt="Receipt"
              className="w-full h-48 object-cover cursor-pointer"
              onClick={() => setShowPreview(true)}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => setShowPreview(true)}
                className="p-1.5 rounded-lg bg-background/80 backdrop-blur hover:bg-background"
                aria-label="View receipt"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (confirm('Remove receipt?')) removeMutation.mutate(); }}
                className="p-1.5 rounded-lg bg-background/80 backdrop-blur hover:bg-background text-destructive"
                aria-label="Remove receipt"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}`}
          role="region"
          aria-label="Receipt upload area"
        >
          <PhotoIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-muted-foreground mb-3">Drag & drop a receipt image, or</p>
          <div className="flex gap-2 justify-center">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <PhotoIcon className="h-4 w-4 mr-1" aria-hidden="true" />Choose File
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleCameraCapture}>
              <CameraIcon className="h-4 w-4 mr-1" aria-hidden="true" />Take Photo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">JPEG, PNG, WebP, or HEIC (max 10MB)</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileInputChange}
        aria-hidden="true"
      />

      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Receipt Preview" size="lg">
        <div className="relative">
          <img src={transaction.receiptUrl!} alt="Receipt" className="w-full rounded-lg" />
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 backdrop-blur hover:bg-background"
            aria-label="Close preview"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </Modal>
    </div>
  );
}
