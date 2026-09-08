import { useContext } from 'react';
import { ToastContext, type ToastContextType } from './ToastContext';

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
