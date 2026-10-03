"use client";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import YesNo from "@/components/quiz/YesNo";
import { newIncomeRow, type IncomeRow, type OnboardingDraft } from "@/lib/onboarding";

export default function StepIncome({ draft, update }: { draft: OnboardingDraft; update: (patch: Partial<OnboardingDraft>) => void }) {
  const setRow = (id: string, patch: Partial<IncomeRow>) => update({ otherIncomes: draft.otherIncomes.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const removeRow = (id: string) => {
    const next = draft.otherIncomes.filter((r) => r.id !== id);
    update({ otherIncomes: next.length ? next : [newIncomeRow()] });
  };

  return (
    <div>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EED3] text-[#556B2F]"><Sparkles /></div>
      <h1 className="text-2xl font-bold">Vamos conhecer um pouco da sua vida financeira</h1>
      <p className="mt-2 text-sm text-[#7B6A5D]">São só algumas informações para o Luma montar uma visão inicial das suas finanças. Você poderá alterar tudo depois.</p>

      <h2 className="mt-8 text-lg font-bold">1. Quanto entra por mês?</h2>
      <div className="mt-4 space-y-5">
        <div>
          <Input label="Qual é a sua principal renda mensal? Salário líquido" prefix="R$" type="number" min="0" step="0.01" value={draft.salary} onChange={(e) => update({ salary: e.target.value })} placeholder="0,00" />
          <p className="mt-2 text-xs text-[#7B6A5D]">Valor que realmente entra na sua conta depois dos descontos.</p>
        </div>

        <YesNo question="Recebe outras rendas todos os meses?" value={draft.hasOtherIncome} onChange={(v) => update({ hasOtherIncome: v })} />

        {draft.hasOtherIncome === "yes" && (
          <div className="space-y-3">
            {draft.otherIncomes.map((row, index) => (
              <div key={row.id} className="space-y-3 rounded-2xl border border-[#E7DDD2] bg-white/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#556B2F]">Renda {index + 1}</p>
                  {draft.otherIncomes.length > 1 && <button type="button" onClick={() => removeRow(row.id)} aria-label={`Remover renda ${index + 1}`} className="rounded-xl p-1.5 text-[#DC2626] hover:bg-[#FEE2E2]"><Trash2 size={16} /></button>}
                </div>
                <Input label="Descrição da renda" value={row.description} onChange={(e) => setRow(row.id, { description: e.target.value })} placeholder="Ex.: freelance, pensão, aluguel, comissão" />
                <Input label="Valor médio mensal" prefix="R$" type="number" min="0" step="0.01" value={row.amount} onChange={(e) => setRow(row.id, { amount: e.target.value })} placeholder="0,00" />
              </div>
            ))}
            <button type="button" onClick={() => update({ otherIncomes: [...draft.otherIncomes, newIncomeRow()] })} className="flex items-center gap-1.5 rounded-full bg-[#E6EED3] px-4 py-2 text-sm font-semibold text-[#556B2F]"><Plus size={16} /> Adicionar outra renda</button>
          </div>
        )}
      </div>
    </div>
  );
}
