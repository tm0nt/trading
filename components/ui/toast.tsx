"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const ToastProvider = React.createContext<{
  open: (props: ToastProps) => void;
  close: (id: string) => void;
}>({
  open: () => {},
  close: () => {},
});

export const useToast = () => React.useContext(ToastProvider);

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
} & VariantProps<typeof toastVariants>;

// Melhorado o toastVariants para um design mais moderno e visualmente atraente
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-lg border p-4 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border-[#2a2a2a] bg-[#1a1a1a] text-white shadow-md",
        success:
          "border-l-4 border-l-[rgb(1,219,151)] border-t border-r border-b border-[#2a2a2a] bg-[#121212] text-white shadow-[0_0_10px_rgba(1,219,151,0.1)]",
        error:
          "border-l-4 border-l-[rgb(204,2,77)] border-t border-r border-b border-[#2a2a2a] bg-[#121212] text-white shadow-[0_0_10px_rgba(204,2,77,0.1)]",
        warning:
          "border-l-4 border-l-[rgb(255,170,0)] border-t border-r border-b border-[#2a2a2a] bg-[#121212] text-white shadow-[0_0_10px_rgba(255,170,0,0.1)]",
        info: "border-l-4 border-l-[#3b82f6] border-t border-r border-b border-[#2a2a2a] bg-[#121212] text-white shadow-[0_0_10px_rgba(59,130,246,0.1)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Componente Toast melhorado com ícones e melhor organização visual
export function Toast({
  id,
  title,
  description,
  action,
  variant,
  onClose,
}: ToastProps & { onClose?: () => void }) {
  // Função para renderizar o ícone apropriado com base na variante
  const renderIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-[rgb(1,219,151)]" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-[rgb(204,2,77)]" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-[rgb(255,170,0)]" />;
      case "info":
        return <Info className="h-5 w-5 text-[#3b82f6]" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(toastVariants({ variant }))}>
      <div className="flex items-start gap-3">
        {renderIcon()}
        <div className="flex-1">
          {title && (
            <div
              className={cn(
                "text-sm font-semibold",
                variant === "success" && "text-[rgb(1,219,151)]",
                variant === "error" && "text-[rgb(204,2,77)]",
                variant === "warning" && "text-[rgb(255,170,0)]",
                variant === "info" && "text-[#3b82f6]",
              )}
            >
              {title}
            </div>
          )}
          {description && (
            <div className="mt-1 text-sm text-white opacity-90">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {action}
        <button
          onClick={onClose}
          className="rounded-full p-1 text-white opacity-70 transition-opacity hover:bg-[#2a2a2a] hover:opacity-100 focus:outline-none"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// Container de Toast melhorado com animações mais suaves
export function ToastContainer({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>(
    [],
  );

  const open = React.useCallback(
    (props: ToastProps) => {
      const id = props.id || Math.random().toString(36).substring(2, 9);
      const duration = props.duration || 5000;

      setToasts((prev) => [...prev, { ...props, id }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);

      return id;
    },
    [setToasts],
  );

  const close = React.useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [setToasts],
  );

  return (
    <ToastProvider.Provider value={{ open, close }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 md:max-w-[420px]">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => close(toast.id)} />
        ))}
      </div>
    </ToastProvider.Provider>
  );
}
