'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Toast = {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
};

type ToastOptions = {
  variant?: Toast['type'];
};

type ToastContextValue = {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => string;
  removeToast: (id: string) => void;
  toast: (message: string, options?: ToastOptions) => string;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type?: Toast['type']) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4000);
      return id;
    },
    [removeToast]
  );

  const toast = useCallback(
    (message: string, options?: ToastOptions) => addToast(message, options?.variant),
    [addToast]
  );

  const value = useMemo(
    () => ({ toasts, addToast, removeToast, toast }),
    [toasts, addToast, removeToast, toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className="rounded-md bg-black/80 px-4 py-2 text-sm text-white shadow"
            role="status"
          >
            {toastItem.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
