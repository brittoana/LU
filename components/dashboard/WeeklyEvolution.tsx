import { TrendingDown, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type { WeekEvolution } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

export default function WeeklyEvolution({ evolution }: { evolution: WeekEvolution }) {
  const max = Math.max(1, ...evolution.days.map((d) => d.amount));
  const hasData = evolution.days.some((d) => d.amount > 0);

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-[#2C1E18]">Evolução semanal</h3></div>
      {!hasData ? (
        <EmptyState title="Sem gastos nesta semana" text="Os gastos de segunda a sexta aparecerão aqui como um gráfico de barras." />
      ) : (
        <>
          <div className="flex h-32 items-end justify-between gap-2">
            {evolution.days.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-2" title={formatCurrency(day.amount)}>
                <div className="flex h-24 w-full items-end overflow-hidden rounded-lg bg-[#F4E0A5]">
                  <div
                    className={`w-full rounded-lg transition-all ${day.isToday ? "bg-[#D97706]" : "bg-[#A5B97B]"}`}
                    style={{ height: `${Math.max(6, Math.round((day.amount / max) * 100))}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-semibold text-[#2C1E18]">{day.label}</p>
                  <p className="text-[10px] text-[#A08E82]">{day.dateLabel}</p>
                </div>
              </div>
            ))}
          </div>
          {evolution.changePercent !== null && (
            <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${evolution.changePercent <= 0 ? "bg-[#E6EED3] text-[#556B2F]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
              {evolution.changePercent <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {evolution.changePercent > 0 ? "+" : ""}{evolution.changePercent}% em relação à semana anterior
            </div>
          )}
        </>
      )}
    </Card>
  );
}
