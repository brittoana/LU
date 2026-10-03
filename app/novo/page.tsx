"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import RouteGuard from "@/components/auth/RouteGuard";
import PageHeader from "@/components/layout/PageHeader";
import Input from "@/components/ui/Input";
import QuickDatePicker from "@/components/ui/QuickDatePicker";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import CategorySelect from "@/components/forms/CategorySelect";
import AmountDisplay from "@/components/forms/AmountDisplay";
import { useApp } from "@/components/providers/AppProvider";
import { useToast } from "@/components/feedback/ToastProvider";
import type { TransactionStatus, TransactionType } from "@/lib/types";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NovoPage() {
  const router = useRouter();
  const { addTransaction } = useApp();
  const toast = useToast();
  const [type, setType] = useState<TransactionType>("expense");
  const [status, setStatus] = useState<TransactionStatus>("realized");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(todayISO());
  const [account, setAccount] = useState("");
  const [description, setDescription] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (!category.trim()) {
      setError("Selecione uma categoria.");
      return;
    }
    if (!date) {
      setError("Informe a data da movimentação.");
      return;
    }

    setError("");
    addTransaction({ type, status, amount: parsedAmount, category, description: description.trim(), account: account.trim(), date, recurring });
    toast("Anotado!");
    router.push("/movimentacoes");
  }

  return (
    <RouteGuard>
      <AppShell>
        <PageHeader title="Novo lançamento" subtitle="Registre seus dados reais" />
        <form onSubmit={submit} className="glass rounded-3xl p-5 sm:p-6" noValidate>
          <div className="mb-5 grid grid-cols-3 rounded-2xl bg-[#EFEBE4] p-1 text-sm">{([['expense','Saiu'],['income','Entrou'],['debt','Dívidas']] as const).map(([value,label]) => <button key={value} type="button" onClick={() => { setType(value); setCategory(""); }} className={`rounded-xl px-2 py-2 ${type===value ? 'bg-white font-semibold shadow-sm' : 'text-[#7B6A5D]'}`}>{label}</button>)}</div>
          <AmountDisplay value={amount} onChange={setAmount} />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <CategorySelect type={type} value={category} onChange={setCategory} />
            <QuickDatePicker value={date} onChange={setDate} />
            <Input label="Conta" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Conta ou carteira" />
            <Input label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva a movimentação" />
          </div>
          <div className="mt-4"><Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as TransactionStatus)}><option value="realized">Realizada</option><option value="receivable">A receber</option><option value="scheduled">Agendada</option></Select></div>
          <label className="mt-4 flex items-center justify-between rounded-2xl bg-[#EFEBE4] px-4 py-3"><span className="text-sm font-medium">Movimentação recorrente</span><input checked={recurring} onChange={(e) => setRecurring(e.target.checked)} type="checkbox" className="h-4 w-4 accent-[#6B8E23]" /></label>
          {error && <p className="mt-4 rounded-2xl bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#DC2626]" role="alert">{error}</p>}
          <Button type="submit" className="mt-6 w-full">Salvar lançamento</Button>
        </form>
      </AppShell>
    </RouteGuard>
  );
}
