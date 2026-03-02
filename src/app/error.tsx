'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">Please try again. If the issue persists, contact support.</p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
