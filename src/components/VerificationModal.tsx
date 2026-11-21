import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';
import { ModalVariant } from '../types';

export type { ModalVariant };

export interface VerificationModalProps {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  type,
  title,
  message,
  confirmText = 'Tamam',
  cancelText = 'Vazgeç',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: AlertCircle,
          iconContainer: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
          confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20 shadow-lg',
          topBorder: 'border-t-rose-500',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconContainer: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
          confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20 shadow-lg',
          topBorder: 'border-t-amber-500',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconContainer: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 shadow-lg',
          topBorder: 'border-t-emerald-500',
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconContainer: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
          confirmBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 shadow-lg',
          topBorder: 'border-t-blue-500',
        };
    }
  };

  const currentStyles = getVariantStyles();
  const IconComponent = currentStyles.icon;
  const defaultTitle = type === 'confirm' ? 'İşlem Onayı' : 'Bilgilendirme';

  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col gap-5 border-t-2 ${currentStyles.topBorder} animate-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Section */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${currentStyles.iconContainer}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {title || defaultTitle}
            </h3>
            <p className="mt-1.5 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          {type === 'confirm' && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition border border-slate-700/60"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition ${currentStyles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
