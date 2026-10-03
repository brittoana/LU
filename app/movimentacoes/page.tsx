"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import RouteGuard from "@/components/auth/RouteGuard";
import PageHeader from "@/components/layout/PageHeader";
import TransactionItem from "@/components/transactions/TransactionItem";
import TransactionEditor from "@/components/transactions/TransactionEditor";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import { useApp } from "@/components/providers/AppProvider";
import { useToast } from "@/components/feedback/ToastProvider";
import type { Transaction } from "@/lib/types";

function MovimentacoesContent() {
  const searchParams = useSearchParams();
  const { state, updateTransaction, deleteTransaction } = useApp();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense" | "debt">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("category");
    if (fromUrl) setCategoryFilter(fromUrl);
  }, [searchParams]);

  const filtered = useMemo(() => state.transactions.filter((item) =>
    (filter === "all" || item.type === filter) &&
    (!categoryFilter || item.category.toLowerCase() === categoryFilter.toLowerCase()) &&
    `${item.description} ${item.category} ${item.account}`.toLowerCase().includes(query.toLowerCase())
  ), [state.transactions, query, filter, categoryFilter]);

  return (
    <RouteGuard>
      <AppShell>
        <PageHeader title="Movimentações" subtitle="Acompanhe, edite e corrija seus lançamentos" />
        {categoryFilter && (
          <div className="glass mb-4 flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm">
            <span>Filtrando por categoria: <b className="text-[#6B8E23]">{categoryFilter}</b></span>
            <button type="button" onClick={() => setCategoryFilter(null)} aria-label="Limpar filtro de categoria" className="rounded-full p-1 hover:bg-black/5"><X size={16} /></button>
          </div>
        )}
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="field w-full rounded-2xl px-4 py-3 outline-none transition" placeholder="Buscar movimentações..." aria-label="Buscar movimentações" />
          <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filtrar movimentações" className="sm:w-48">
            <option value="all">Todas</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
            <option value="debt">Empréstimos e dívidas</option>
          </Select>
        </div>
        {filtered.length === 0 ? <EmptyState title="Nenhuma movimentação" text="Use o botão Novo para registrar sua primeira receita, despesa ou compromisso." /> : <div className="space-y-3">{filtered.map((item) => <TransactionItem key={item.id} item={item} onEdit={setEditing} onDelete={setDeleting} />)}</div>}
        <TransactionEditor transaction={editing} onClose={() => setEditing(null)} onSave={updateTransaction} />
        <ConfirmDialog open={!!deleting} title="Excluir movimentação?" description="Essa movimentação será removida do seu histórico local e os indicadores serão recalculados." confirmLabel="Excluir" destructive onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) { deleteTransaction(deleting.id); toast("Apagado!"); } setDeleting(null); }} />
      </AppShell>
    </RouteGuard>
  );
}

export default function MovimentacoesPage() {
  return (
    <Suspense fallback={null}>
      <MovimentacoesContent />
    </Suspense>
  );
}
