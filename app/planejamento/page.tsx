"use client";
import { useState } from "react";
import { LockKeyhole, Pencil, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import RouteGuard from "@/components/auth/RouteGuard";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { useApp } from "@/components/providers/AppProvider";
import { useToast } from "@/components/feedback/ToastProvider";
import InvestmentsSection from "@/components/investments/InvestmentsSection";
import AreaBudgetCard from "@/components/planning/AreaBudgetCard";
import { evaluateFinancialProfile } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

const stageText = { debt_priority: "Prioridade: reduzir dívidas", stabilization: "Prioridade: estabilizar o orçamento", reserve_building: "Prioridade: construir sua reserva", investing: "Prioridade: investir com consistência" } as const;

export default function PlanejamentoPage() {
  const { state, setQuizResult } = useApp();
  const toast = useToast();
  const current = state.quizResult;
  const [editingReserve, setEditingReserve] = useState(false);
  const [reserveDraft, setReserveDraft] = useState("");
  const [reserveError, setReserveError] = useState("");

  function saveReserve() {
    const value = Number(reserveDraft);
    if (reserveDraft.trim() === "" || !Number.isFinite(value) || value < 0) { setReserveError("Informe um valor igual ou maior que zero."); return; }
    if (!current) return;
    // Recalcula a etapa: ao atingir a meta, os investimentos são liberados.
    setQuizResult(evaluateFinancialProfile({ ...current, currentReserve: value }));
    setReserveError("");
    setEditingReserve(false);
    toast("Reserva atualizada!");
  }

  return (
    <RouteGuard>
      <AppShell>
        <PageHeader title="Meu plano financeiro" subtitle={current ? stageText[current.stage] : "Complete o diagnóstico para gerar seu plano"} />
        {!current ? <EmptyState title="Plano ainda não calculado" text="Complete o quiz inicial para liberar seu diagnóstico e suas metas." /> : (
          <div className="space-y-4">
            <Card className="p-4 sm:p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#E6EED3] p-3 text-[#556B2F]"><WalletCards /></div><div><p className="text-sm text-[#7B6A5D]">Sobra mensal estimada</p><p className="text-2xl font-bold text-[#6B8E23]">{formatCurrency(current.freeCashFlow)}</p></div></div></Card>
            <AreaBudgetCard />
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between"><div className="rounded-2xl bg-[#E6EED3] p-3 text-[#556B2F]"><ShieldCheck /></div>{!current.reserveUnlocked && <LockKeyhole size={18} className="text-[#D97706]" />}</div>
              <h2 className="mt-4 font-bold">Reserva de emergência</h2>
              <p className="mt-1 text-sm text-[#7B6A5D]">{current.reserveUnlocked ? `Meta estimada: ${formatCurrency(current.reserveTarget)} (${current.reserveMonths} meses de despesas essenciais).` : "Bloqueada inicialmente enquanto a prioridade é reorganizar caixa e dívidas."}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm text-[#7B6A5D]">Reserva atual: <b className="text-[#2C1E18]">{formatCurrency(current.currentReserve)}</b></p>
                {!editingReserve && <button type="button" onClick={() => { setReserveDraft(String(current.currentReserve)); setEditingReserve(true); }} className="flex items-center gap-1 rounded-full bg-[#E6EED3] px-3 py-1.5 text-xs font-semibold text-[#556B2F]"><Pencil size={13} /> Atualizar</button>}
              </div>
              {editingReserve && (
                <div className="mt-3 space-y-2">
                  <div className="field flex items-center rounded-2xl pl-4"><span className="text-sm font-semibold text-[#7B6A5D]">R$</span><input type="number" min="0" step="0.01" value={reserveDraft} onChange={(e) => setReserveDraft(e.target.value)} className="w-full bg-transparent px-3 py-3 outline-none" aria-label="Quanto você já tem de reserva" placeholder="0,00" autoFocus /></div>
                  {reserveError && <p role="alert" className="text-xs text-[#DC2626]">{reserveError}</p>}
                  <div className="flex gap-2"><button type="button" onClick={saveReserve} className="rounded-xl bg-[#6B8E23] px-4 py-2 text-xs font-semibold text-white">Salvar</button><button type="button" onClick={() => { setEditingReserve(false); setReserveError(""); }} className="rounded-xl px-3 py-2 text-xs font-semibold text-[#7B6A5D]">Cancelar</button></div>
                </div>
              )}
              {current.reserveUnlocked && current.reserveTarget > 0 && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F4E0A5]"><div className="h-full rounded-full bg-[#6B8E23]" style={{ width: `${Math.min(100, Math.round((current.currentReserve / current.reserveTarget) * 100))}%` }} /></div>
              )}
            </Card>

            {current.investmentUnlocked ? <InvestmentsSection /> : (
              <Card className="p-4 sm:p-5">
                <div className="flex items-center justify-between"><div className="rounded-2xl bg-[#F4E0A5] p-3 text-[#D97706]"><TrendingUp /></div><LockKeyhole size={18} className="text-[#D97706]" /></div>
                <h2 className="mt-4 font-bold">Investimentos</h2>
                <p className="mt-1 text-sm text-[#7B6A5D]">Assim que sua reserva de emergência atingir 100% da meta, esta área é liberada e você passa a controlar seus investimentos e datas de resgate por aqui.</p>
              </Card>
            )}
          </div>
        )}
      </AppShell>
    </RouteGuard>
  );
}
