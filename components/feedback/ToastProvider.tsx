"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

type ToastItem = { id: number; message: string };

const ToastContext = createContext<((message: string) => void) | null>(null);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = counter.current++;
    setToasts((current) => [...current, { id, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 md:bottom-28">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="glass-strong pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#2C1E18] shadow-lg"
          >
            <CheckCircle2 size={16} className="text-[#6B8E23]" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast precisa estar dentro de ToastProvider");
  return context;
}
