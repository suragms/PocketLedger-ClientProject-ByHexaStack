import Spinner from '../ui/Spinner';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
