"use client";
import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import RouteGuard from "@/components/auth/RouteGuard";
import PageHeader from "@/components/layout/PageHeader";
import MonthSwitcher from "@/components/layout/MonthSwitcher";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import TransactionItem from "@/components/transactions/TransactionItem";
import { useApp } from "@/components/providers/AppProvider";
import { buildDashboard, monthTransactions } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

export default function RelatoriosPage() {
  const { state } = useApp();
  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const data = buildDashboard(state, selectedMonth);
  const history = monthTransactions(state, selectedMonth);
  const hasData = history.length > 0;

  return (
    <RouteGuard>
      <AppShell>
        <PageHeader
          title="Relatórios"
          subtitle="Histórico completo, mês a mês"
          trailing={<MonthSwitcher selected={selectedMonth} onSelect={setSelectedMonth} />}
        />
        {!hasData ? (
          <EmptyState title="Ainda não há dados para analisar" text="Escolha outro mês ou cadastre movimentações para este período." />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4 sm:p-5"><p className="text-sm text-[#7B6A5D]">Receitas</p><p className="mt-1 text-2xl font-bold text-[#6B8E23]">{formatCurrency(data.income)}</p></Card>
              <Card className="p-4 sm:p-5"><p className="text-sm text-[#7B6A5D]">Despesas</p><p className="mt-1 text-2xl font-bold text-[#D97706]">{formatCurrency(data.expenses)}</p></Card>
              <Card className="p-4 sm:p-5"><p className="text-sm text-[#7B6A5D]">A receber</p><p className="mt-1 text-2xl font-bold text-[#6B8E23]">{formatCurrency(data.receivable)}</p></Card>
            </div>
            <Card className="p-4 sm:p-5">
              <h2 className="font-semibold text-[#2C1E18]">Distribuição das despesas</h2>
              {data.categories.length === 0 ? (
                <div className="mt-4"><EmptyState title="Sem despesas realizadas" text="Quando houver despesas, a distribuição por categoria aparecerá aqui." /></div>
              ) : (
                <div className="mt-5 space-y-4">
                  {data.categories.map((c) => (
                    <div key={c.name}>
                      <div className="mb-1 flex justify-between text-sm text-[#2C1E18]"><span>{c.name}</span><span>{formatCurrency(c.amount)} · {c.percent}%</span></div>
                      <div className="h-2 rounded-full bg-[#F4E0A5]"><div className="h-2 rounded-full bg-[#6B8E23]" style={{ width: `${c.percent}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card className="p-4 sm:p-5">
              <h2 className="mb-4 font-semibold text-[#2C1E18]">Histórico completo do mês</h2>
              <div className="space-y-2.5">{history.map((item) => <TransactionItem key={item.id} item={item} />)}</div>
            </Card>
          </div>
        )}
      </AppShell>
    </RouteGuard>
  );
}
