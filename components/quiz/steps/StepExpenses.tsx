"use client";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import QuizOption from "@/components/quiz/QuizOption";
import { FIXED_EXPENSE_CATEGORIES } from "@/lib/categories";
import { newExpenseRow, type ExpenseRow, type OnboardingDraft } from "@/lib/onboarding";
import type { FixedExpenseDuration } from "@/lib/types";

const DURATIONS: { value: FixedExpenseDuration; label: string }[] = [
  { value: "indefinite", label: "Sem prazo definido" },
  { value: "5to12", label: "5 a 12 meses" },
  { value: "over12", label: "Mais de 12 meses" },
];

export const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export default function StepExpenses({ draft, update }: { draft: OnboardingDraft; update: (patch: Partial<OnboardingDraft>) => void }) {
  const setRow = (id: string, patch: Partial<ExpenseRow>) => update({ expenses: draft.expenses.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const removeRow = (id: string) => {
    const next = draft.expenses.filter((r) => r.id !== id);
    update({ expenses: next.length ? next : [newExpenseRow()] });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">2. Quais despesas já fazem parte da sua rotina?</h1>
      <p className="mt-2 text-sm text-[#7B6A5D]">Considere como despesa fixa qualquer compromisso que se repete mensalmente ou que ainda continuará por 5 meses ou mais.</p>

      <div className="mt-6 space-y-3">
        {draft.expenses.map((row, index) => (
          <div key={row.id} className="space-y-4 rounded-2xl border border-[#E7DDD2] bg-white/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#556B2F]">{index === 0 ? "Adicionar despesa fixa" : `Despesa fixa ${index + 1}`}</p>
              {draft.expenses.length > 1 && <button type="button" onClick={() => removeRow(row.id)} aria-label={`Remover despesa ${index + 1}`} className="rounded-xl p-1.5 text-[#DC2626] hover:bg-[#FEE2E2]"><Trash2 size={16} /></button>}
            </div>
            <Input label="Nome da despesa" value={row.name} onChange={(e) => setRow(row.id, { name: e.target.value })} placeholder="Ex.: aluguel, internet, academia, financiamento" />
            <Input label="Valor mensal" prefix="R$" type="number" min="0" step="0.01" value={row.amount} onChange={(e) => setRow(row.id, { amount: e.target.value })} placeholder="0,00" />
            <Select label="Categoria" value={row.category} onChange={(e) => setRow(row.id, { category: e.target.value })}>
              <option value="">Selecione</option>
              {FIXED_EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <div>
              <p className="mb-2 text-sm font-medium">Por quanto tempo essa despesa ainda continuará?</p>
              <div className="space-y-2">
                {DURATIONS.map((d) => <QuizOption key={d.value} label={d.label} selected={row.duration === d.value} onClick={() => setRow(row.id, { duration: d.value })} />)}
              </div>
            </div>
            <Select label="Dia do vencimento" value={row.dueDay} onChange={(e) => setRow(row.id, { dueDay: e.target.value })}>
              <option value="">Selecione o dia</option>
              {DAYS.map((d) => <option key={d} value={d}>Dia {d}</option>)}
            </Select>
          </div>
        ))}
        <button type="button" onClick={() => update({ expenses: [...draft.expenses, newExpenseRow()] })} className="flex items-center gap-1.5 rounded-full bg-[#E6EED3] px-4 py-2 text-sm font-semibold text-[#556B2F]"><Plus size={16} /> Adicionar outra despesa</button>
      </div>
    </div>
  );
}
