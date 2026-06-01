import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { X, Loader2 } from 'lucide-react';
import { cn, mediaUrl } from '@/lib/api';

// ── Button ──────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'soft';
type BtnSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading, icon, full, children, className, disabled, ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-500/30';
  const sizes = { xs: 'px-2.5 py-1 text-xs', sm: 'px-3.5 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };
  const variants = {
    primary: 'gradient-brand text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-brand-100 text-brand-700 hover:bg-brand-200',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700',
    outline: 'bg-transparent border-2 border-brand-500 text-brand-600 hover:bg-brand-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    soft: 'bg-brand-50 text-brand-600 hover:bg-brand-100',
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], full && 'w-full', className)}
      disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ── Avatar ──────────────────────────────────────────────────────
interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  online?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name = '?', size = 40, online, className }) => {
  const [err, setErr] = useState(false);
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316'];
  const bg = colors[(name.charCodeAt(0) || 0) % colors.length];
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const url = src ? mediaUrl(src) : '';

  return (
    <div className={cn('relative flex-shrink-0', className)} style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-white flex items-center justify-center font-bold text-white"
        style={{ background: bg, fontSize: size * 0.36 }}>
        {url && !err
          ? <img src={url} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
          : initials}
      </div>
      {online !== undefined && (
        <span className={cn('absolute bottom-0.5 right-0.5 rounded-full border-2 border-white',
          online ? 'bg-green-500' : 'bg-gray-400')}
          style={{ width: size * 0.28, height: size * 0.28 }} />
      )}
    </div>
  );
};

// ── Card ─────────────────────────────────────────────────────────
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
  <div onClick={onClick} className={cn('bg-white dark:bg-gray-900 dark:border-gray-800 rounded-2xl border border-indigo-50 shadow-sm shadow-indigo-900/5', onClick && 'cursor-pointer hover:shadow-md transition-shadow', className)}>
    {children}
  </div>
);

// ── Input ────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, leftIcon, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>}
    <div className="relative">
      {leftIcon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</span>}
      <input className={cn('w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm bg-gray-50 transition-all outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-brand-500/10',
        leftIcon && 'pl-10', error && 'border-red-400', className)} {...props} />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// ── Textarea ─────────────────────────────────────────────────────
export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>}
    <textarea className={cn('w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm bg-gray-50 resize-none outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-brand-500/10 transition-all', className)} {...props} />
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────
export const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = '#6366f1', className }) => (
  <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold', className)}
    style={{ background: `${color}18`, color }}>
    {children}
  </span>
);

// ── Modal ─────────────────────────────────────────────────────────
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => (
  <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
    <AnimatePresence>
      {open && (
        <Dialog.Portal forceMount>
          <Dialog.Overlay asChild>
            <motion.div className="fixed inset-0 bg-black/50 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <motion.div className={cn('fixed inset-0 z-50 flex items-center justify-center p-4')}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}>
              <motion.div className={cn('bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full overflow-y-auto max-h-[90vh]', maxWidth)}
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <Dialog.Title className="text-xl font-bold dark:text-white">{title}</Dialog.Title>
                  <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="p-6">{children}</div>
              </motion.div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </AnimatePresence>
  </Dialog.Root>
);

// ── Spinner ───────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <Loader2 className={cn('animate-spin text-brand-500', className)} style={{ width: size, height: size }} />
);

// ── Tooltip ───────────────────────────────────────────────────────
export const Tooltip: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <TooltipPrimitive.Provider>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg">
        {label}
        <TooltipPrimitive.Arrow className="fill-gray-900" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);

// ── Tabs ─────────────────────────────────────────────────────────
export const TabBar: React.FC<{
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}> = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 w-fit">
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
          active === t.id ? 'gradient-brand text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
        {t.icon}{t.label}
      </button>
    ))}
  </div>
);
