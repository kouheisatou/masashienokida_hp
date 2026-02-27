'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { setSnackbarHandler } from '@/lib/snackbar';

type SnackbarVariant = 'success' | 'error';

type SnackbarContextValue = {
  showSnackbar: (message: string, variant?: SnackbarVariant) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

const AUTO_HIDE_MS = 3000;

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackBarProvider');
  return ctx;
}

export function SnackBarProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<SnackbarVariant>('success');

  const show = useCallback((msg: string, v: SnackbarVariant = 'success') => {
    setMessage(msg);
    setVariant(v);
    setVisible(true);
    setTimeout(() => setVisible(false), AUTO_HIDE_MS);
  }, []);

  useEffect(() => {
    setSnackbarHandler(show);
    return () => setSnackbarHandler(null);
  }, [show]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar: show }}>
      {children}
      {/* SnackBar UI */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div
          className={`px-6 py-4 rounded-sm shadow-card flex items-center gap-3 ${
            variant === 'success'
              ? 'bg-burgundy-light border border-burgundy-accent text-beige'
              : 'bg-red-900/30 border border-red-700 text-red-200'
          }`}
        >
          {variant === 'success' ? (
            <CheckCircle size={20} className="text-burgundy-accent" />
          ) : (
            <AlertCircle size={20} className="text-red-400" />
          )}
          <p className="text-sm tracking-wide">{message}</p>
        </div>
      </div>
    </SnackbarContext.Provider>
  );
}
