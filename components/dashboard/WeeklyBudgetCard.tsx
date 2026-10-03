import Link from "next/link";
import { ChevronRight, Lightbulb, TriangleAlert } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function WeeklyBudgetCard({ limit, spent, available }: { limit: number | null; spent: number | null; available: number | null }) {
  const percentage = limit && spent !== null && limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const exceeded = limit !== null && spent !== null && spent >= limit;
  return (
    <div className="overflow-hidden rounded-3xl border border-[#FCD34D] bg-gradient-to-br from-[#F4E0A5] to-[#FDE68A] p-5 shadow-[0_8px_24px_rgba(180,140,60,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/60 text-[#D97706]"><Lightbulb size={19} /></span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#B45309]">Teto da semana</p>
            <p className="mt-1 text-sm text-[#92400E]">Você ainda pode gastar</p>
            <h3 className="mt-0.5 text-2xl font-bold text-[#78350F] md:text-3xl">{formatCurrency(available)}</h3>
            <p className="mt-0.5 text-xs text-[#B45309]">esta semana</p>
          </div>
        </div>
        <Link href="/relatorios" className="hidden shrink-0 items-center gap-1 rounded-full bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#92400E] transition hover:bg-white sm:flex">
          Ver detalhes <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/50"><div className={`h-full rounded-full ${exceeded ? "bg-[#DC2626]" : "bg-[#D97706]"}`} style={{ width: `${percentage}%` }} /></div>
      <div className="mt-3 flex items-center justify-between text-xs text-[#92400E]">
        <span>Gastei: {formatCurrency(spent)}</span>
        <span>Teto: {formatCurrency(limit)}</span>
      </div>
      <Link href="/relatorios" className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#92400E] sm:hidden">
        Ver detalhes <ChevronRight size={14} />
      </Link>
      {limit === null ? (
        <p className="mt-3 text-xs text-[#B45309]">Complete o diagnóstico financeiro para calcular seu teto da semana.</p>
      ) : exceeded ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]"><TriangleAlert size={14} /> Atenção: teto atingido este mês.</p>
      ) : (
        <p className="mt-3 text-xs text-[#B45309]">Este teto é fixado no diagnóstico e não muda diariamente. O disponível diminui conforme seus gastos da semana.</p>
      )}
    </div>
  );
}
