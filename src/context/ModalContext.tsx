import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { VerificationModal } from '../components/VerificationModal';
import { ModalVariant, ConfirmOptions, AlertOptions } from '../types';

export type { ModalVariant, ConfirmOptions, AlertOptions };

export interface ModalContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
  showConfirm: (options: ConfirmOptions | string) => Promise<boolean>;
  showAlert: (options: AlertOptions | string) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'alert';
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
    resolveConfirm?: (val: boolean) => void;
    resolveAlert?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: undefined,
    message: '',
    confirmText: 'Tamam',
    cancelText: 'Vazgeç',
    variant: 'info',
  });

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
      setModalState({
        isOpen: true,
        type: 'confirm',
        title: opts.title || 'İşlem Onayı',
        message: opts.message,
        confirmText: opts.confirmText || 'Onayla',
        cancelText: opts.cancelText || 'Vazgeç',
        variant: opts.variant || 'danger',
        resolveConfirm: resolve,
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string): Promise<void> => {
    return new Promise((resolve) => {
      const opts: AlertOptions = typeof options === 'string' ? { message: options } : options;
      setModalState({
        isOpen: true,
        type: 'alert',
        title: opts.title || 'Bilgilendirme',
        message: opts.message,
        confirmText: opts.confirmText || 'Tamam',
        cancelText: 'Kapat',
        variant: opts.variant || 'warning',
        resolveAlert: resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (modalState.type === 'confirm') {
      modalState.resolveConfirm?.(true);
    } else {
      modalState.resolveAlert?.();
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, [modalState]);

  const handleCancel = useCallback(() => {
    if (modalState.type === 'confirm') {
      modalState.resolveConfirm?.(false);
    } else {
      modalState.resolveAlert?.();
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, [modalState]);

  return (
    <ModalContext.Provider
      value={{
        confirm,
        alert,
        showConfirm: confirm,
        showAlert: alert,
      }}
    >
      {children}
      <VerificationModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        variant={modalState.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
