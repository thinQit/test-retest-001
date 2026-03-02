'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Navigation() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold" aria-label="Go to home">
          Test Retest
        </Link>
        <button
          className="md:hidden p-2 rounded-md border border-border"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <span className="block h-0.5 w-5 bg-foreground mb-1" />
          <span className="block h-0.5 w-5 bg-foreground mb-1" />
          <span className="block h-0.5 w-5 bg-foreground" />
        </button>
        <div className={cn('flex flex-col md:flex-row md:items-center gap-4 md:gap-6', open ? 'block' : 'hidden md:flex')}>
          <Link href="/#features" className="text-sm font-medium hover:text-primary">Features</Link>
          <Link href="/#contact" className="text-sm font-medium hover:text-primary">Contact</Link>
          <Link href="/admin" className="text-sm font-medium hover:text-primary">Admin</Link>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.name}</span>
              <Button size="sm" variant="outline" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <Button asChild={false} size="sm" variant="primary">
              <Link href="/admin">Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navigation;
