"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import QuickDatePicker from "@/components/ui/QuickDatePicker";
import Select from "@/components/ui/Select";
import CategorySelect from "@/components/forms/CategorySelect";
import AmountDisplay from "@/components/forms/AmountDisplay";
import { useToast } from "@/components/feedback/ToastProvider";
import type { Transaction, TransactionStatus, TransactionType } from "@/lib/types";

export default function TransactionEditor({
  transaction,
  onSave,
  onClose,
}: {
  transaction: Transaction | null;
  onSave: (id: string, transaction: Omit<Transaction, "id">) => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const [type, setType] = useState<TransactionType>("expense");
  const [status, setStatus] = useState<TransactionStatus>("realized");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [account, setAccount] = useState("");
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!transaction) return;
    setType(transaction.type);
    setStatus(transaction.status);
    setAmount(String(transaction.amount));
    setCategory(transaction.category);
    setDate(transaction.date);
    setAccount(transaction.account);
    setDescription(transaction.description);
    setRecurring(transaction.recurring);
    setError("");
  }, [transaction]);

  if (!transaction) return null;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (!category.trim() || !date) {
      setError("Categoria e data são obrigatórias.");
      return;
    }
    if (!transaction) return;
    onSave(transaction.id, { type, status, amount: parsedAmount, category, date, account, description, recurring });
    toast("Atualizado!");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[65] overflow-y-auto bg-black/30 px-4 py-8" role="presentation" onMouseDown={onClose}>
      <form onSubmit={submit} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-transaction-title" className="glass-strong mx-auto w-full max-w-xl rounded-3xl p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div><h2 id="edit-transaction-title" className="text-xl font-bold">Editar movimentação</h2><p className="mt-1 text-sm text-[#7B6A5D]">Corrija os dados e salve as alterações.</p></div>
          <button type="button" onClick={onClose} aria-label="Fechar edição" className="rounded-full p-2 text-[#6D5C50] hover:bg-[#EFEBE4]"><X size={20} /></button>
        </div>
        <div className="mb-5 grid grid-cols-3 rounded-2xl bg-[#EFEBE4] p-1 text-sm">{([['expense','Saiu'],['income','Entrou'],['debt','Dívidas']] as const).map(([value,label]) => <button key={value} type="button" onClick={() => { setType(value); setCategory(""); }} className={`rounded-xl px-2 py-2 ${type===value ? 'bg-white font-semibold shadow-sm' : 'text-[#7B6A5D]'}`}>{label}</button>)}</div>
        <AmountDisplay value={amount} onChange={setAmount} autoFocus={false} />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <CategorySelect type={type} value={category} onChange={setCategory} />
          <QuickDatePicker value={date} onChange={setDate} />
          <Input label="Conta" value={account} onChange={(e) => setAccount(e.target.value)} />
          <Input label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mt-4"><Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as TransactionStatus)}><option value="realized">Realizada</option><option value="receivable">A receber</option><option value="scheduled">Agendada</option></Select></div>
        <label className="mt-4 flex items-center justify-between rounded-2xl bg-[#EFEBE4] px-4 py-3"><span className="text-sm font-medium">Movimentação recorrente</span><input checked={recurring} onChange={(e) => setRecurring(e.target.checked)} type="checkbox" className="h-4 w-4 accent-[#6B8E23]" /></label>
        {error && <p className="mt-4 rounded-2xl bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#DC2626]" role="alert">{error}</p>}
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-2xl border border-[#E7DDD2] px-4 py-3 text-sm font-semibold">Cancelar</button><Button type="submit">Salvar alterações</Button></div>
      </form>
    </div>
  );
}
