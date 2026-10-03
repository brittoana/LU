"use client";

import Button from "@/components/ui/Button";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4" role="presentation" onMouseDown={onCancel}>
      <div
        className="glass-strong w-full max-w-sm rounded-3xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-[#2C1E18]">{title}</h2>
        <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-[#7B6A5D]">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-2xl border border-[#E7DDD2] px-4 py-3 text-sm font-semibold text-[#3E2723]">Cancelar</button>
          <Button type="button" onClick={onConfirm} className={destructive ? "bg-[#DC2626] hover:bg-[#B91C1C]" : ""}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
