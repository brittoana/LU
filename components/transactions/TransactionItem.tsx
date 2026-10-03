"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export default function TransactionItem({
  item,
  onEdit,
  onDelete,
}: {
  item: Transaction;
  onEdit?: (item: Transaction) => void;
  onDelete?: (item: Transaction) => void;
}) {
  const positive = item.type === "income";
  return (
    <div className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.description || item.category || "Movimentação"}</p>
        <p className="mt-1 text-xs text-[#7B6A5D]">{item.category || "Sem categoria"} · {new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR")} · {item.status === "realized" ? "Realizada" : item.status === "receivable" ? "A receber" : "Agendada"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <p className={`mr-1 font-semibold ${positive ? "text-[#556B2F]" : item.type === "expense" ? "text-[#D97706]" : "text-[#3E2723]"}`}>{positive ? "+ " : item.type === "expense" ? "- " : ""}{formatCurrency(item.amount)}</p>
        {onEdit && <button type="button" onClick={() => onEdit(item)} aria-label={`Editar ${item.description || item.category || "movimentação"}`} className="rounded-xl p-2 text-[#6D5C50] hover:bg-[#EFEBE4]"><Pencil size={17} /></button>}
        {onDelete && <button type="button" onClick={() => onDelete(item)} aria-label={`Excluir ${item.description || item.category || "movimentação"}`} className="rounded-xl p-2 text-[#DC2626] hover:bg-[#FEE2E2]"><Trash2 size={17} /></button>}
      </div>
    </div>
  );
}
