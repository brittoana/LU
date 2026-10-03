import { CheckCircle2 } from "lucide-react";
import type { OnboardingSummary } from "@/lib/onboarding";
import type { BudgetSuggestion } from "@/lib/budget";
import AreaBudgetList from "@/components/budget/AreaBudgetList";
import { formatCurrency } from "@/lib/format";

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-[#EFEBE4] p-4">
      <p className="text-xs uppercase tracking-wide text-[#7B6A5D]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#6B8E23]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#7B6A5D]">{hint}</p>}
    </div>
  );
}

export default function StepResult({ summary, suggestion }: { summary: OnboardingSummary; suggestion: BudgetSuggestion }) {
  const percent = summary.committedPercent === null ? null : Math.round(summary.committedPercent);
  return (
    <div>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EED3] text-[#556B2F]"><CheckCircle2 /></div>
      <h1 className="text-2xl font-bold">Pronto!</h1>
      <p className="mt-2 text-sm text-[#7B6A5D]">Com essas informações, o Luma já consegue mostrar:</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Row label="Quanto entra por mês" value={formatCurrency(summary.monthlyIncome)} />
        <Row label="Renda já comprometida" value={formatCurrency(summary.committedTotal)} hint={percent === null ? undefined : `${percent}% da sua renda`} />
        <Row label="Parcelamentos ainda a pagar" value={formatCurrency(summary.installmentsOutstanding)} hint={`${formatCurrency(summary.installmentsMonthly)} por mês`} />
        <Row label="Sobra aproximada" value={formatCurrency(summary.leftover)} hint="Para outros gastos e objetivos" />
      </div>
      <div className="mt-4 rounded-2xl border border-[#E7DDD2] p-4">
        <p className="font-semibold">Seus principais gastos fixos</p>
        {summary.topExpenses.length === 0 ? (
          <p className="mt-1 text-sm text-[#7B6A5D]">Nenhuma despesa fixa informada.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {summary.topExpenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-[#3E2723]">{e.name} <span className="text-[#7B6A5D]">· {e.category}</span></span><b className="shrink-0">{formatCurrency(e.amount)}</b></li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 rounded-2xl border border-[#E7DDD2] p-4">
        <p className="font-semibold">Quanto você pode gastar por área</p>
        <p className="mb-3 mt-1 text-xs text-[#7B6A5D]">Sugestão mensal calculada com a sua sobra, depois das despesas fixas e dos parcelamentos.</p>
        <AreaBudgetList suggestion={suggestion} />
      </div>
    </div>
  );
}
