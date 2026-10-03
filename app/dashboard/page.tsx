"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import RouteGuard from "@/components/auth/RouteGuard";
import PageHeader from "@/components/layout/PageHeader";
import MonthSwitcher from "@/components/layout/MonthSwitcher";
import Card from "@/components/ui/Card";
import BalanceCard from "@/components/dashboard/BalanceCard";
import SummaryMetrics from "@/components/dashboard/SummaryMetrics";
import WeeklyBudgetCard from "@/components/dashboard/WeeklyBudgetCard";
import QuickActions from "@/components/dashboard/QuickActions";
import CategorySummary from "@/components/dashboard/CategorySummary";
import WeeklyEvolution from "@/components/dashboard/WeeklyEvolution";
import UpcomingBills from "@/components/dashboard/UpcomingBills";
import TransactionItem from "@/components/transactions/TransactionItem";
import EmptyState from "@/components/ui/EmptyState";
import { useApp } from "@/components/providers/AppProvider";
import { buildDashboard, buildWeekEvolution, monthTransactions } from "@/lib/finance";

const stageText = { debt_priority: "Reduzir dívidas antes de avançar", stabilization: "Estabilizar seu orçamento", reserve_building: "Construir sua reserva de emergência", investing: "Investir com consistência" } as const;

export default function DashboardPage() {
  const { state } = useApp();
  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const isCurrentMonth = selectedMonth.getFullYear() === today.getFullYear() && selectedMonth.getMonth() === today.getMonth();
  const referenceDate = isCurrentMonth ? today : selectedMonth;

  const data = buildDashboard(state, referenceDate);
  const weekEvolution = buildWeekEvolution(state, referenceDate);
  const history = monthTransactions(state, selectedMonth);

  const greeting = state.user?.name ? `Olá, ${state.user.name.split(" ")[0]}!` : "Olá!";

  return (
    <RouteGuard>
      <AppShell>
        <PageHeader
          title={
            <span>
              <span className="block text-xl font-bold leading-tight text-[#2C1E18] md:text-2xl">{greeting}</span>
              <span className="block text-xs font-normal text-[#7B6A5D]">Seu resumo financeiro</span>
            </span>
          }
          trailing={<MonthSwitcher selected={selectedMonth} onSelect={setSelectedMonth} />}
        />
        <div className="space-y-3 sm:space-y-4">
          {isCurrentMonth ? (
            <>
              {/* Card 1 — destaque principal: teto da semana */}
              <WeeklyBudgetCard limit={data.weeklyLimit} spent={data.weeklySpent} available={data.weeklyAvailable} />

              {/* Card 2 — destaque secundário: próximos vencimentos */}
              <UpcomingBills items={data.upcoming} />

              <Card className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr]">
                <BalanceCard balance={data.balance} available={data.available} committed={data.committed} />
                <SummaryMetrics income={data.income} expenses={data.expenses} receivable={data.receivable} />
              </Card>

              <QuickActions />

              <Link href="/planejamento" className="glass flex items-center justify-between rounded-3xl p-4 sm:p-5">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-[#7B6A5D]">Prioridade financeira</p><p className="mt-1 font-bold text-[#6B8E23]">{state.quizResult ? stageText[state.quizResult.stage] : "Complete seu diagnóstico financeiro"}</p></div>
                <ChevronRight className="text-[#556B2F]" />
              </Link>

              <Link href="/relatorios" className="glass hidden items-center justify-between rounded-3xl p-5 sm:flex">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-[#7B6A5D]">Quer ver mais?</p><p className="mt-1 font-bold text-[#2C1E18]">Gráficos, categorias e histórico completo</p></div>
                <ChevronRight className="text-[#556B2F]" />
              </Link>
            </>
          ) : (
            <>
              <Card className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr]">
                <BalanceCard balance={data.balance} available={data.available} committed={data.committed} />
                <SummaryMetrics income={data.income} expenses={data.expenses} receivable={data.receivable} />
              </Card>
              <QuickActions />
              <div className="grid gap-4 lg:grid-cols-2"><CategorySummary categories={data.categories} /><WeeklyEvolution evolution={weekEvolution} /></div>
              <Card className="p-4 sm:p-5">
                <h3 className="mb-4 font-semibold text-[#2C1E18]">Histórico completo do mês</h3>
                {history.length === 0 ? (
                  <EmptyState title="Sem movimentações neste mês" text="Escolha outro mês no seletor acima ou registre uma nova movimentação." />
                ) : (
                  <div className="space-y-2.5">{history.map((item) => <TransactionItem key={item.id} item={item} />)}</div>
                )}
              </Card>
            </>
          )}
        </div>
      </AppShell>
    </RouteGuard>
  );
}
